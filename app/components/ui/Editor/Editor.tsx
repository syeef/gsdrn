import * as React from "react";
import { EditorContent, type Editor, useEditor } from "@tiptap/react";
import { Extension, type JSONContent } from "@tiptap/core";
import type { Node as ProseMirrorNode, ResolvedPos } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import ListItem from "@tiptap/extension-list-item";
import styles from "./Editor.module.css";

export type EditorMode = "notes" | "todos";

type EditorProps = {
  mode: EditorMode;
  dateKey?: string;
  saveSignal?: number;
  onSaveStart?: () => void;
  onSaveEnd?: () => void;
};

const DEFAULT_PLACEHOLDER = "Add a Note…";

const TODO_PLACEHOLDER = "Add a Task…";

type DraftRecord = {
  content: JSONContent;
  updatedAt: number;
  syncedAt?: number;
  canonicalSyncedAt?: number;
};

type SaveOptions = {
  force?: boolean;
  showIndicator?: boolean;
};

const STORAGE_PREFIX = "gsdrn:editor:draft";

const getLocalDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getStorageKey = (mode: EditorMode, dateKey: string) =>
  `${STORAGE_PREFIX}:${mode}:${dateKey}`;

const createNodeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
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

const TaskItemWithId = TaskItem.extend({
  draggable: true,
  addAttributes() {
    return {
      ...(this.parent?.() ?? {}),
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-id"),
        renderHTML: (attributes) =>
          attributes.id ? { "data-id": attributes.id } : {},
      },
    };
  },
});

const NoteListItem = ListItem.extend({
  addAttributes() {
    return {
      ...(this.parent?.() ?? {}),
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-id"),
        renderHTML: (attributes) =>
          attributes.id ? { "data-id": attributes.id } : {},
      },
    };
  },
});

const countTaskItems = (doc: ProseMirrorNode) => {
  let count = 0;
  doc.descendants((node) => {
    if (node.type.name === "taskItem") {
      count += 1;
    }
    return true;
  });
  return count;
};

const getTaskItemContext = ($from: ResolvedPos) => {
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name === "taskItem") {
      return {
        node,
        depth,
        parent: depth > 0 ? $from.node(depth - 1) : null,
      };
    }
  }
  return null;
};

const TaskItemDeletionGuard = Extension.create({
  name: "taskItemDeletionGuard",
  addKeyboardShortcuts() {
    const moveToPreviousTaskItemEnd = () => {
      const { state } = this.editor;
      const { selection } = state;

      if (!selection.empty) return false;

      const $from = selection.$from;
      const context = getTaskItemContext($from);
      if (!context || !context.parent) return false;
      if (context.parent.type.name !== "taskList") return false;
      const paragraph =
        context.node.childCount > 0 ? context.node.child(0) : null;
      if (!paragraph || paragraph.type.name !== "paragraph") return false;
      if (paragraph.textContent.length > 0) return false;

      const currentPos = $from.before(context.depth);
      let previous: { node: ProseMirrorNode; pos: number } | null = null;

      state.doc.descendants((node, pos) => {
        if (node.type.name === "taskItem" && pos < currentPos) {
          previous = { node, pos };
        }
        return true;
      });

      if (!previous) {
        return true;
      }

      const previousParagraph =
        previous.node.childCount > 0 ? previous.node.child(0) : null;
      const previousEnd =
        previousParagraph && previousParagraph.type.name === "paragraph"
          ? previous.pos + 2 + previousParagraph.content.size
          : previous.pos + previous.node.content.size;

      this.editor
        .chain()
        .focus()
        .command(({ tr }) => {
          tr.delete(currentPos, currentPos + context.node.nodeSize);
          tr.setSelection(TextSelection.create(tr.doc, previousEnd));
          return true;
        })
        .run();
      return true;
    };

    return {
      Backspace: () => moveToPreviousTaskItemEnd(),
      Delete: () => moveToPreviousTaskItemEnd(),
    };
  },
});

const ForceBulletList = Extension.create({
  name: "forceBulletList",
  onCreate() {
    if (this.editor.isEmpty) {
      this.editor.commands.toggleBulletList();
    }
  },
  addKeyboardShortcuts() {
    return {
      "Shift-Enter": () => this.editor.commands.setHardBreak(),
      Enter: () => {
        if (!this.editor.isActive("bulletList")) {
          this.editor.chain().focus().toggleBulletList().run();
        }
        return this.editor.commands.splitListItem("listItem");
      },
    };
  },
});

const ForceTaskList = Extension.create({
  name: "forceTaskList",
  onCreate() {
    if (this.editor.isEmpty) {
      this.editor.commands.toggleTaskList();
    }
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        if (!this.editor.isActive("taskList")) {
          this.editor.chain().focus().toggleTaskList().run();
        }
        return this.editor.commands.splitListItem("taskItem");
      },
    };
  },
});

