import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { and, eq, inArray, lt } from "drizzle-orm";
import { getAuth } from "~/lib/auth.server";
import { note, task, type Task } from "~/database/schema";
import { getDbFromContext } from "~/utils/db.service.server";
import {
  buildNoteDoc,
  buildTaskDoc,
  extractNotesFromDoc,
  extractTasksFromDoc,
  getLatestUpdatedAt,
} from "~/utils/editorContent.server";
import { formatDateKey, parseDateKey } from "~/utils/date";

const DAY_MS = 24 * 60 * 60 * 1000;

const getDayDiff = (fromKey: string, toKey: string) => {
  const from = parseDateKey(fromKey);
  const to = parseDateKey(toKey);
  if (!from || !to) return 1;
  const diff = Math.round((to.getTime() - from.getTime()) / DAY_MS);
  return Math.max(1, diff);
};

const buildChildrenMap = (rows: Task[]) => {
  const map = new Map<string | null, Task[]>();
  for (const row of rows) {
    const key = row.parentId ?? null;
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  return map;
};

const findRootId = (row: Task, tasksById: Map<string, Task>) => {
  let current = row;
  const visited = new Set<string>();
  while (current.parentId) {
    const parent = tasksById.get(current.parentId);
    if (!parent || visited.has(parent.id)) break;
    visited.add(parent.id);
    current = parent;
  }
  return current.id;
};

const rolloverIncompleteTasks = async (
  db: ReturnType<typeof getDbFromContext>,
  userId: string,
  todayKey: string,
  now: Date,
) => {
  const pastTasks = await db.query.task.findMany({
    where: and(eq(task.userId, userId), lt(task.taskDate, todayKey)),
  });

  if (pastTasks.length === 0) return;

  const tasksById = new Map(pastTasks.map((row) => [row.id, row]));
  const childrenByParent = buildChildrenMap(pastTasks);

  const rootIdsToMove = new Set<string>();
  for (const row of pastTasks) {
    if (row.status === "done") continue;
    rootIdsToMove.add(findRootId(row, tasksById));
  }

  if (rootIdsToMove.size === 0) return;

  const rootsToMove = Array.from(rootIdsToMove)
    .map((id) => tasksById.get(id))
    .filter((row): row is Task => Boolean(row));

  rootsToMove.sort((a, b) => {
    if (a.taskDate !== b.taskDate) {
      return a.taskDate.localeCompare(b.taskDate);
    }
    if (a.sortOrder !== b.sortOrder) {
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    }
    return a.id.localeCompare(b.id);
  });

  const todaysTasks = await db.query.task.findMany({
    where: and(eq(task.userId, userId), eq(task.taskDate, todayKey)),
  });
  const todaysRoots = todaysTasks.filter((row) => !row.parentId);
  const minExistingOrder = todaysRoots.length
    ? Math.min(...todaysRoots.map((row) => row.sortOrder ?? 0))
    : 0;
  const startOrder = todaysRoots.length
    ? minExistingOrder - rootsToMove.length
    : 0;

  const rootOrderMap = new Map<string, number>();
  rootsToMove.forEach((row, index) => {
    rootOrderMap.set(row.id, startOrder + index);
  });

  const tasksToMove: Task[] = [];
  const visited = new Set<string>();

  for (const root of rootsToMove) {
    const stack = [root.id];
    while (stack.length > 0) {
      const id = stack.pop();
      if (!id || visited.has(id)) continue;
      visited.add(id);
      const row = tasksById.get(id);
      if (!row) continue;
      tasksToMove.push(row);
      const children = childrenByParent.get(id) ?? [];
      for (const child of children) {
        stack.push(child.id);
      }
    }
  }

  for (const row of tasksToMove) {
    const update: Partial<Task> = {
      taskDate: todayKey,
      updatedAt: now,
      lastRolloverDate: todayKey,
      rolloverCount: (row.rolloverCount ?? 0) + getDayDiff(row.taskDate, todayKey),
    };

    if (!row.parentId) {
      update.sortOrder = rootOrderMap.get(row.id) ?? row.sortOrder;
    }

    await db
      .update(task)
      .set(update)
      .where(and(eq(task.id, row.id), eq(task.userId, userId)));
  }
};

const isValidMode = (mode: unknown): mode is "notes" | "todos" =>
  mode === "notes" || mode === "todos";

const isValidDate = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const getInvalidParentIds = async (
  db: ReturnType<typeof getDbFromContext>,
  type: "note" | "task",
  userId: string,
  parentIds: string[],
  incomingIds: Set<string>,
) => {
  const idsToCheck = Array.from(new Set(parentIds)).filter(
    (id) => !incomingIds.has(id),
  );

  if (idsToCheck.length === 0) return [];

  if (type === "note") {
    const rows = await db.query.note.findMany({
      where: and(eq(note.userId, userId), inArray(note.id, idsToCheck)),
    });
    const valid = new Set(rows.map((row) => row.id));
    return idsToCheck.filter((id) => !valid.has(id));
  }

  const rows = await db.query.task.findMany({
    where: and(eq(task.userId, userId), inArray(task.id, idsToCheck)),
  });
  const valid = new Set(rows.map((row) => row.id));
  return idsToCheck.filter((id) => !valid.has(id));
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");
  const date = url.searchParams.get("date");

  if (!isValidMode(mode) || !isValidDate(date)) {
    return new Response("Invalid parameters", { status: 400 });
  }

  const db = getDbFromContext(context);

  if (mode === "notes") {
    const rows = await db.query.note.findMany({
      where: and(eq(note.userId, session.user.id), eq(note.noteDate, date)),
    });

    if (!rows.length) {
      return Response.json({ content: null, updatedAt: null });
    }

    const content = buildNoteDoc(rows);
    return Response.json({
      content,
      updatedAt: getLatestUpdatedAt(rows),
    });
  }

  const now = new Date();
  const todayKey = formatDateKey(now);
  await rolloverIncompleteTasks(db, session.user.id, todayKey, now);

  const rows = await db.query.task.findMany({
    where: and(eq(task.userId, session.user.id), eq(task.taskDate, date)),
  });

  if (!rows.length) {
    return Response.json({ content: null, updatedAt: null });
  }

  const content = buildTaskDoc(rows);
  return Response.json({
    content,
    updatedAt: getLatestUpdatedAt(rows),
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return new Response("Invalid payload", { status: 400 });
  }

  const { mode, date, content } = payload as {
    mode?: unknown;
    date?: unknown;
    content?: unknown;
  };

  if (!isValidMode(mode) || !isValidDate(date)) {
    return new Response("Invalid parameters", { status: 400 });
  }

  const now = new Date();
  const db = getDbFromContext(context);

  if (mode === "notes") {
    const incoming = extractNotesFromDoc(content as any, {
      userId: session.user.id,
      dateKey: date,
      now,
    });
    const incomingIds = new Set(incoming.map((row) => row.id));
    const parentIds = incoming
      .map((row) => row.parentId)
      .filter((id): id is string => Boolean(id));
    const invalidParentIds = await getInvalidParentIds(
      db,
      "note",
      session.user.id,
      parentIds,
      incomingIds,
    );
    if (invalidParentIds.length > 0) {
      return new Response("Invalid parent reference", { status: 400 });
    }

    const existing = await db.query.note.findMany({
      where: and(eq(note.userId, session.user.id), eq(note.noteDate, date)),
    });
    const existingById = new Map(existing.map((row) => [row.id, row]));

    const inserts = [] as typeof incoming;
    const updates = [] as typeof incoming;

    for (const row of incoming) {
      if (existingById.has(row.id)) {
        updates.push(row);
      } else {
        inserts.push(row);
      }
    }

    if (updates.length > 0) {
      for (const row of updates) {
        await db
          .update(note)
          .set({
            parentId: row.parentId,
            depth: row.depth,
            body: row.body,
            noteDate: row.noteDate,
            sortOrder: row.sortOrder,
            updatedAt: now,
          })
          .where(and(eq(note.id, row.id), eq(note.userId, session.user.id)));
      }
    }

    if (inserts.length > 0) {
      await db.insert(note).values(inserts);
    }

    const deleteIds = existing
      .filter((row) => !incomingIds.has(row.id))
      .map((row) => row.id);
    if (deleteIds.length > 0) {
      await db
        .delete(note)
        .where(
          and(
            eq(note.userId, session.user.id),
            eq(note.noteDate, date),
            inArray(note.id, deleteIds),
          ),
        );
    }

    return Response.json({ ok: true, updatedAt: now.getTime() });
  }

  const incoming = extractTasksFromDoc(content as any, {
    userId: session.user.id,
    dateKey: date,
    now,
  });
  const incomingIds = new Set(incoming.map((row) => row.id));
  const parentIds = incoming
    .map((row) => row.parentId)
    .filter((id): id is string => Boolean(id));
  const invalidParentIds = await getInvalidParentIds(
    db,
    "task",
    session.user.id,
    parentIds,
    incomingIds,
  );
  if (invalidParentIds.length > 0) {
    return new Response("Invalid parent reference", { status: 400 });
  }

  const existing = await db.query.task.findMany({
    where: and(eq(task.userId, session.user.id), eq(task.taskDate, date)),
  });
  const existingById = new Map(existing.map((row) => [row.id, row]));

  const inserts = [] as typeof incoming;
  const updates = [] as typeof incoming;

  for (const row of incoming) {
    if (existingById.has(row.id)) {
      updates.push(row);
    } else {
      inserts.push(row);
    }
  }

  if (updates.length > 0) {
    for (const row of updates) {
      const previous = existingById.get(row.id);
      let completedAt = previous?.completedAt ?? null;
      if (row.status === "done") {
        if (!completedAt) completedAt = now;
      } else {
        completedAt = null;
      }

      await db
        .update(task)
        .set({
          parentId: row.parentId,
          depth: row.depth,
          status: row.status,
          body: row.body,
          taskDate: row.taskDate,
          sortOrder: row.sortOrder,
          updatedAt: now,
          completedAt,
        })
        .where(and(eq(task.id, row.id), eq(task.userId, session.user.id)));
    }
  }

  if (inserts.length > 0) {
    await db.insert(task).values(inserts);
  }

  const deleteIds = existing
    .filter((row) => !incomingIds.has(row.id))
    .map((row) => row.id);
  if (deleteIds.length > 0) {
    await db
      .delete(task)
      .where(
        and(
          eq(task.userId, session.user.id),
          eq(task.taskDate, date),
          inArray(task.id, deleteIds),
        ),
      );
  }

  return Response.json({ ok: true, updatedAt: now.getTime() });
}
