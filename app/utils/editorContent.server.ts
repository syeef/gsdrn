import type { YooptaContentValue } from "@yoopta/editor";
import { nanoid } from "nanoid";
import type { NewNote, NewTask, Note, Task } from "~/database/schema";

type ExtractOptions = {
  userId: string;
  dateKey: string;
  now: Date;
};

// A Slate descendant node — either a Text node or an Element node.
type SlateDescendant = { text: string } | { type: string; children: SlateDescendant[]; [key: string]: unknown };

const hasMeaningfulSlateContent = (children: SlateDescendant[]): boolean => {
  if (!Array.isArray(children) || children.length === 0) return false;
  return children.some((node) => {
    if (!node || typeof node !== "object") return false;
    if ("text" in node) {
      return typeof node.text === "string" && node.text.trim().length > 0;
    }
    // Element node (e.g., link) — counts as meaningful
    return true;
  });
};

const parseSlateChildren = (raw: string | null | undefined): SlateDescendant[] => {
  if (!raw) return [{ text: "" }];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as SlateDescendant[];
  } catch {
    // Fall through
  }
  return [{ text: "" }];
};

export const getLatestUpdatedAt = (
  rows: Array<{ updatedAt: Date }> | null | undefined,
): number | null => {
  if (!rows || rows.length === 0) return null;
  let latest = 0;
  for (const row of rows) {
    const value = row.updatedAt?.getTime?.() ?? 0;
    if (value > latest) latest = value;
  }
  return latest > 0 ? latest : null;
};

export const extractTasksFromDoc = (
  doc: YooptaContentValue | null | undefined,
  options: ExtractOptions,
): NewTask[] => {
  if (!doc || typeof doc !== "object") return [];

  const blocks = Object.values(doc)
    .filter((block) => block.type === "TodoList")
    .sort((a, b) => a.meta.order - b.meta.order);

  const rows: NewTask[] = [];
  const parentStack: string[] = [];
  const sortOrderMap = new Map<string | null, number>();

  for (const block of blocks) {
    const depth = block.meta.depth ?? 0;
    const element = block.value[0] as any;
    if (!element) continue;

    const children = (element.children ?? []) as SlateDescendant[];
    if (!hasMeaningfulSlateContent(children)) continue;

    const parentId = depth > 0 ? (parentStack[depth - 1] ?? null) : null;

    parentStack[depth] = block.id;
    parentStack.splice(depth + 1);

    const sortOrder = sortOrderMap.get(parentId) ?? 0;
    sortOrderMap.set(parentId, sortOrder + 1);

    const checked = Boolean(element.props?.checked);
    const status = checked ? "done" : "todo";

    rows.push({
      id: block.id,
      userId: options.userId,
      parentId,
      depth,
      status,
      body: JSON.stringify(children),
      taskDate: options.dateKey,
      sortOrder,
      rolloverCount: 0,
      lastRolloverDate: null,
      createdAt: options.now,
      updatedAt: options.now,
      completedAt: checked ? options.now : null,
      archivedAt: null,
    });
  }

  return rows;
};

export const extractNotesFromDoc = (
  doc: YooptaContentValue | null | undefined,
  options: ExtractOptions,
): NewNote[] => {
  if (!doc || typeof doc !== "object") return [];

  const blocks = Object.values(doc)
    .filter((block) => block.type === "BulletedList")
    .sort((a, b) => a.meta.order - b.meta.order);

  const rows: NewNote[] = [];
  const parentStack: string[] = [];
  const sortOrderMap = new Map<string | null, number>();

  for (const block of blocks) {
    const depth = block.meta.depth ?? 0;
    const element = block.value[0] as any;
    if (!element) continue;

    const children = (element.children ?? []) as SlateDescendant[];
    if (!hasMeaningfulSlateContent(children)) continue;

    const parentId = depth > 0 ? (parentStack[depth - 1] ?? null) : null;

    parentStack[depth] = block.id;
    parentStack.splice(depth + 1);

    const sortOrder = sortOrderMap.get(parentId) ?? 0;
    sortOrderMap.set(parentId, sortOrder + 1);

    rows.push({
      id: block.id,
      userId: options.userId,
      parentId,
      depth,
      body: JSON.stringify(children),
      noteDate: options.dateKey,
      sortOrder,
      createdAt: options.now,
      updatedAt: options.now,
    });
  }

  return rows;
};

const buildList = <T extends { id: string; parentId: string | null; sortOrder: number }>(
  rows: T[],
) => {
  const grouped = new Map<string | null, T[]>();
  for (const row of rows) {
    const key = row.parentId ?? null;
    const list = grouped.get(key) ?? [];
    list.push(row);
    grouped.set(key, list);
  }

  for (const list of grouped.values()) {
    list.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }

  const build = (parentId: string | null) => grouped.get(parentId) ?? [];

  return { grouped, build };
};

export const buildTaskDoc = (rows: Task[]): YooptaContentValue | null => {
  if (!rows.length) return null;
  const { build } = buildList(rows);

  const result: YooptaContentValue = {};
  let orderCounter = 0;

  const walkTree = (parentId: string | null, depth: number): void => {
    const children = build(parentId);
    for (const row of children) {
      const slateChildren = parseSlateChildren(row.body);
      const elemId = nanoid();

      result[row.id] = {
        id: row.id,
        type: "TodoList",
        value: [
          {
            id: elemId,
            type: "todo-list",
            children: slateChildren,
            props: { checked: row.status === "done", nodeType: "block" },
          } as any,
        ],
        meta: { order: orderCounter++, depth },
      };

      walkTree(row.id, depth + 1);
    }
  };

  walkTree(null, 0);

  return Object.keys(result).length > 0 ? result : null;
};

export const buildNoteDoc = (rows: Note[]): YooptaContentValue | null => {
  if (!rows.length) return null;
  const { build } = buildList(rows);

  const result: YooptaContentValue = {};
  let orderCounter = 0;

  const walkTree = (parentId: string | null, depth: number): void => {
    const children = build(parentId);
    for (const row of children) {
      const slateChildren = parseSlateChildren(row.body);
      const elemId = nanoid();

      result[row.id] = {
        id: row.id,
        type: "BulletedList",
        value: [
          {
            id: elemId,
            type: "bulleted-list",
            children: slateChildren,
            props: { nodeType: "block" },
          } as any,
        ],
        meta: { order: orderCounter++, depth },
      };

      walkTree(row.id, depth + 1);
    }
  };

  walkTree(null, 0);

  return Object.keys(result).length > 0 ? result : null;
};