const LinkExtension = Link.configure({
  autolink: true,
  linkOnPaste: true,
  openOnClick: true,
  HTMLAttributes: {
    rel: "noopener noreferrer",
    target: "_blank",
  },
});

const getDefaultNotesContent = (): JSONContent => ({
  type: "doc",
  content: [
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [{ type: "paragraph" }],
        },
      ],
    },
  ],
});

const getDefaultTodoList = (): JSONContent => ({
  type: "taskList",
  content: [
    {
      type: "taskItem",
      attrs: { checked: false },
      content: [{ type: "paragraph" }],
    },
  ],
});

const getDefaultTodosContent = (): JSONContent => ({
  type: "doc",
  content: [getDefaultTodoList()],
});

export default function Editor({
  mode,
  dateKey,
  saveSignal,
  onSaveStart,
  onSaveEnd,
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

  const ensureNodeIds = React.useCallback((editorInstance: Editor) => {
    if (typeof window === "undefined") return false;
    const { state, view } = editorInstance;
    const tr = state.tr;
    let updated = false;

    state.doc.descendants((node, pos) => {
      const name = node.type.name;
      if (name !== "taskItem" && name !== "listItem") return true;
      const attrs = node.attrs ?? {};
      if (attrs.id) return true;
      tr.setNodeMarkup(
        pos,
        undefined,
        { ...attrs, id: createNodeId() },
        node.marks,
      );
      updated = true;
      return true;
    });

    if (updated) {
      tr.setMeta("addToHistory", false);
      view.dispatch(tr);
    }

    return updated;
  }, []);

  const saveEditorContent = React.useCallback(
    async (
      editorInstance: Editor | null,
      saveMode: EditorMode,
      options?: SaveOptions,
    ) => {
      if (!editorInstance) return;

      ensureNodeIds(editorInstance);
      const content = editorInstance.getJSON();
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

      if (!draftNeedsSync && !canonicalNeedsSync) return;

      const updateLocal = (patch: Partial<DraftRecord>) => {
        const latest = readDraft(storageKey);
        if (!latest) return;
        writeDraft(storageKey, { ...latest, ...patch });
      };

      if (showIndicator) {
        onSaveStart?.();
      }

      try {
        const [draftResponse, canonicalResponse] = await Promise.all([
          draftNeedsSync
            ? fetch("/api/editorDraft", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  mode: saveMode,
                  date: resolvedDateKey,
                  content,
                }),
                keepalive: true,
              }).then(async (response) => {
                if (!response.ok) return null;
                return (await response.json().catch(() => null)) as {
                  updatedAt?: number;
                } | null;
              })
            : Promise.resolve(null),
          canonicalNeedsSync
            ? fetch("/api/editorContent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  mode: saveMode,
                  date: resolvedDateKey,
                  content,
                }),
                keepalive: true,
              }).then(async (response) => {
                if (!response.ok) return null;
                return (await response.json().catch(() => null)) as {
                  updatedAt?: number;
                } | null;
              })
            : Promise.resolve(null),
        ]);

        if (draftResponse?.updatedAt) {
          updateLocal({ syncedAt: draftResponse.updatedAt });
        }

        if (canonicalResponse?.updatedAt) {
          updateLocal({ canonicalSyncedAt: canonicalResponse.updatedAt });
        }
      } catch {
        // Network failure: keep local draft, retry next time.
      } finally {
        if (showIndicator) {
          onSaveEnd?.();
        }
      }
    },
    [resolvedDateKey, onSaveStart, onSaveEnd, ensureNodeIds],
  );

  const hydrateEditor = React.useCallback(
    async (editorInstance: Editor | null, hydrateMode: EditorMode) => {
      if (!editorInstance) return;
      if (hydratedRef.current[hydrateMode]) return;
      hydratedRef.current[hydrateMode] = true;

      const storageKey = getStorageKey(hydrateMode, resolvedDateKey);
      const localDraft = readDraft(storageKey);
      const isEmpty = editorInstance.getText().trim().length === 0;

      if (localDraft?.content && isEmpty) {
        editorInstance.commands.setContent(localDraft.content);
        lastSavedRef.current[hydrateMode] = JSON.stringify(localDraft.content);
      }

      try {
        const response = await fetch(
          `/api/editorContent?mode=${hydrateMode}&date=${resolvedDateKey}`,
        );
        if (!response.ok) return;
        const data = (await response.json().catch(() => null)) as {
          content?: JSONContent | null;
          updatedAt?: number | null;
        } | null;

        if (!data || !data.content || !data.updatedAt) {
          if (
            localDraft &&
            (!localDraft.canonicalSyncedAt ||
              localDraft.canonicalSyncedAt < localDraft.updatedAt)
          ) {
            await saveEditorContent(editorInstance, hydrateMode, {
              showIndicator: false,
            });
          }
          return;
        }

        const serverUpdatedAt = data.updatedAt;
        const localUpdatedAt = localDraft?.updatedAt ?? 0;

        if (!localDraft || serverUpdatedAt > localUpdatedAt) {
          if (isEmpty) {
            editorInstance.commands.setContent(data.content);
          }
          writeDraft(storageKey, {
            content: data.content,
            updatedAt: serverUpdatedAt,
            syncedAt: localDraft?.syncedAt,
            canonicalSyncedAt: serverUpdatedAt,
          });
          lastSavedRef.current[hydrateMode] = JSON.stringify(data.content);
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

  const buildEditorProps = React.useCallback(
    () => ({
      handleDOMEvents: {
        keydown: (view: any, event: KeyboardEvent) => {
          if (event.key === "Escape") {
            view.dom.blur();
            return true;
          }
          return false;
        },
      },
    }),
    [],
  );

  const ensureTodoScaffold = React.useCallback((editorInstance: Editor) => {
    const taskItemCount = countTaskItems(editorInstance.state.doc);

    if (taskItemCount > 0) return;

    const defaultList = getDefaultTodoList();
    const { doc } = editorInstance.state;

    if (doc.childCount <= 1 && doc.textContent.trim().length === 0) {
      editorInstance.commands.setContent(
        {
          type: "doc",
          content: [defaultList],
        },
        false,
      );
      return;
    }

    editorInstance.commands.insertContentAt(doc.content.size, defaultList);
  }, []);

  const ensureNotesScaffold = React.useCallback((editorInstance: Editor) => {
    const { doc } = editorInstance.state;
    const firstNode = doc.childCount > 0 ? doc.child(0) : null;
    const hasBulletList = firstNode?.type.name === "bulletList";

    if (hasBulletList) return;
    if (doc.textContent.trim().length > 0) return;

    editorInstance.commands.setContent(getDefaultNotesContent(), false);
  }, []);

  const notesEditor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        orderedList: false,
        listItem: false,
      }),
      LinkExtension,
      NoteListItem,
      ForceBulletList,
      Placeholder.configure({
        placeholder: DEFAULT_PLACEHOLDER,
        includeChildren: true,
      }),
    ],
    content: getDefaultNotesContent(),
    editorProps: buildEditorProps(),
    onBlur: ({ editor }) => void saveEditorContent(editor, "notes"),
    onUpdate: ({ editor }) => ensureNotesScaffold(editor),
    immediatelyRender: false,
  });

  const todosEditor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        heading: { levels: [2, 3] },
      }),
      LinkExtension,
      TaskList,
      TaskItemWithId.configure({
        nested: true,
      }),
      TaskItemDeletionGuard,
      ForceTaskList,
      Placeholder.configure({
        placeholder: TODO_PLACEHOLDER,
        includeChildren: true,
      }),
    ],
    content: getDefaultTodosContent(),
    editorProps: buildEditorProps(),
    onBlur: ({ editor }) => void saveEditorContent(editor, "todos"),
    onUpdate: ({ editor }) => ensureTodoScaffold(editor),
    immediatelyRender: false,
  });

  const editor = mode === "todos" ? todosEditor : notesEditor;

  React.useEffect(() => {
    if (saveSignal === undefined) return;
    if (!editor) return;
    if (lastSaveSignalRef.current === null) {
      lastSaveSignalRef.current = saveSignal;
      if (saveSignal > 0) {
        void saveEditorContent(editor, mode, { force: true });
      }
      return;
    }
    if (lastSaveSignalRef.current === saveSignal) return;
    lastSaveSignalRef.current = saveSignal;
    void saveEditorContent(editor, mode, { force: true });
  }, [saveSignal, editor, mode, saveEditorContent]);

  React.useEffect(() => {
    hydratedRef.current = { notes: false, todos: false };
    lastSavedRef.current = { notes: null, todos: null };

    if (notesEditor) {
      notesEditor.commands.setContent(getDefaultNotesContent());
    }

    if (todosEditor) {
      todosEditor.commands.setContent(getDefaultTodosContent());
    }
  }, [resolvedDateKey, notesEditor, todosEditor]);

  React.useEffect(() => {
    if (notesEditor) {
      void hydrateEditor(notesEditor, "notes");
    }
  }, [notesEditor, hydrateEditor, resolvedDateKey]);

  React.useEffect(() => {
    if (todosEditor) {
      void hydrateEditor(todosEditor, "todos");
    }
  }, [todosEditor, hydrateEditor, resolvedDateKey]);

  return (
    <section
      className={`${styles.editor} ${
        mode === "todos" ? styles.editorTodos : styles.editorNotes
      }`}
      aria-label="Notes editor"
    >
      <EditorContent className={styles.editorFrame} editor={editor} />
    </section>
  );
}
