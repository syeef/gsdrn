import type { JSONContent } from "@tiptap/core";
import { nanoid } from "nanoid";
import type { NewNote, NewTask, Note, Task } from "~/database/schema";

type ExtractOptions = {
  userId: string;
  dateKey: string;
  now: Date;
};

const getNodeId = (node: JSONContent | null | undefined) => {
  const raw = (node as JSONContent | undefined)?.attrs?.id;
  if (typeof raw === "string" && raw.trim().length > 0) return raw;
  return nanoid();
};

const emptyParagraph = (): JSONContent => ({
  type: "paragraph",
  content: [],
});

const getContentArray = (node: JSONContent | null | undefined): JSONContent[] => {
  if (!node || typeof node !== "object") return [];
  const content = (node as JSONContent).content;
  return Array.isArray(content) ? (content as JSONContent[]) : [];
};

const findChildNode = (
  node: JSONContent | null | undefined,
  type: string,
): JSONContent | null =>
  getContentArray(node).find((child) => child?.type === type) ?? null;

const normalizeParagraph = (node: JSONContent | null | undefined): JSONContent => {
  if (node && node.type === "paragraph") return node;
  return emptyParagraph();
};

const hasMeaningfulContent = (node: JSONContent | null | undefined): boolean => {
  if (!node || node.type !== "paragraph") return false;
  const content = getContentArray(node);
  if (content.length === 0) return false;
  return content.some((child) => {
    if (!child || typeof child !== "object") return false;
    if (child.type === "text") {
      return Boolean(child.text && child.text.trim().length > 0);
    }
    return true;
  });
};

const parseParagraph = (raw: string | null | undefined): JSONContent => {
  if (!raw) return emptyParagraph();
  try {
    const parsed = JSON.parse(raw) as JSONContent;
    if (parsed && parsed.type === "paragraph") return parsed;
  } catch {
    // Fall through to default paragraph.
  }
  return emptyParagraph();
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
  doc: JSONContent | null | undefined,
  options: ExtractOptions,
): NewTask[] => {
  const rows: NewTask[] = [];
  const listNodes = getContentArray(doc).filter(
    (node) => node?.type === "taskList",
  );

  const walkTaskList = (
    listNode: JSONContent,
    parentId: string | null,
    depth: number,
    startOrder = 0,
  ): number => {
    const items = getContentArray(listNode);
    let sortOrder = startOrder;

    for (const item of items) {
      if (item?.type !== "taskItem") continue;

      const paragraph = findChildNode(item, "paragraph");
      const childList = findChildNode(item, "taskList");
      const hasChildren =
        !!childList &&
        getContentArray(childList).some((child) => child?.type === "taskItem");
      const hasBody = hasMeaningfulContent(paragraph);

      if (!hasBody && !hasChildren) continue;

      const id = getNodeId(item);
      const checked = Boolean(item?.attrs && (item.attrs as any).checked);
      const status = checked ? "done" : "todo";

      rows.push({
        id,
        userId: options.userId,
        parentId,
        depth,
        status,
        body: JSON.stringify(normalizeParagraph(paragraph)),
        taskDate: options.dateKey,
        sortOrder,
        rolloverCount: 0,
        lastRolloverDate: null,
        createdAt: options.now,
        updatedAt: options.now,
        completedAt: checked ? options.now : null,
        archivedAt: null,
      });

      sortOrder += 1;

      if (childList && hasChildren) {
        walkTaskList(childList, id, depth + 1, 0);
      }
    }

    return sortOrder;
  };

  let rootSortOrder = 0;
  for (const listNode of listNodes) {
    rootSortOrder = walkTaskList(listNode, null, 0, rootSortOrder);
  }

  return rows;
};

export const extractNotesFromDoc = (
  doc: JSONContent | null | undefined,
  options: ExtractOptions,
): NewNote[] => {
  const rows: NewNote[] = [];
  const listNodes = getContentArray(doc).filter(
    (node) => node?.type === "bulletList",
  );

  const walkBulletList = (
    listNode: JSONContent,
    parentId: string | null,
    depth: number,
    startOrder = 0,
  ): number => {
    const items = getContentArray(listNode);
    let sortOrder = startOrder;

    for (const item of items) {
      if (item?.type !== "listItem") continue;

      const paragraph = findChildNode(item, "paragraph");
      const childList = findChildNode(item, "bulletList");
      const hasChildren =
        !!childList &&
        getContentArray(childList).some((child) => child?.type === "listItem");
      const hasBody = hasMeaningfulContent(paragraph);

      if (!hasBody && !hasChildren) continue;

      const id = getNodeId(item);

      rows.push({
        id,
        userId: options.userId,
        parentId,
        depth,
        body: JSON.stringify(normalizeParagraph(paragraph)),
        noteDate: options.dateKey,
        sortOrder,
        createdAt: options.now,
        updatedAt: options.now,
      });

      sortOrder += 1;

      if (childList && hasChildren) {
        walkBulletList(childList, id, depth + 1, 0);
      }
    }

    return sortOrder;
  };

  let rootSortOrder = 0;
  for (const listNode of listNodes) {
    rootSortOrder = walkBulletList(listNode, null, 0, rootSortOrder);
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

export const buildTaskDoc = (rows: Task[]): JSONContent | null => {
  if (!rows.length) return null;
  const { build } = buildList(rows);

  const buildItems = (parentId: string | null): JSONContent[] => {
    const items = build(parentId);
    return items.map((row) => {
      const content: JSONContent[] = [parseParagraph(row.body)];
      const children = buildItems(row.id);
      if (children.length > 0) {
        content.push({
          type: "taskList",
          content: children,
        });
      }

      return {
        type: "taskItem",
        attrs: { checked: row.status === "done", id: row.id },
        content,
      } satisfies JSONContent;
    });
  };

  const rootItems = buildItems(null);
  if (rootItems.length === 0) return null;

  return {
    type: "doc",
    content: [
      {
        type: "taskList",
        content: rootItems,
      },
    ],
  };
};

export const buildNoteDoc = (rows: Note[]): JSONContent | null => {
  if (!rows.length) return null;
  const { build } = buildList(rows);

  const buildItems = (parentId: string | null): JSONContent[] => {
    const items = build(parentId);
    return items.map((row) => {
      const content: JSONContent[] = [parseParagraph(row.body)];
      const children = buildItems(row.id);
      if (children.length > 0) {
        content.push({
          type: "bulletList",
          content: children,
        });
      }

      return {
        type: "listItem",
        attrs: { id: row.id },
        content,
      } satisfies JSONContent;
    });
  };

  const rootItems = buildItems(null);
  if (rootItems.length === 0) return null;

  return {
    type: "doc",
    content: [
      {
        type: "bulletList",
        content: rootItems,
      },
    ],
  };
};
