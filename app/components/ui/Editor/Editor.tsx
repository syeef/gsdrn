import * as React from "react";
import YooptaEditor, {
  createYooptaEditor,
  useBlockData,
  useYooptaEditor,
} from "@yoopta/editor";
import type {
  YooptaContentValue,
  YooEditor,
  PluginElementRenderProps,
} from "@yoopta/editor";
import { BulletedList, TodoList } from "@yoopta/lists";
import type { TodoListElementProps } from "@yoopta/lists";
import {
  Editor as SlateEditor,
  Element as SlateElement,
  Path as SlatePath,
  Point as SlatePoint,
  Range as SlateRange,
  Transforms as SlateTransforms,
} from "slate";
import Link from "@yoopta/link";
import { Bold, Italic, Underline, Strike, CodeMark } from "@yoopta/marks";
import { SlashCommandMenu, FloatingBlockActions } from "@yoopta/ui";
import {
  IconBookmark,
  IconDotGridVertical2x3,
  IconDotsHorizontal,
  IconSearch,
  IconTag,
} from "~/components/ui/Icons/Icons";
import {
  isLabelColor,
  normalizeLabelName,
  validateLabelName,
  type LabelDto,
} from "~/utils/labels";
import Button from "~/components/ui/Button/Button";
import { ShinyButton } from "~/components/ui/Button/ShinyButton";
import { authClient } from "~/lib/auth.client";
import styles from "./Editor.module.css";

export type EditorMode = "notes" | "todos";

type EditorProps = {
  mode: EditorMode;
  dateKey?: string;
  saveSignal?: number;
  onSaveStart?: () => void;
  onSaveEnd?: () => void;
  onCanonicalSaveError?: (mode: EditorMode) => void;
  onCanonicalSaveSuccess?: (mode: EditorMode) => void;
};

type DraftRecord = {
  content: YooptaContentValue;
  updatedAt: number;
  syncedAt?: number;
  canonicalSyncedAt?: number;
};

type SaveOptions = {
  force?: boolean;
  showIndicator?: boolean;
};

type PersistResponse =
  | { ok: true; updatedAt: number | null | undefined }
  | { ok: false; status: number; body: string };
type SaveResult = {
  canonicalOk: boolean;
  canonicalStatus: number | null;
  canonicalBody?: string | null;
};

type DragState = { blockId: string; draggedIds: Set<string> } | null;
type DropTargetState = { index: number; y: number; depth: number } | null;
type MenuPosition = { top: number; left: number };
type BlockMenuView = "root" | "labels";
type MenuLabelItem = LabelDto & { assigned: boolean };
type ItemLabel = Pick<LabelDto, "id" | "name" | "color">;
type ItemLabelsById = Record<string, ItemLabel[]>;
type ScheduleToastKind = "success" | "error";
type ScheduleToastState = { message: string; kind: ScheduleToastKind } | null;
type TaskScheduleApiResponse =
  | {
      ok: true;
      scheduledStart: string;
      scheduledEnd: string;
      estimatedMinutes: number;
      calendarId: string;
      eventId: string;
    }
  | {
      ok: false;
      code:
        | "NEEDS_GOOGLE_WRITE_SCOPE"
        | "TASK_NOT_FOUND"
        | "TASK_DONE"
        | "NO_SLOT_FOUND"
        | "CALENDAR_NOT_CONNECTED"
        | "FORBIDDEN"
        | "INTERNAL";
      error?: string;
    };

const STORAGE_PREFIX = "gsdrn:editor:draft";
const INPUT_PLACEHOLDER = 'Start typing or press "/" for commands';
const BLOCK_MENU_GAP = 8;
const BLOCK_MENU_EDGE_PADDING = 8;
const BLOCK_MENU_MIN_WIDTH = 160;

const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getLocalTimeZone = () => {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return typeof timeZone === "string" && timeZone.trim().length > 0
      ? timeZone
      : "UTC";
  } catch {
    return "UTC";
  }
};

const getStorageKey = (mode: EditorMode, dateKey: string) =>
  `${STORAGE_PREFIX}:${mode}:${dateKey}`;

const createNodeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

type RichTextChild = { text?: string; children?: RichTextChild[] };

const getRichTextFromChildren = (children: RichTextChild[] = []): string => {
  return children
    .map((child) => {
      if (typeof child.text === "string") return child.text;
      if (Array.isArray(child.children))
        return getRichTextFromChildren(child.children);
      return "";
    })
    .join("");
};

const isElementTextEmpty = (
  element: { children?: RichTextChild[] } | null | undefined,
) => {
  if (!element) return true;
  return getRichTextFromChildren(element.children ?? []).trim() === "";
};

// Yoopta's editor.isEmpty() only returns true for Paragraph blocks, not
// BulletedList/TodoList. We use our own check instead.
const isEditorEffectivelyEmpty = (editor: YooEditor): boolean => {
  const value = editor.getEditorValue();
  const blocks = Object.values(value);
  if (blocks.length === 0) return true;
  if (blocks.length > 1) return false;
  const element = (blocks[0].value[0] as any) ?? null;
  if (!element) return true;
  const children: Array<{ text?: string }> = element.children ?? [];
  return children.every((child) => !child.text || child.text.trim() === "");
};

const readDraft = (key: string): DraftRecord | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DraftRecord;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.content || typeof parsed.updatedAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeDraft = (key: string, record: DraftRecord) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(record));
  } catch {
    // Ignore write failures (private mode, quota exceeded, etc.)
  }
};

const isStaleFormat = (content: unknown): boolean => {
  // Detect old TipTap JSONContent format and discard it
  return !!(
    content &&
    typeof content === "object" &&
    (content as any).type === "doc"
  );
};

const readApiError = async (response: Response, fallback: string) => {
  const parsed = (await response.json().catch(() => null)) as {
    error?: unknown;
    body?: unknown;
  } | null;
  if (parsed?.error && typeof parsed.error === "string") return parsed.error;
  if (parsed?.body && typeof parsed.body === "string") return parsed.body;
  const text = await response.text().catch(() => "");
  return text || fallback;
};

const getDefaultNotesContent = (): YooptaContentValue => {
  const blockId = createNodeId();
  const elemId = createNodeId();
  return {
    [blockId]: {
      id: blockId,
      type: "BulletedList",
      value: [
        {
          id: elemId,
          type: "bulleted-list",
          children: [{ text: "" }],
          props: { nodeType: "block" },
        } as any,
      ],
      meta: { order: 0, depth: 0 },
    },
  };
};

const getDefaultTodosContent = (): YooptaContentValue => {
  const blockId = createNodeId();
  const elemId = createNodeId();
  return {
    [blockId]: {
      id: blockId,
      type: "TodoList",
      value: [
        {
          id: elemId,
          type: "todo-list",
          children: [{ text: "" }],
          props: { checked: false, nodeType: "block" },
        } as any,
      ],
      meta: { order: 0, depth: 0 },
    },
  };
};

// Context used to let plugin render components trigger a save.
const CheckboxSaveContext = React.createContext<(() => void) | null>(null);
const ItemLabelsContext = React.createContext<ItemLabelsById>({});

function ItemLabels({ labels }: { labels: ItemLabel[] }) {
  if (labels.length === 0) return null;
  return (
    <div className={styles.itemLabels} contentEditable={false}>
      {labels.map((label) => (
        <span key={label.id} className={styles.itemLabelChip}>
          <span
            className={styles.itemLabelDot}
            style={{ backgroundColor: `var(--${label.color}-6)` }}
            aria-hidden
          />
          <span className={styles.itemLabelText}>{label.name}</span>
        </span>
      ))}
    </div>
  );
}

// ─── Custom element renders ───────────────────────────────────────────────────

function BulletedListElement({
  attributes,
  children,
  blockId,
}: PluginElementRenderProps) {
  const block = useBlockData(blockId);
  const itemLabelsById = React.useContext(ItemLabelsContext);
  const depth = block?.meta?.depth ?? 0;
  const element =
    (block?.value?.[0] as { children?: RichTextChild[] } | undefined) ?? null;
  const isEmpty = isElementTextEmpty(element);
  const labels = itemLabelsById[blockId] ?? [];
  return (
    <ul
      {...attributes}
      data-block-id={blockId}
      className={styles.bulletedListEl}
      style={{ marginLeft: depth > 0 ? `${depth * 1.4}rem` : undefined }}
    >
      <li
        className={styles.bulletedListItem}
        data-empty={isEmpty ? "true" : "false"}
      >
        <div className={styles.itemTailRow}>
          <div className={styles.itemMain}>
            <div
              className={styles.bulletedListContent}
              data-empty={isEmpty ? "true" : "false"}
              data-placeholder={INPUT_PLACEHOLDER}
            >
              {children}
            </div>
          </div>
          <ItemLabels labels={labels} />
        </div>
      </li>
    </ul>
  );
}

