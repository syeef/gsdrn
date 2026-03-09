import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { and, eq, inArray } from "drizzle-orm";
import {
  label,
  note,
  noteLabel,
  task,
  taskLabel,
} from "~/database/schema";
import { getAuth } from "~/lib/auth.server";
import { getDbFromContext } from "~/utils/db.service.server";
import { isLabelColor, isLabelMode, isNonEmptyId } from "~/utils/labels";

const isIntent = (value: unknown): value is "assign" | "unassign" =>
  value === "assign" || value === "unassign";

const isValidDate = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const db = getDbFromContext(context);
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");
  const date = url.searchParams.get("date");

  if (!isLabelMode(mode) || !isValidDate(date)) {
    return Response.json(
      { ok: false, error: "Invalid mode or date." },
      { status: 400 },
    );
  }

  if (mode === "todos") {
    const rows = await db
      .select({
        itemId: taskLabel.taskId,
        labelId: label.id,
        name: label.name,
        color: label.color,
      })
      .from(taskLabel)
      .innerJoin(
        task,
        and(eq(task.id, taskLabel.taskId), eq(task.userId, userId), eq(task.taskDate, date)),
      )
      .innerJoin(
        label,
        and(eq(label.id, taskLabel.labelId), eq(label.userId, userId)),
      )
      .where(eq(taskLabel.userId, userId));

    const byItem: Record<string, Array<{ id: string; name: string; color: string }>> = {};
    for (const row of rows) {
      const list = byItem[row.itemId] ?? [];
      list.push({
        id: row.labelId,
        name: row.name,
        color: isLabelColor(row.color) ? row.color : "gray",
      });
      byItem[row.itemId] = list;
    }

    return Response.json({ ok: true, itemLabels: byItem });
  }

  const rows = await db
    .select({
      itemId: noteLabel.noteId,
      labelId: label.id,
      name: label.name,
      color: label.color,
    })
    .from(noteLabel)
    .innerJoin(
      note,
      and(eq(note.id, noteLabel.noteId), eq(note.userId, userId), eq(note.noteDate, date)),
    )
    .innerJoin(
      label,
      and(eq(label.id, noteLabel.labelId), eq(label.userId, userId)),
    )
    .where(eq(noteLabel.userId, userId));

  const byItem: Record<string, Array<{ id: string; name: string; color: string }>> = {};
  for (const row of rows) {
    const list = byItem[row.itemId] ?? [];
    list.push({
      id: row.labelId,
      name: row.name,
      color: isLabelColor(row.color) ? row.color : "gray",
    });
    byItem[row.itemId] = list;
  }

  return Response.json({ ok: true, itemLabels: byItem });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;
  const db = getDbFromContext(context);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return Response.json({ ok: false, error: "Invalid payload." }, { status: 400 });
  }

  const { intent, mode, itemId, labelId } = payload as {
    intent?: unknown;
    mode?: unknown;
    itemId?: unknown;
    labelId?: unknown;
  };

  if (!isIntent(intent)) {
    return Response.json({ ok: false, error: "Invalid intent." }, { status: 400 });
  }
  if (!isLabelMode(mode)) {
    return Response.json({ ok: false, error: "Invalid mode." }, { status: 400 });
  }
  if (!isNonEmptyId(itemId) || !isNonEmptyId(labelId)) {
    return Response.json(
      { ok: false, error: "Invalid itemId or labelId." },
      { status: 400 },
    );
  }

  const labelRow = await db.query.label.findFirst({
    where: and(eq(label.userId, userId), eq(label.id, labelId)),
  });
  if (!labelRow) {
    return Response.json({ ok: false, error: "Label not found." }, { status: 404 });
  }

  const now = new Date();

  if (mode === "todos") {
    const taskRow = await db.query.task.findFirst({
      where: and(eq(task.userId, userId), eq(task.id, itemId)),
    });
    if (!taskRow) {
      return Response.json({ ok: false, error: "Task not found." }, { status: 404 });
    }

    if (intent === "assign") {
      await db
        .insert(taskLabel)
        .values({ userId, taskId: itemId, labelId, createdAt: now })
        .onConflictDoNothing({
          target: [taskLabel.userId, taskLabel.taskId, taskLabel.labelId],
        });
    } else {
      await db.delete(taskLabel).where(
        and(
          eq(taskLabel.userId, userId),
          eq(taskLabel.taskId, itemId),
          eq(taskLabel.labelId, labelId),
        ),
      );
    }

    const rows = await db.query.taskLabel.findMany({
      where: and(eq(taskLabel.userId, userId), eq(taskLabel.taskId, itemId)),
    });
    const assignedLabelIds = rows.map((row) => row.labelId);
    const assignedLabels = assignedLabelIds.length
      ? await db.query.label.findMany({
          where: and(
            eq(label.userId, userId),
            inArray(label.id, assignedLabelIds),
          ),
        })
      : [];

    return Response.json({
      ok: true,
      assignedLabelIds,
      assignedLabels: assignedLabels
        .map((row) => ({
          id: row.id,
          name: row.name,
          color: isLabelColor(row.color) ? row.color : "gray",
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    });
  }

  const noteRow = await db.query.note.findFirst({
    where: and(eq(note.userId, userId), eq(note.id, itemId)),
  });
  if (!noteRow) {
    return Response.json({ ok: false, error: "Note not found." }, { status: 404 });
  }

  if (intent === "assign") {
    await db
      .insert(noteLabel)
      .values({ userId, noteId: itemId, labelId, createdAt: now })
      .onConflictDoNothing({
        target: [noteLabel.userId, noteLabel.noteId, noteLabel.labelId],
      });
  } else {
    await db.delete(noteLabel).where(
      and(
        eq(noteLabel.userId, userId),
        eq(noteLabel.noteId, itemId),
        eq(noteLabel.labelId, labelId),
      ),
    );
  }

  const rows = await db.query.noteLabel.findMany({
    where: and(eq(noteLabel.userId, userId), eq(noteLabel.noteId, itemId)),
  });
  const assignedLabelIds = rows.map((row) => row.labelId);
  const assignedLabels = assignedLabelIds.length
    ? await db.query.label.findMany({
        where: and(eq(label.userId, userId), inArray(label.id, assignedLabelIds)),
      })
    : [];

  return Response.json({
    ok: true,
    assignedLabelIds,
    assignedLabels: assignedLabels
      .map((row) => ({
        id: row.id,
        name: row.name,
        color: isLabelColor(row.color) ? row.color : "gray",
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  });
}