function TodoListElement({
  attributes,
  children,
  element,
  blockId,
}: PluginElementRenderProps) {
  const editor = useYooptaEditor();
  const block = useBlockData(blockId);
  const triggerSave = React.useContext(CheckboxSaveContext);
  const itemLabelsById = React.useContext(ItemLabelsContext);
  const depth = block?.meta?.depth ?? 0;
  const checked = Boolean((element.props as TodoListElementProps)?.checked);
  const isEmpty = isElementTextEmpty(
    (element as unknown as { children?: RichTextChild[] } | undefined) ?? null,
  );
  const labels = itemLabelsById[blockId] ?? [];

  const handleToggle = React.useCallback(() => {
    // Yoopta defers syncing the Slate operation back to editor.children via
    // window.scheduler.postTask(background) when the Scheduler API is present.
    // If we read getEditorValue() synchronously after updateElement() we see
    // stale data → hasSameContent = true → save is skipped entirely.
    //
    // Fix: subscribe to 'change' before update, then verify this element
    // actually reached the expected checked state before triggering save.
    // This avoids saving too early on unrelated/intermediate change events.
    const nextChecked = !checked;
    let timeoutId: number | null = null;

    const cleanup = () => {
      editor.off("change", onEditorChange);
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const hasExpectedCheckedValue = () => {
      const updatedElement = editor.getElement({
        blockId,
        type: "todo-list",
        match: (candidate) => candidate.id === element.id,
      });
      const currentChecked = Boolean(
        (updatedElement?.props as TodoListElementProps | undefined)?.checked,
      );
      return currentChecked === nextChecked;
    };

    const saveIfReady = () => {
      if (!hasExpectedCheckedValue()) return false;
      cleanup();
      triggerSave?.();
      return true;
    };

    const onEditorChange = () => {
      void saveIfReady();
    };

    editor.on("change", onEditorChange);

    editor.updateElement({
      blockId,
      type: "todo-list",
      match: (candidate) => candidate.id === element.id,
      props: { checked: nextChecked },
    });

    // Bounded fallback for edge cases where a change event is not emitted.
    timeoutId = window.setTimeout(() => {
      if (saveIfReady()) return;
      cleanup();
      triggerSave?.();
    }, 700);
  }, [editor, blockId, checked, element.id, triggerSave]);

  return (
    <ul
      {...attributes}
      data-block-id={blockId}
      className={styles.todoListEl}
      style={{ marginLeft: depth > 0 ? `${depth * 1.4}rem` : undefined }}
    >
      <li
        className={styles.todoListItem}
        data-checked={checked}
        data-empty={isEmpty ? "true" : "false"}
      >
        <label className={styles.todoLabel} contentEditable={false}>
          <input
            type="checkbox"
            checked={checked}
            onChange={handleToggle}
            className={styles.todoCheckboxInput}
            aria-label="Toggle task"
          />
          <span className={styles.todoCheckboxCustom} />
        </label>
        <div
          className={styles.todoContent}
          data-empty={isEmpty ? "true" : "false"}
          data-placeholder={INPUT_PLACEHOLDER}
        >
          <div className={styles.itemTailRow}>
            <div className={styles.itemMain}>{children}</div>
            <ItemLabels labels={labels} />
          </div>
        </div>
      </li>
    </ul>
  );
}

// Extended plugins with custom renders
const CustomBulletedList = BulletedList.extend({
  elements: {
    "bulleted-list": {
      render: BulletedListElement,
    },
  },
});

const CustomTodoList = TodoList.extend({
  elements: {
    "todo-list": {
      render: TodoListElement,
    },
  },
});

const MARKS = [Bold, Italic, CodeMark, Strike, Underline];

// ─── Drag-and-drop helpers ────────────────────────────────────────────────────

// Returns the blockId of the dragged block plus all immediately following
// descendant blocks (those with depth > dragged block's depth, contiguously).
function getBlockGroup(blockId: string, value: YooptaContentValue): string[] {
  const sorted = Object.values(value).sort(
    (a, b) => a.meta.order - b.meta.order,
  );
  const startIdx = sorted.findIndex((b) => b.id === blockId);
  if (startIdx === -1) return [blockId];
  const depth = sorted[startIdx].meta.depth;
  const group: string[] = [sorted[startIdx].id];
  for (let i = startIdx + 1; i < sorted.length; i++) {
    if (sorted[i].meta.depth > depth) {
      group.push(sorted[i].id);
    } else {
      break;
    }
  }
  return group;
}

// Returns a new YooptaContentValue with the dragged block (and its subtree)
// moved so that it appears before the block at `insertBeforeIndex` in
// meta.order-sorted order.
function reorderBlocks(
  value: YooptaContentValue,
  draggingBlockId: string,
  insertBeforeIndex: number,
  targetDepth?: number,
): YooptaContentValue {
  const sorted = Object.values(value).sort(
    (a, b) => a.meta.order - b.meta.order,
  );
  const groupIds = new Set(getBlockGroup(draggingBlockId, value));

  // If the user dragged horizontally to request a specific depth, apply the
  // delta to the whole group so children move relative to their parent.
  const rawGroup = sorted.filter((b) => groupIds.has(b.id));
  const group =
    targetDepth !== undefined
      ? (() => {
          const delta = targetDepth - rawGroup[0].meta.depth;
          return rawGroup.map((b) => ({
            ...b,
            meta: { ...b.meta, depth: Math.max(0, b.meta.depth + delta) },
          }));
        })()
      : rawGroup;
  const remaining = sorted.filter((b) => !groupIds.has(b.id));

  const groupStart = sorted.findIndex((b) => b.id === draggingBlockId);
  const groupEnd = groupStart + group.length;

  let insertAt: number;
  if (insertBeforeIndex >= groupEnd) {
    // Drop target is after the group
    insertAt = insertBeforeIndex - group.length;
  } else if (insertBeforeIndex <= groupStart) {
    // Drop target is before or at the group start
    insertAt = insertBeforeIndex;
  } else {
    // Drop target is within the group — keep group in place
    insertAt = groupStart;
  }

  insertAt = Math.max(0, Math.min(insertAt, remaining.length));

  const newSorted = [
    ...remaining.slice(0, insertAt),
    ...group,
    ...remaining.slice(insertAt),
  ];

  // Normalize depths: a block's depth can be at most (prevBlock.depth + 1).
  // When a block is clamped the reduction propagates naturally because
  // subsequent iterations use the already-clamped prevDepth.
  const normalizedDepths: number[] = [];
  for (let i = 0; i < newSorted.length; i++) {
    const prevDepth = i === 0 ? -1 : normalizedDepths[i - 1];
    normalizedDepths.push(Math.min(newSorted[i].meta.depth, prevDepth + 1));
  }

  const newValue: YooptaContentValue = {};
  for (let i = 0; i < newSorted.length; i++) {
    const block = newSorted[i];
    newValue[block.id] = {
      ...block,
      meta: { ...block.meta, order: i, depth: normalizedDepths[i] },
    };
  }
  return newValue;
}

function normalizeBlocks(value: YooptaContentValue): YooptaContentValue {
  const sorted = Object.values(value).sort(
    (a, b) => a.meta.order - b.meta.order,
  );
  const normalizedDepths: number[] = [];

  const normalized: YooptaContentValue = {};
  for (let i = 0; i < sorted.length; i++) {
    const prevDepth = i === 0 ? -1 : normalizedDepths[i - 1];
    const depth = Math.max(0, Math.min(sorted[i].meta.depth, prevDepth + 1));
    normalizedDepths.push(depth);
    normalized[sorted[i].id] = {
      ...sorted[i],
      meta: { ...sorted[i].meta, order: i, depth },
    };
  }

  return normalized;
}

function removeBlockWithSubtree(
  value: YooptaContentValue,
  blockId: string,
  mode: EditorMode,
): YooptaContentValue {
  if (!value[blockId]) return value;

  const idsToDelete = new Set(getBlockGroup(blockId, value));
  const filtered: YooptaContentValue = {};

  for (const [id, block] of Object.entries(value)) {
    if (idsToDelete.has(id)) continue;
    filtered[id] = block;
  }

  if (Object.keys(filtered).length === 0) {
    return mode === "todos"
      ? getDefaultTodosContent()
      : getDefaultNotesContent();
  }

  return normalizeBlocks(filtered);
}

// ─── Editor component ─────────────────────────────────────────────────────────

export default function Editor({
  mode,
  dateKey,
  saveSignal,
  onSaveStart,
  onSaveEnd,
  onCanonicalSaveError,
  onCanonicalSaveSuccess,
}: EditorProps) {
  const lastSavedRef = React.useRef<Record<EditorMode, string | null>>({
    notes: null,
    todos: null,
  });
  const lastSaveSignalRef = React.useRef<number | null>(null);
  const hydratedRef = React.useRef<Record<EditorMode, boolean>>({
    notes: false,
    todos: false,
  });
  const resolvedDateKey = React.useMemo(
    () => dateKey ?? getLocalDateKey(new Date()),
    [dateKey],
  );

  const [blockMenuOpen, setBlockMenuOpen] = React.useState(false);
  const [blockMenuView, setBlockMenuView] =
    React.useState<BlockMenuView>("root");
  const [activeBlockId, setActiveBlockId] = React.useState<string | null>(null);
  const blockMenuRef = React.useRef<HTMLDivElement>(null);
  const blockMenuAnchorRef = React.useRef<HTMLElement | null>(null);
  const [blockMenuPosition, setBlockMenuPosition] =
    React.useState<MenuPosition>({
      top: 0,
      left: 0,
    });
  const [blockMenuError, setBlockMenuError] = React.useState<string | null>(
    null,
  );
  const [labelsSearch, setLabelsSearch] = React.useState("");
  const [labelsLoading, setLabelsLoading] = React.useState(false);
  const [labelsCreating, setLabelsCreating] = React.useState(false);
  const [labelMutationIds, setLabelMutationIds] = React.useState<Set<string>>(
    new Set(),
  );
  const [menuLabels, setMenuLabels] = React.useState<MenuLabelItem[]>([]);
  const [itemLabelsById, setItemLabelsById] = React.useState<ItemLabelsById>(
    {},
  );
  const [hasUserInteracted, setHasUserInteracted] = React.useState(false);
  const [schedulePending, setSchedulePending] = React.useState(false);
  const [scheduleToast, setScheduleToast] =
    React.useState<ScheduleToastState>(null);
  const [calendarScopeDialogOpen, setCalendarScopeDialogOpen] =
    React.useState(false);
  const [calendarScopeDialogPending, setCalendarScopeDialogPending] =
    React.useState(false);
  const toastTimeoutRef = React.useRef<number | null>(null);

  const [dragState, setDragState] = React.useState<DragState>(null);
  const [dropTarget, setDropTarget] = React.useState<DropTargetState>(null);
  const editorSectionRef = React.useRef<HTMLElement | null>(null);
  const lastFocusLossSaveAtRef = React.useRef(0);
  const inFlightSaveRef = React.useRef<
    Record<EditorMode, Promise<SaveResult> | null>
  >({
    notes: null,
    todos: null,
  });
  // Cached once on dragstart: left edge of the content area and px per indent level.
  const dragMetricsRef = React.useRef<{
    contentLeft: number;
    indentPx: number;
  } | null>(null);

  const notesEditor = React.useMemo(
    () =>
      createYooptaEditor({
        plugins: [CustomBulletedList, Link],
        marks: MARKS,
      }),
    [],
  );

  const todosEditor = React.useMemo(
    () =>
      createYooptaEditor({
        plugins: [CustomTodoList, Link],
        marks: MARKS,
      }),
    [],
  );

  const activeEditor: YooEditor = mode === "todos" ? todosEditor : notesEditor;

  const showScheduleToast = React.useCallback(
    (message: string, kind: ScheduleToastKind) => {
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current);
      }
      setScheduleToast({ message, kind });
      toastTimeoutRef.current = window.setTimeout(() => {
        setScheduleToast(null);
        toastTimeoutRef.current = null;
      }, 4200);
    },
    [],
  );

  const saveEditorContent = React.useCallback(
    async (
      editorInstance: YooEditor,
      saveMode: EditorMode,
      options?: SaveOptions,
    ): Promise<SaveResult> => {
      const inFlight = inFlightSaveRef.current[saveMode];
      if (inFlight) return inFlight;

      const savePromise = (async (): Promise<SaveResult> => {
        const content = editorInstance.getEditorValue();
        const contentString = JSON.stringify(content);
        const storageKey = getStorageKey(saveMode, resolvedDateKey);
        const existing = readDraft(storageKey);
        const hasSameContent = lastSavedRef.current[saveMode] === contentString;
        const now = Date.now();
        let updatedAt = existing?.updatedAt ?? 0;

        if (!hasSameContent || !existing) {
          writeDraft(storageKey, {
            content,
            updatedAt: now,
            syncedAt: existing?.syncedAt,
            canonicalSyncedAt: existing?.canonicalSyncedAt,
          });
          lastSavedRef.current[saveMode] = contentString;
          updatedAt = now;
        }

        const force = options?.force === true;
        const showIndicator = options?.showIndicator !== false;
        const draftNeedsSync =
          !existing || !existing.syncedAt || existing.syncedAt < updatedAt;
        const canonicalNeedsSync =
          force ||
          !existing ||
          !existing.canonicalSyncedAt ||
          existing.canonicalSyncedAt < updatedAt;

        if (!draftNeedsSync && !canonicalNeedsSync) {
          return {
            canonicalOk: true,
            canonicalStatus: null,
            canonicalBody: null,
          };
        }

        const updateLocal = (patch: Partial<DraftRecord>) => {
          const latest = readDraft(storageKey);
          if (!latest) return;
          writeDraft(storageKey, { ...latest, ...patch });
        };

        const result: SaveResult = {
          canonicalOk: true,
          canonicalStatus: null,
          canonicalBody: null,
        };

        if (showIndicator) {
          onSaveStart?.();
        }

        const requestPersist = async (
          endpoint: "/api/editorDraft" | "/api/editorContent",
        ): Promise<PersistResponse> => {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode: saveMode,
              date: resolvedDateKey,
              content,
            }),
            keepalive: true,
          });

          if (!response.ok) {
            const body = await response.text().catch(() => "");
            return { ok: false, status: response.status, body };
          }

          const parsed = (await response.json().catch(() => null)) as {
            updatedAt?: number;
          } | null;
          return { ok: true, updatedAt: parsed?.updatedAt };
        };

        try {
          // Persist sequentially to avoid write contention on D1/SQLite.
          const draftResponse = draftNeedsSync
            ? await requestPersist("/api/editorDraft")
            : null;
          const canonicalResponse = canonicalNeedsSync
            ? await requestPersist("/api/editorContent")
            : null;

          if (
            draftResponse?.ok &&
            typeof draftResponse.updatedAt === "number"
          ) {
            updateLocal({ syncedAt: draftResponse.updatedAt });
          } else if (draftResponse?.ok) {
            console.error("Editor draft sync returned no updatedAt", {
              mode: saveMode,
              date: resolvedDateKey,
            });
          } else if (draftResponse && !draftResponse.ok) {
            console.error("Editor draft sync failed", {
              mode: saveMode,
              date: resolvedDateKey,
              status: draftResponse.status,
              body: draftResponse.body,
            });
          }

          if (
            canonicalResponse?.ok &&
            typeof canonicalResponse.updatedAt === "number"
          ) {
            updateLocal({ canonicalSyncedAt: canonicalResponse.updatedAt });
            onCanonicalSaveSuccess?.(saveMode);
          } else if (canonicalResponse?.ok) {
            result.canonicalOk = false;
            result.canonicalStatus = 200;
            console.error("Editor canonical sync returned no updatedAt", {
              mode: saveMode,
              date: resolvedDateKey,
            });
            onCanonicalSaveError?.(saveMode);
          } else if (canonicalResponse && !canonicalResponse.ok) {
            result.canonicalOk = false;
            result.canonicalStatus = canonicalResponse.status;
            result.canonicalBody = canonicalResponse.body;
            console.error("Editor canonical sync failed", {
              mode: saveMode,
              date: resolvedDateKey,
              status: canonicalResponse.status,
              body: canonicalResponse.body,
            });
            onCanonicalSaveError?.(saveMode);
          }
        } catch (error) {
          // Network failure: keep local draft, retry next time.
          if (canonicalNeedsSync) {
            result.canonicalOk = false;
            onCanonicalSaveError?.(saveMode);
          }
          console.error("Editor save request failed", {
            mode: saveMode,
            date: resolvedDateKey,
            error: error instanceof Error ? error.message : String(error),
          });
        } finally {
          if (showIndicator) {
            onSaveEnd?.();
          }
        }

        return result;
      })();

      inFlightSaveRef.current[saveMode] = savePromise;
      try {
        return await savePromise;
      } finally {
        if (inFlightSaveRef.current[saveMode] === savePromise) {
          inFlightSaveRef.current[saveMode] = null;
        }
      }
    },
    [
      resolvedDateKey,
      onSaveStart,
      onSaveEnd,
      onCanonicalSaveError,
      onCanonicalSaveSuccess,
    ],
  );

  const trimTrailingEmptyBlocks = React.useCallback(
    (editorInstance: YooEditor) => {
      const value = editorInstance.getEditorValue();
      const orderedBlocks = Object.values(value).sort(
        (a, b) => a.meta.order - b.meta.order,
      );
      if (orderedBlocks.length <= 1) return false;

      const trailingEmptyIds: string[] = [];
      for (let i = orderedBlocks.length - 1; i >= 1; i -= 1) {
        const block = orderedBlocks[i];
        const element =
          (block.value?.[0] as { children?: RichTextChild[] } | undefined) ??
          null;
        if (!isElementTextEmpty(element)) break;
        trailingEmptyIds.push(block.id);
      }

      if (trailingEmptyIds.length === 0) return false;

      editorInstance.batchOperations(() => {
        trailingEmptyIds.forEach((blockId) => {
          editorInstance.deleteBlock({
            blockId,
            focus: false,
            focusTarget: "none",
          });
        });
      });

      return true;
    },
    [],
  );

  const triggerFocusLossSave = React.useCallback(
    (editorInstance: YooEditor, saveMode: EditorMode) => {
      const now = Date.now();
      // Avoid duplicate saves when multiple focus-loss events fire together.
      if (now - lastFocusLossSaveAtRef.current < 250) return;
      lastFocusLossSaveAtRef.current = now;
      trimTrailingEmptyBlocks(editorInstance);
      if (isEditorEffectivelyEmpty(editorInstance)) {
        setHasUserInteracted(false);
      }
      void saveEditorContent(editorInstance, saveMode, {
        force: true,
        showIndicator: true,
      });
    },
    [saveEditorContent, trimTrailingEmptyBlocks],
  );

  const hydrateEditor = React.useCallback(
    async (editorInstance: YooEditor, hydrateMode: EditorMode) => {
      if (hydratedRef.current[hydrateMode]) return;
      hydratedRef.current[hydrateMode] = true;

      const storageKey = getStorageKey(hydrateMode, resolvedDateKey);
      const localDraft = readDraft(storageKey);

      const localIsStale = isStaleFormat(localDraft?.content);

      if (
        localDraft?.content &&
        !localIsStale &&
        isEditorEffectivelyEmpty(editorInstance)
      ) {
        editorInstance.setEditorValue(localDraft.content);
        lastSavedRef.current[hydrateMode] = JSON.stringify(localDraft.content);
      }

      try {
        const todayQuery =
          hydrateMode === "todos"
            ? `&today=${encodeURIComponent(getLocalDateKey(new Date()))}&tz=${encodeURIComponent(
                getLocalTimeZone(),
              )}`
            : "";
        const response = await fetch(
          `/api/editorContent?mode=${hydrateMode}&date=${resolvedDateKey}${todayQuery}`,
        );
        if (!response.ok) return;
        const data = (await response.json().catch(() => null)) as {
          content?: YooptaContentValue | null;
          updatedAt?: number | null;
        } | null;

        if (!data || !data.content || !data.updatedAt) {
          if (
            localDraft &&
            !localIsStale &&
            (!localDraft.canonicalSyncedAt ||
              localDraft.canonicalSyncedAt < localDraft.updatedAt)
          ) {
            await saveEditorContent(editorInstance, hydrateMode, {
              showIndicator: false,
            });
          }
          return;
        }

        const serverContent = data.content;
        if (isStaleFormat(serverContent)) return;

        const serverUpdatedAt = data.updatedAt;
        const localUpdatedAt = localDraft?.updatedAt ?? 0;

        if (!localDraft || serverUpdatedAt > localUpdatedAt) {
          if (isEditorEffectivelyEmpty(editorInstance)) {
            editorInstance.setEditorValue(serverContent);
          }
          writeDraft(storageKey, {
            content: serverContent,
            updatedAt: serverUpdatedAt,
            syncedAt: localDraft?.syncedAt,
            canonicalSyncedAt: serverUpdatedAt,
          });
          lastSavedRef.current[hydrateMode] = JSON.stringify(serverContent);
          return;
        }

        if (
          !localDraft.canonicalSyncedAt ||
          localDraft.canonicalSyncedAt < localDraft.updatedAt
        ) {
          await saveEditorContent(editorInstance, hydrateMode, {
            showIndicator: false,
          });
        }
      } catch {
        // Offline: rely on local draft.
      }
    },
    [resolvedDateKey, saveEditorContent],
  );

  const updateBlockMenuPosition = React.useCallback(() => {
    const anchor = blockMenuAnchorRef.current;
    if (!anchor) return;
    const anchorRect = anchor.getBoundingClientRect();
    const menuWidth = blockMenuRef.current?.offsetWidth ?? BLOCK_MENU_MIN_WIDTH;
    const menuHeight = blockMenuRef.current?.offsetHeight ?? 0;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = anchorRect.right + BLOCK_MENU_GAP;
    if (left + menuWidth > viewportWidth - BLOCK_MENU_EDGE_PADDING) {
      left = anchorRect.left - menuWidth - BLOCK_MENU_GAP;
    }
    left = Math.max(BLOCK_MENU_EDGE_PADDING, left);

    const maxTop = Math.max(
      BLOCK_MENU_EDGE_PADDING,
      viewportHeight - menuHeight - BLOCK_MENU_EDGE_PADDING,
    );
    const top = Math.min(
      Math.max(BLOCK_MENU_EDGE_PADDING, anchorRect.top),
      maxTop,
    );

    setBlockMenuPosition({ top, left });
  }, []);

  const openBlockMenu = React.useCallback(
    (blockId: string | null, anchorEl: HTMLElement | null) => {
      if (!blockId || !anchorEl) return;
      blockMenuAnchorRef.current = anchorEl;
      const anchorRect = anchorEl.getBoundingClientRect();
      setBlockMenuPosition({
        top: Math.max(BLOCK_MENU_EDGE_PADDING, anchorRect.top),
        left: anchorRect.right + BLOCK_MENU_GAP,
      });
      setActiveBlockId(blockId);
      setBlockMenuView("root");
      setBlockMenuError(null);
      setLabelsSearch("");
      setLabelsLoading(false);
      setLabelsCreating(false);
      setLabelMutationIds(new Set());
      setMenuLabels([]);
      setBlockMenuOpen(true);
    },
    [],
  );

  const closeBlockMenu = React.useCallback(() => {
    setBlockMenuOpen(false);
    setBlockMenuView("root");
    setBlockMenuError(null);
    setLabelsSearch("");
    setLabelsLoading(false);
    setLabelsCreating(false);
    setLabelMutationIds(new Set());
    setMenuLabels([]);
    setActiveBlockId(null);
    blockMenuAnchorRef.current = null;
  }, []);

  const handleDeleteBlock = React.useCallback(() => {
    if (!activeBlockId) return;
    const currentValue = activeEditor.getEditorValue();
    const removedIds = new Set(getBlockGroup(activeBlockId, currentValue));

    const nextValue = removeBlockWithSubtree(currentValue, activeBlockId, mode);
    activeEditor.setEditorValue(nextValue);
    setItemLabelsById((current) => {
      const next: ItemLabelsById = {};
      for (const [blockId, labels] of Object.entries(current)) {
        if (removedIds.has(blockId)) continue;
        next[blockId] = labels;
      }
      return next;
    });
    closeBlockMenu();

    if (isEditorEffectivelyEmpty(activeEditor)) {
      setHasUserInteracted(false);
    }

    void saveEditorContent(activeEditor, mode, {
      force: true,
      showIndicator: true,
    });
  }, [activeBlockId, activeEditor, mode, closeBlockMenu, saveEditorContent]);

  const setLabelMutationPending = React.useCallback(
    (labelId: string, pending: boolean) => {
      setLabelMutationIds((current) => {
        const next = new Set(current);
        if (pending) {
          next.add(labelId);
        } else {
          next.delete(labelId);
        }
        return next;
      });
    },
    [],
  );

  const loadMenuLabels = React.useCallback(
    async (query: string, signal?: AbortSignal) => {
      if (!activeBlockId) return;
      setLabelsLoading(true);

      const params = new URLSearchParams({
        mode,
        itemId: activeBlockId,
      });
      const normalized = normalizeLabelName(query);
      if (normalized.length > 0) {
        params.set("q", normalized);
      }

      try {
        const response = await fetch(`/api/labels?${params.toString()}`, {
          signal,
        });
        if (!response.ok) {
          const error = await readApiError(response, "Failed to load labels.");
          setBlockMenuError(error);
          return;
        }

        const data = (await response.json().catch(() => null)) as {
          ok?: unknown;
          labels?: Array<LabelDto & { assigned?: unknown }>;
        } | null;

        if (!data || data.ok !== true || !Array.isArray(data.labels)) {
          setBlockMenuError("Failed to load labels.");
          return;
        }

        const next = data.labels.map((row) => ({
          ...row,
          assigned: Boolean(row.assigned),
        }));
        setMenuLabels(next);
        setBlockMenuError(null);
      } catch (error) {
        if ((error as { name?: string })?.name === "AbortError") return;
        setBlockMenuError("Failed to load labels.");
      } finally {
        if (!signal?.aborted) {
          setLabelsLoading(false);
        }
      }
    },
    [activeBlockId, mode],
  );

  const loadItemLabelsForDate = React.useCallback(
    async (signal?: AbortSignal) => {
      const params = new URLSearchParams({
        mode,
        date: resolvedDateKey,
      });

      try {
        const response = await fetch(
          `/api/labelAssignments?${params.toString()}`,
          {
            signal,
          },
        );
        if (!response.ok) return;

        const data = (await response.json().catch(() => null)) as {
          ok?: unknown;
          itemLabels?: Record<
            string,
            Array<{ id?: unknown; name?: unknown; color?: unknown }>
          >;
        } | null;
        if (
          !data ||
          data.ok !== true ||
          !data.itemLabels ||
          typeof data.itemLabels !== "object"
        ) {
          return;
        }

        const next: ItemLabelsById = {};
        for (const [itemId, labels] of Object.entries(data.itemLabels)) {
          if (!Array.isArray(labels)) continue;
          next[itemId] = labels
            .map((label) => ({
              id: typeof label.id === "string" ? label.id : "",
              name: typeof label.name === "string" ? label.name : "",
              color: isLabelColor(label.color) ? label.color : "gray",
            }))
            .filter((label) => label.id.length > 0 && label.name.length > 0);
        }

        setItemLabelsById(next);
      } catch (error) {
        if ((error as { name?: string })?.name === "AbortError") return;
      }
    },
    [mode, resolvedDateKey],
  );

  const handleOpenLabelsMenu = React.useCallback(
    async (targetBlockId?: string) => {
      const blockId = targetBlockId ?? activeBlockId;
      if (!blockId) return;
      const activeBlock = activeEditor.getEditorValue()[blockId];
      const element =
        (activeBlock?.value?.[0] as
          | { children?: RichTextChild[] }
          | undefined) ?? null;
      if (isElementTextEmpty(element)) {
        setBlockMenuError("Add text to this item before applying labels.");
        return;
      }

      trimTrailingEmptyBlocks(activeEditor);
      setBlockMenuError(null);
      let saveResult = await saveEditorContent(activeEditor, mode, {
        force: true,
        showIndicator: true,
      });

      // Yoopta can defer internal state flushes; retry once after the next task.
      if (!saveResult.canonicalOk) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, 120));
        saveResult = await saveEditorContent(activeEditor, mode, {
          force: true,
          showIndicator: true,
        });
      }

      if (!saveResult.canonicalOk) {
        setBlockMenuError(
          saveResult.canonicalStatus
            ? `Couldn't sync this item before opening labels (HTTP ${saveResult.canonicalStatus}${
                saveResult.canonicalBody ? `: ${saveResult.canonicalBody}` : ""
              }). Please try again.`
            : "Couldn't sync this item before opening labels. Please try again.",
        );
        return;
      }

      setActiveBlockId(blockId);
      setLabelsSearch("");
      setMenuLabels([]);
      setBlockMenuView("labels");
    },
    [
      activeBlockId,
      activeEditor,
      mode,
      saveEditorContent,
      trimTrailingEmptyBlocks,
    ],
  );

  const handleToggleMenuLabel = React.useCallback(
    async (labelRow: MenuLabelItem) => {
      if (!activeBlockId || labelMutationIds.has(labelRow.id) || labelsCreating)
        return;

      const wasAssigned = labelRow.assigned;
      const nextIntent = wasAssigned ? "unassign" : "assign";
      setLabelMutationPending(labelRow.id, true);
      setBlockMenuError(null);
      setMenuLabels((current) =>
        current.map((row) =>
          row.id === labelRow.id ? { ...row, assigned: !wasAssigned } : row,
        ),
      );

      try {
        const response = await fetch("/api/labelAssignments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intent: nextIntent,
            mode,
            itemId: activeBlockId,
            labelId: labelRow.id,
          }),
        });

        if (!response.ok) {
          const error = await readApiError(
            response,
            "Failed to update label assignment.",
          );
          throw new Error(error);
        }

        const data = (await response.json().catch(() => null)) as {
          ok?: unknown;
          assignedLabelIds?: unknown;
          assignedLabels?: Array<{
            id?: unknown;
            name?: unknown;
            color?: unknown;
          }>;
        } | null;
        if (
          !data ||
          data.ok !== true ||
          !Array.isArray(data.assignedLabelIds)
        ) {
          throw new Error("Failed to update label assignment.");
        }

        const assignedIds = new Set(
          data.assignedLabelIds.filter(
            (id): id is string => typeof id === "string",
          ),
        );
        setMenuLabels((current) =>
          current.map((row) => ({
            ...row,
            assigned: assignedIds.has(row.id),
          })),
        );

        if (Array.isArray(data.assignedLabels) && activeBlockId) {
          const nextAssigned = data.assignedLabels
            .map((row) => ({
              id: typeof row.id === "string" ? row.id : "",
              name: typeof row.name === "string" ? row.name : "",
              color: isLabelColor(row.color) ? row.color : "gray",
            }))
            .filter((row) => row.id.length > 0 && row.name.length > 0);
          setItemLabelsById((current) => ({
            ...current,
            [activeBlockId]: nextAssigned,
          }));
        }
      } catch (error) {
        setMenuLabels((current) =>
          current.map((row) =>
            row.id === labelRow.id ? { ...row, assigned: wasAssigned } : row,
          ),
        );
        setBlockMenuError(
          error instanceof Error
            ? error.message
            : "Failed to update label assignment.",
        );
      } finally {
        setLabelMutationPending(labelRow.id, false);
      }
    },
    [
      activeBlockId,
      labelMutationIds,
      labelsCreating,
      mode,
      setLabelMutationPending,
    ],
  );

  const createCandidate = React.useMemo(() => {
    const validated = validateLabelName(labelsSearch);
    if (!validated.ok) return null;
    const exists = menuLabels.some(
      (row) => normalizeLabelName(row.name) === validated.normalizedName,
    );
    if (exists) return null;
    return validated;
  }, [labelsSearch, menuLabels]);

  const handleCreateAndAssignLabel = React.useCallback(async () => {
    if (!activeBlockId || !createCandidate || labelsCreating) return;

    setLabelsCreating(true);
    setBlockMenuError(null);
    try {
      const createResponse = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "create",
          name: createCandidate.name,
          color: "gray",
        }),
      });

      if (!createResponse.ok) {
        const error = await readApiError(
          createResponse,
          "Failed to create label.",
        );
        throw new Error(error);
      }

      const createData = (await createResponse.json().catch(() => null)) as {
        ok?: unknown;
        label?: { id?: unknown };
      } | null;

      const createdLabelId = createData?.label?.id;
      if (
        !createData ||
        createData.ok !== true ||
        typeof createdLabelId !== "string" ||
        createdLabelId.length === 0
      ) {
        throw new Error("Failed to create label.");
      }

      const assignResponse = await fetch("/api/labelAssignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: "assign",
          mode,
          itemId: activeBlockId,
          labelId: createdLabelId,
        }),
      });

      if (!assignResponse.ok) {
        const error = await readApiError(
          assignResponse,
          "Failed to assign label.",
        );
        throw new Error(error);
      }

      const assignData = (await assignResponse.json().catch(() => null)) as {
        ok?: unknown;
        assignedLabels?: Array<{
          id?: unknown;
          name?: unknown;
          color?: unknown;
        }>;
      } | null;

      if (
        assignData?.ok === true &&
        Array.isArray(assignData.assignedLabels) &&
        activeBlockId
      ) {
        const nextAssigned = assignData.assignedLabels
          .map((row) => ({
            id: typeof row.id === "string" ? row.id : "",
            name: typeof row.name === "string" ? row.name : "",
            color: isLabelColor(row.color) ? row.color : "gray",
          }))
          .filter((row) => row.id.length > 0 && row.name.length > 0);
        setItemLabelsById((current) => ({
          ...current,
          [activeBlockId]: nextAssigned,
        }));
      }

      setLabelsSearch(createCandidate.name);
      await loadMenuLabels(createCandidate.name);
    } catch (error) {
      setBlockMenuError(
        error instanceof Error ? error.message : "Failed to create label.",
      );
    } finally {
      setLabelsCreating(false);
    }
  }, [activeBlockId, createCandidate, labelsCreating, loadMenuLabels, mode]);

  const handleBackToRootBlockMenu = React.useCallback(() => {
    setBlockMenuView("root");
    setBlockMenuError(null);
    setLabelsLoading(false);
  }, []);

  const handleScheduleTask = React.useCallback(async () => {
    if (mode !== "todos") return;
    if (!activeBlockId || schedulePending) return;

    const activeBlock = activeEditor.getEditorValue()[activeBlockId];
    const element =
      (activeBlock?.value?.[0] as { children?: RichTextChild[] } | undefined) ??
      null;
    if (isElementTextEmpty(element)) {
      setBlockMenuError("Add text to this task before scheduling.");
      return;
    }

    setSchedulePending(true);
    setBlockMenuError(null);

    try {
      trimTrailingEmptyBlocks(activeEditor);

      let saveResult = await saveEditorContent(activeEditor, "todos", {
        force: true,
        showIndicator: true,
      });
      if (!saveResult.canonicalOk) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, 120));
        saveResult = await saveEditorContent(activeEditor, "todos", {
          force: true,
          showIndicator: true,
        });
      }
      if (!saveResult.canonicalOk) {
        const syncError = "Sync this task first, then try scheduling again.";
        setBlockMenuError(syncError);
        showScheduleToast(syncError, "error");
        return;
      }

      const timeZone = getLocalTimeZone();
      const scheduleOnce =
        async (): Promise<TaskScheduleApiResponse | null> => {
          const response = await fetch("/api/taskSchedule", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              taskId: activeBlockId,
              timeZone,
            }),
          });
          return (await response
            .json()
            .catch(() => null)) as TaskScheduleApiResponse | null;
        };

      let payload = await scheduleOnce();
      if (!payload) {
        const unknownError = "Failed to schedule task.";
        setBlockMenuError(unknownError);
        showScheduleToast(unknownError, "error");
        return;
      }

      if (!payload.ok && payload.code === "NEEDS_GOOGLE_WRITE_SCOPE") {
        setCalendarScopeDialogOpen(true);
        return;
      }

      if (!payload.ok) {
        const message =
          payload.code === "NO_SLOT_FOUND"
            ? "No available slot found in your preferred hours this week."
            : payload.code === "TASK_DONE"
              ? "This task is already complete."
              : payload.code === "TASK_NOT_FOUND"
                ? "Task not found. Refresh and try again."
                : payload.code === "CALENDAR_NOT_CONNECTED"
                  ? "Google Calendar is not connected."
                  : payload.code === "FORBIDDEN"
                    ? "Scheduling is unavailable for this account."
                    : (payload.error ?? "Failed to schedule task.");
        setBlockMenuError(message);
        showScheduleToast(message, "error");
        return;
      }

      const start = new Date(payload.scheduledStart);
      const end = new Date(payload.scheduledEnd);
      const formatter = new Intl.DateTimeFormat([], {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
      const message = `Scheduled ${formatter.format(start)} to ${formatter.format(end)}.`;
      showScheduleToast(message, "success");
      closeBlockMenu();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to schedule task.";
      setBlockMenuError(message);
      showScheduleToast(message, "error");
    } finally {
      setSchedulePending(false);
    }
  }, [
    activeBlockId,
    activeEditor,
    closeBlockMenu,
    mode,
    saveEditorContent,
    schedulePending,
    showScheduleToast,
    trimTrailingEmptyBlocks,
  ]);

  const handleCalendarScopeDialogCancel = React.useCallback(() => {
    if (calendarScopeDialogPending) return;
    setCalendarScopeDialogOpen(false);
  }, [calendarScopeDialogPending]);

  const handleCalendarScopeDialogAllow = React.useCallback(async () => {
    if (calendarScopeDialogPending) return;

    setCalendarScopeDialogPending(true);
    try {
      const callbackURL =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.search}`
          : undefined;
      await authClient.linkSocial({
        provider: "google",
        callbackURL,
        scopes: [
          "https://www.googleapis.com/auth/calendar.readonly",
          "https://www.googleapis.com/auth/calendar.events",
        ],
      });
      setCalendarScopeDialogOpen(false);
      await handleScheduleTask();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to request calendar access.";
      setBlockMenuError(message);
      showScheduleToast(message, "error");
    } finally {
      setCalendarScopeDialogPending(false);
    }
  }, [calendarScopeDialogPending, handleScheduleTask, showScheduleToast]);

  const markEditorInteracted = React.useCallback(() => {
    setHasUserInteracted((current) => (current ? current : true));
  }, []);

  const handleTypeOutsideLink = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.defaultPrevented) return false;
      if (event.metaKey || event.ctrlKey || event.altKey) return false;
      if (event.key.length !== 1) return false;
      if (event.nativeEvent.isComposing) return false;
      if (!activeEditor.isFocused()) return false;

      const currentOrder = activeEditor.path.current;
      if (typeof currentOrder !== "number") return false;

      const currentBlock = Object.values(activeEditor.children).find(
        (block) => block.meta.order === currentOrder,
      );
      if (!currentBlock) return false;

      const slate = activeEditor.blockEditorsMap[currentBlock.id];
      if (!slate?.selection || !SlateRange.isCollapsed(slate.selection))
        return false;

      const linkEntry = SlateEditor.above(slate, {
        at: slate.selection,
        mode: "lowest",
        match: (node) =>
          !SlateEditor.isEditor(node) &&
          SlateElement.isElement(node) &&
          "type" in node &&
          (node as { type?: string }).type === "link",
      });
      if (!linkEntry) return false;

      const [, linkPath] = linkEntry;
      const linkEnd = SlateEditor.end(slate, linkPath);
      if (!SlatePoint.equals(slate.selection.anchor, linkEnd)) return false;

      event.preventDefault();
      SlateTransforms.insertNodes(
        slate,
        { text: event.key },
        { at: SlatePath.next(linkPath), select: true },
      );
      return true;
    },
    [activeEditor],
  );

  const handleEditorKeys = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeEditor.isFocused()) {
          activeEditor.blur();
          triggerFocusLossSave(activeEditor, mode);
        }
        return;
      }
      if (handleTypeOutsideLink(e)) {
        return;
      }
      if (e.key !== "Tab") return;
      if (!activeEditor.isFocused()) return;
      markEditorInteracted();
      e.preventDefault();
      if (e.shiftKey) {
        activeEditor.decreaseBlockDepth();
      } else {
        activeEditor.increaseBlockDepth();
      }
    },
    [
      activeEditor,
      triggerFocusLossSave,
      mode,
      markEditorInteracted,
      handleTypeOutsideLink,
    ],
  );

  const handleEditorMouseDownCapture = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (e.button !== 0 || dragState !== null) return;
      const section = editorSectionRef.current;
      const target = e.target as HTMLElement | null;
      if (!section || !target) return;

      const editorRoot = section.querySelector<HTMLElement>(".yoopta-editor");
      if (!editorRoot || !editorRoot.contains(target)) return;
      if (target.closest("[data-yoopta-block]")) return;
      if (target.closest(`.${styles.blockActionBtn}`)) return;
      if (target.closest(`.${styles.blockMenu}`)) return;

      const blockEls = Array.from(
        editorRoot.querySelectorAll<HTMLElement>("[data-yoopta-block]"),
      );
      if (blockEls.length === 0) return;

      const lastBlockRect =
        blockEls[blockEls.length - 1].getBoundingClientRect();
      if (e.clientY <= lastBlockRect.bottom) return;

      const value = activeEditor.getEditorValue();
      const orderedBlocks = Object.values(value).sort(
        (a, b) => a.meta.order - b.meta.order,
      );
      const lastBlock = orderedBlocks[orderedBlocks.length - 1];
      const lastElement =
        (lastBlock?.value?.[0] as { children?: RichTextChild[] } | undefined) ??
        null;

      if (lastBlock && isElementTextEmpty(lastElement)) {
        activeEditor.focusBlock(lastBlock.id, { waitExecution: true });
      } else {
        activeEditor.insertBlock(
          mode === "todos" ? "TodoList" : "BulletedList",
          {
            at: (lastBlock?.meta.order ?? -1) + 1,
            focus: true,
          },
        );
      }

      e.preventDefault();
      e.stopPropagation();
    },
    [activeEditor, dragState, mode],
  );

  // ─── Drag handlers ───────────────────────────────────────────────────────────

  const handleDragStart = React.useCallback(
    (e: React.DragEvent, blockId: string | null) => {
      if (!blockId) return;
      const value = activeEditor.getEditorValue();
      const group = getBlockGroup(blockId, value);
      setDragState({ blockId, draggedIds: new Set(group) });
      e.dataTransfer.effectAllowed = "move";

      // Cache content-area metrics for horizontal depth calculation in dragover.
      // getComputedStyle is expensive — do it once here rather than per-event.
      const section = editorSectionRef.current;
      if (section) {
        const sectionRect = section.getBoundingClientRect();
        const paddingLeft = parseFloat(getComputedStyle(section).paddingLeft);
        const fontSize = parseFloat(
          getComputedStyle(document.documentElement).fontSize,
        );
        dragMetricsRef.current = {
          contentLeft: sectionRect.left + paddingLeft,
          indentPx: 1.4 * fontSize,
        };

        // Use the actual block element as the drag image at reduced opacity.
        // setDragImage requires the element to be in the viewport — setting
        // opacity directly then restoring it in the next frame is the reliable
        // cross-browser approach.
        const el = section.querySelector<HTMLElement>(
          `[data-block-id="${blockId}"]`,
        );
        if (el) {
          const rect = el.getBoundingClientRect();
          const offsetX = Math.max(0, e.clientX - rect.left);
          const offsetY = Math.max(
            0,
            Math.min(e.clientY - rect.top, el.offsetHeight),
          );
          el.style.opacity = "0.3";
          e.dataTransfer.setDragImage(el, offsetX, offsetY);
          requestAnimationFrame(() => {
            el.style.opacity = "";
          });
        }
      }
    },
    [activeEditor],
  );

  const handleDragEnd = React.useCallback(() => {
    setDragState(null);
    setDropTarget(null);
    dragMetricsRef.current = null;
  }, []);

  const handleDragOver = React.useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      if (!dragState || !editorSectionRef.current) return;
      e.dataTransfer.dropEffect = "move";
      const els = Array.from(
        editorSectionRef.current.querySelectorAll<HTMLElement>(
          "[data-block-id]",
        ),
      );
      if (!els.length) return;
      const sectionTop = editorSectionRef.current.getBoundingClientRect().top;
      const clientY = e.clientY;
      let idx = els.length; // default: insert after last
      for (let i = 0; i < els.length; i++) {
        const rect = els[i].getBoundingClientRect();
        if (clientY < rect.top + rect.height / 2) {
          idx = i;
          break;
        }
      }
      let y: number;
      if (idx === 0) {
        y = els[0].getBoundingClientRect().top - sectionTop - 1;
      } else if (idx >= els.length) {
        y = els[els.length - 1].getBoundingClientRect().bottom - sectionTop;
      } else {
        y = els[idx].getBoundingClientRect().top - sectionTop - 1;
      }

      // Depth is driven by cursor X: moving right nests deeper, moving left
      // un-nests. This mirrors the Tab/Shift-Tab keyboard affordance and makes
      // the nesting intent obvious via the sliding indicator line.
      const value = activeEditor.getEditorValue();
      let precedingDepth = -1;
      for (let i = idx - 1; i >= 0; i--) {
        const id = els[i].dataset.blockId;
        if (id && !dragState.draggedIds.has(id)) {
          precedingDepth = value[id]?.meta.depth ?? 0;
          break;
        }
      }
      const metrics = dragMetricsRef.current;
      const requestedDepth = metrics
        ? Math.max(
            0,
            Math.floor((e.clientX - metrics.contentLeft) / metrics.indentPx),
          )
        : (value[dragState.blockId]?.meta.depth ?? 0);
      // Cap at one level deeper than the nearest preceding non-dragged block.
      const normalizedDepth = Math.min(requestedDepth, precedingDepth + 1);

      if (
        dropTarget?.index !== idx ||
        dropTarget?.y !== y ||
        dropTarget?.depth !== normalizedDepth
      ) {
        setDropTarget({ index: idx, y, depth: normalizedDepth });
      }
    },
    [dragState, dropTarget, activeEditor],
  );

  const handleDragLeave = React.useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      if (!editorSectionRef.current) return;
      if (editorSectionRef.current.contains(e.relatedTarget as Node)) return;
      setDropTarget(null);
    },
    [],
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      if (!dragState || dropTarget === null) {
        setDragState(null);
        setDropTarget(null);
        return;
      }
      const newValue = reorderBlocks(
        activeEditor.getEditorValue(),
        dragState.blockId,
        dropTarget.index,
        dropTarget.depth,
      );
      activeEditor.setEditorValue(newValue);
      void saveEditorContent(activeEditor, mode, { force: true });
      setDragState(null);
      setDropTarget(null);
    },
    [dragState, dropTarget, activeEditor, saveEditorContent, mode],
  );

  // Save when focus leaves this editor section (click outside, tab away, etc.)
  React.useEffect(() => {
    const section = editorSectionRef.current;
    if (!section) return;

    const handleFocusOut = (event: FocusEvent) => {
      const nextTarget = event.relatedTarget;
      if (nextTarget instanceof Node && section.contains(nextTarget)) return;
      requestAnimationFrame(() => {
        const currentActiveElement = document.activeElement;
        if (
          currentActiveElement instanceof Node &&
          section.contains(currentActiveElement)
        ) {
          return;
        }
        triggerFocusLossSave(activeEditor, mode);
      });
    };

    section.addEventListener("focusout", handleFocusOut);
    return () => {
      section.removeEventListener("focusout", handleFocusOut);
    };
  }, [activeEditor, mode, triggerFocusLossSave]);

  // Save when browser/app focus is lost while editing.
  React.useEffect(() => {
    const saveIfFocused = () => {
      if (!activeEditor.isFocused()) return;
      activeEditor.blur();
      triggerFocusLossSave(activeEditor, mode);
    };

    const handleWindowBlur = () => {
      saveIfFocused();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "hidden") return;
      saveIfFocused();
    };

    const handlePageHide = () => {
      saveIfFocused();
    };

    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [activeEditor, mode, triggerFocusLossSave]);

  // Click-outside to close block context menu
  React.useEffect(() => {
    if (!blockMenuOpen || calendarScopeDialogOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        blockMenuRef.current &&
        !blockMenuRef.current.contains(event.target as Node)
      ) {
        closeBlockMenu();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [blockMenuOpen, calendarScopeDialogOpen, closeBlockMenu]);

  React.useEffect(() => {
    if (!blockMenuOpen || blockMenuView !== "labels" || !activeBlockId) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void loadMenuLabels(labelsSearch, controller.signal);
    }, 120);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [
    blockMenuOpen,
    blockMenuView,
    activeBlockId,
    labelsSearch,
    loadMenuLabels,
  ]);

  React.useEffect(() => {
    const controller = new AbortController();
    void loadItemLabelsForDate(controller.signal);
    return () => controller.abort();
  }, [loadItemLabelsForDate]);

  React.useEffect(() => {
    if (!blockMenuOpen) return;
    updateBlockMenuPosition();
    const handlePositionUpdate = () => updateBlockMenuPosition();
    window.addEventListener("resize", handlePositionUpdate);
    window.addEventListener("scroll", handlePositionUpdate, true);
    return () => {
      window.removeEventListener("resize", handlePositionUpdate);
      window.removeEventListener("scroll", handlePositionUpdate, true);
    };
  }, [blockMenuOpen, updateBlockMenuPosition]);

  React.useEffect(() => {
    if (!blockMenuOpen) return;
    const frame = window.requestAnimationFrame(() => updateBlockMenuPosition());
    return () => window.cancelAnimationFrame(frame);
  }, [
    blockMenuOpen,
    blockMenuView,
    labelsLoading,
    labelsCreating,
    menuLabels.length,
    blockMenuError,
    updateBlockMenuPosition,
  ]);

  React.useEffect(
    () => () => {
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    },
    [],
  );

  React.useEffect(() => {
    if (!calendarScopeDialogOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || calendarScopeDialogPending) return;
      setCalendarScopeDialogOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [calendarScopeDialogOpen, calendarScopeDialogPending]);

  // Save signal (Cmd+S or parent-triggered save)
  React.useEffect(() => {
    if (saveSignal === undefined) return;
    if (lastSaveSignalRef.current === null) {
      lastSaveSignalRef.current = saveSignal;
      if (saveSignal > 0) {
        void saveEditorContent(activeEditor, mode, { force: true });
      }
      return;
    }
    if (lastSaveSignalRef.current === saveSignal) return;
    lastSaveSignalRef.current = saveSignal;
    void saveEditorContent(activeEditor, mode, { force: true });
  }, [saveSignal, activeEditor, mode, saveEditorContent]);

  // Date change: reset both editors to default content
  React.useEffect(() => {
    hydratedRef.current = { notes: false, todos: false };
    lastSavedRef.current = { notes: null, todos: null };
    setHasUserInteracted(false);
    setItemLabelsById({});
    notesEditor.setEditorValue(getDefaultNotesContent());
    todosEditor.setEditorValue(getDefaultTodosContent());
  }, [resolvedDateKey, notesEditor, todosEditor]);

  // Hydrate only the active mode for this editor instance.
  React.useEffect(() => {
    void hydrateEditor(activeEditor, mode);
  }, [activeEditor, mode, hydrateEditor, resolvedDateKey]);

  // Stable callback passed through context so TodoListElement can trigger a
  // save immediately after toggling a checkbox (without waiting for blur).
  const onCheckboxSave = React.useCallback(
    () => void saveEditorContent(todosEditor, "todos"),
    [saveEditorContent, todosEditor],
  );

  return (
    <section
      ref={editorSectionRef}
      className={`${styles.editor} ${
        mode === "todos" ? styles.editorTodos : styles.editorNotes
      }`}
      data-mode={mode}
      data-touched={hasUserInteracted ? "true" : "false"}
      aria-label={mode === "todos" ? "Todos editor" : "Notes editor"}
      onFocusCapture={markEditorInteracted}
      onKeyDown={handleEditorKeys}
      onMouseDownCapture={handleEditorMouseDownCapture}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      <CheckboxSaveContext.Provider value={onCheckboxSave}>
        <ItemLabelsContext.Provider value={itemLabelsById}>
          <YooptaEditor
            editor={activeEditor}
            autoFocus={false}
            placeholder={INPUT_PLACEHOLDER}
            className={styles.editorContent}
          >
            <SlashCommandMenu>
              {({
                items,
              }: {
                items: Array<{
                  id: string;
                  title: string;
                  description?: string;
                }>;
              }) => (
                <SlashCommandMenu.Content className={styles.slashMenuContent}>
                  <SlashCommandMenu.List className={styles.slashMenuList}>
                    {items.map((item) => (
                      <SlashCommandMenu.Item
                        key={item.id}
                        value={item.id}
                        title={item.title}
                        className={styles.slashMenuItem}
                      />
                    ))}
                  </SlashCommandMenu.List>
                  <SlashCommandMenu.Empty className={styles.slashMenuEmpty}>
                    No commands found
                  </SlashCommandMenu.Empty>
                </SlashCommandMenu.Content>
              )}
            </SlashCommandMenu>
            <FloatingBlockActions frozen={blockMenuOpen || dragState !== null}>
              {({ blockId }: { blockId: string | null }) => (
                <>
                  {/* Drag to prioritise */}

                  <FloatingBlockActions.Button
                    title="Drag to prioritise"
                    className={`${styles.blockActionBtn} ${styles.dragHandle}`}
                    draggable
                    onDragStart={(e: React.DragEvent) =>
                      handleDragStart(e, blockId)
                    }
                    onDragEnd={handleDragEnd}
                  >
                    <IconDotGridVertical2x3 width={14} height={14} />
                  </FloatingBlockActions.Button>

                  {/* Apply labels */}
                  <FloatingBlockActions.Button
                    title="Apply label"
                    className={styles.blockActionBtn}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                      openBlockMenu(blockId, event.currentTarget);
                      void handleOpenLabelsMenu(blockId ?? undefined);
                    }}
                  >
                    <IconTag width={14} height={14} />
                  </FloatingBlockActions.Button>

                  {/* More options */}
                  <FloatingBlockActions.Button
                    title="More options"
                    className={styles.blockActionBtn}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
                      openBlockMenu(blockId, event.currentTarget)
                    }
                  >
                    <IconDotsHorizontal
                      width={14}
                      height={14}
                    />
                  </FloatingBlockActions.Button>
                </>
              )}
            </FloatingBlockActions>
          </YooptaEditor>

          {dropTarget !== null && (
            <div
              className={styles.dropIndicator}
              style={{
                top: dropTarget.y,
                left: `${dropTarget.depth * 1.4}rem`,
              }}
              aria-hidden
            />
          )}

          {blockMenuOpen && activeBlockId && (
            <div
              className={styles.blockMenu}
              ref={blockMenuRef}
              style={{
                top: blockMenuPosition.top,
                left: blockMenuPosition.left,
              }}
            >
              {blockMenuView === "root" ? (
                <>
                  <button className={styles.blockMenuItem} disabled>
                    Assign to Agent
                  </button>
                  <button
                    type="button"
                    className={styles.blockMenuItem}
                    onClick={() => {
                      void handleScheduleTask();
                    }}
                    disabled={mode !== "todos" || schedulePending}
                  >
                    {schedulePending ? "Scheduling..." : "Schedule"}
                  </button>
                  <button
                    type="button"
                    className={`${styles.blockMenuItem} ${styles.blockMenuItemDanger}`}
                    onClick={handleDeleteBlock}
                  >
                    Delete
                  </button>
                </>
              ) : (
                <div className={styles.labelsMenu}>
                  <div className={styles.labelsMenuHeader}>
                    <button
                      type="button"
                      className={styles.blockMenuBackButton}
                      onClick={handleBackToRootBlockMenu}
                    >
                      Back
                    </button>
                    <p className={styles.labelsMenuTitle}>Label as:</p>
                  </div>

                  <label className={styles.labelsSearchField}>
                    <input
                      type="text"
                      value={labelsSearch}
                      onChange={(event) =>
                        setLabelsSearch(event.currentTarget.value)
                      }
                      placeholder="Search labels"
                      className={styles.labelsSearchInput}
                      autoFocus
                    />
                    <IconSearch
                      width={14}
                      height={14}
                      className={styles.labelsSearchIcon}
                    />
                  </label>

                  <div className={styles.labelsMenuList}>
                    {labelsLoading && (
                      <p className={styles.labelsMenuState}>
                        Loading labels...
                      </p>
                    )}

                    {!labelsLoading &&
                      menuLabels.length === 0 &&
                      !createCandidate && (
                        <p className={styles.labelsMenuState}>
                          No labels found.
                        </p>
                      )}

                    {!labelsLoading &&
                      menuLabels.map((row) => {
                        const isPending = labelMutationIds.has(row.id);
                        return (
                          <button
                            key={row.id}
                            type="button"
                            className={styles.labelOptionButton}
                            onClick={() => {
                              void handleToggleMenuLabel(row);
                            }}
                            disabled={isPending || labelsCreating}
                          >
                            <input
                              type="checkbox"
                              checked={row.assigned}
                              readOnly
                              className={styles.labelOptionCheckbox}
                            />
                            <span
                              className={styles.labelColorDot}
                              style={{
                                backgroundColor: `var(--${row.color}-6)`,
                              }}
                            />
                            <span className={styles.labelOptionText}>
                              {row.name}
                            </span>
                          </button>
                        );
                      })}

                    {createCandidate && (
                      <button
                        type="button"
                        className={styles.blockMenuItem}
                        onClick={() => {
                          void handleCreateAndAssignLabel();
                        }}
                        disabled={labelsCreating}
                      >
                        "{createCandidate.name}" (create new)
                      </button>
                    )}
                  </div>
                </div>
              )}

              {blockMenuError && (
                <p className={styles.blockMenuError}>{blockMenuError}</p>
              )}
            </div>
          )}
          {calendarScopeDialogOpen && (
            <div
              className={styles.calendarScopeDialogOverlay}
              role="presentation"
              onMouseDown={(event) => {
                if (
                  event.currentTarget !== event.target ||
                  calendarScopeDialogPending
                )
                  return;
                setCalendarScopeDialogOpen(false);
              }}
            >
              <div
                className={styles.calendarScopeDialog}
                role="dialog"
                aria-modal="true"
                aria-labelledby="calendar-scope-dialog-title"
                aria-describedby="calendar-scope-dialog-description"
              >
                <h3
                  id="calendar-scope-dialog-title"
                  className={styles.calendarScopeDialogTitle}
                >
                  Allow Google Calendar write access
                </h3>
                <p
                  id="calendar-scope-dialog-description"
                  className={styles.calendarScopeDialogDescription}
                >
                  Scheduling needs permission to create and update events on
                  your primary Google Calendar.
                </p>
                <div className={styles.calendarScopeDialogActions}>
                  <Button
                    variant="secondary"
                    size="medium"
                    onClick={handleCalendarScopeDialogCancel}
                    disabled={calendarScopeDialogPending}
                  >
                    Cancel
                  </Button>
                  <ShinyButton
                    onClick={() => {
                      void handleCalendarScopeDialogAllow();
                    }}
                    disabled={calendarScopeDialogPending}
                  >
                    {calendarScopeDialogPending
                      ? "Connecting..."
                      : "Allow Access"}
                  </ShinyButton>
                </div>
              </div>
            </div>
          )}
          {scheduleToast && (
            <div
              className={`${styles.scheduleToast} ${
                scheduleToast.kind === "error"
                  ? styles.scheduleToastError
                  : styles.scheduleToastSuccess
              }`}
              role="status"
              aria-live="polite"
            >
              {scheduleToast.message}
            </div>
          )}
        </ItemLabelsContext.Provider>
      </CheckboxSaveContext.Provider>
    </section>
  );
}
