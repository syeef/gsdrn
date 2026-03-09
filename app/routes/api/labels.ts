import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { and, eq, like, ne } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
  label,
  note,
  noteLabel,
  task,
  taskLabel,
  type Label as LabelRow,
} from "~/database/schema";
import { getAuth } from "~/lib/auth.server";
import { getDbFromContext } from "~/utils/db.service.server";
import {
  isLabelColor,
  isLabelMode,
  isNonEmptyId,
  normalizeLabelName,
  validateLabelName,
  type LabelDto,
} from "~/utils/labels";

const toLabelDto = (row: LabelRow): LabelDto => ({
  id: row.id,
  name: row.name,
  color: isLabelColor(row.color) ? row.color : "gray",
  createdAt: row.createdAt.getTime(),
  updatedAt: row.updatedAt.getTime(),
});

const isValidIntent = (value: unknown): value is "create" | "update" | "delete" =>
  value === "create" || value === "update" || value === "delete";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const db = getDbFromContext(context);
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const mode = url.searchParams.get("mode");
  const itemId = url.searchParams.get("itemId");

  if ((mode && !itemId) || (!mode && itemId)) {
    return Response.json(
      { ok: false, error: "mode and itemId must be provided together." },
      { status: 400 },
    );
  }

  if (mode && !isLabelMode(mode)) {
    return Response.json({ ok: false, error: "Invalid mode." }, { status: 400 });
  }

  if (itemId && !isNonEmptyId(itemId)) {
    return Response.json({ ok: false, error: "Invalid itemId." }, { status: 400 });
  }

  const search = typeof q === "string" ? normalizeLabelName(q) : "";
  const whereClauses = [eq(label.userId, userId)];
  if (search.length > 0) {
    whereClauses.push(like(label.normalizedName, `%${search}%`));
  }

  const rows = await db.query.label.findMany({
    where: whereClauses.length === 1 ? whereClauses[0] : and(...whereClauses),
  });
  rows.sort((a, b) => a.name.localeCompare(b.name));

  if (!mode || !itemId) {
    return Response.json({
      ok: true,
      labels: rows.map((row) => toLabelDto(row)),
    });
  }

  if (mode === "todos") {
    const taskRow = await db.query.task.findFirst({
      where: and(eq(task.userId, userId), eq(task.id, itemId)),
    });
    if (!taskRow) {
      return Response.json({ ok: false, error: "Task not found." }, { status: 404 });
    }

    const assignments = await db.query.taskLabel.findMany({
      where: and(eq(taskLabel.userId, userId), eq(taskLabel.taskId, itemId)),
    });
    const assignedIds = new Set(assignments.map((row) => row.labelId));

    return Response.json({
      ok: true,
      labels: rows.map((row) => ({
        ...toLabelDto(row),
        assigned: assignedIds.has(row.id),
      })),
    });
  }

  const noteRow = await db.query.note.findFirst({
    where: and(eq(note.userId, userId), eq(note.id, itemId)),
  });
  if (!noteRow) {
    return Response.json({ ok: false, error: "Note not found." }, { status: 404 });
  }

  const assignments = await db.query.noteLabel.findMany({
    where: and(eq(noteLabel.userId, userId), eq(noteLabel.noteId, itemId)),
  });
  const assignedIds = new Set(assignments.map((row) => row.labelId));

  return Response.json({
    ok: true,
    labels: rows.map((row) => ({
      ...toLabelDto(row),
      assigned: assignedIds.has(row.id),
    })),
  });
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

  const { intent } = payload as { intent?: unknown };
  if (!isValidIntent(intent)) {
    return Response.json({ ok: false, error: "Invalid intent." }, { status: 400 });
  }

  if (intent === "create") {
    const { name, color } = payload as { name?: unknown; color?: unknown };
    const nameValidation = validateLabelName(name);
    if (!nameValidation.ok) {
      return Response.json(
        { ok: false, error: nameValidation.error },
        { status: 400 },
      );
    }

    const resolvedColor = color ?? "gray";
    if (!isLabelColor(resolvedColor)) {
      return Response.json({ ok: false, error: "Invalid color." }, { status: 400 });
    }

    const now = new Date();
    const createdId = nanoid();

    await db
      .insert(label)
      .values({
        id: createdId,
        userId,
        name: nameValidation.name,
        normalizedName: nameValidation.normalizedName,
        color: resolvedColor,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoNothing({
        target: [label.userId, label.normalizedName],
      });

    const existing = await db.query.label.findFirst({
      where: and(
        eq(label.userId, userId),
        eq(label.normalizedName, nameValidation.normalizedName),
      ),
    });

    if (!existing) {
      return Response.json(
        { ok: false, error: "Failed to persist label." },
        { status: 500 },
      );
    }

    return Response.json({
      ok: true,
      created: existing.id === createdId,
      label: toLabelDto(existing),
    });
  }

  if (intent === "update") {
    const { id, name, color } = payload as {
      id?: unknown;
      name?: unknown;
      color?: unknown;
    };

    if (!isNonEmptyId(id)) {
      return Response.json({ ok: false, error: "Invalid id." }, { status: 400 });
    }

    const existing = await db.query.label.findFirst({
      where: and(eq(label.userId, userId), eq(label.id, id)),
    });
    if (!existing) {
      return Response.json({ ok: false, error: "Label not found." }, { status: 404 });
    }

    if (name === undefined && color === undefined) {
      return Response.json(
        { ok: false, error: "No changes supplied." },
        { status: 400 },
      );
    }

    const validatedName = name === undefined ? null : validateLabelName(name);
    if (validatedName && !validatedName.ok) {
      return Response.json(
        { ok: false, error: validatedName.error },
        { status: 400 },
      );
    }

    const nextName = validatedName?.ok ? validatedName.name : existing.name;
    const nextNormalizedName = validatedName?.ok
      ? validatedName.normalizedName
      : existing.normalizedName;

    const nextColor = color === undefined ? existing.color : color;
    if (!isLabelColor(nextColor)) {
      return Response.json({ ok: false, error: "Invalid color." }, { status: 400 });
    }

    const duplicate = await db.query.label.findFirst({
      where: and(
        eq(label.userId, userId),
        eq(label.normalizedName, nextNormalizedName),
        ne(label.id, existing.id),
      ),
    });
    if (duplicate) {
      return Response.json(
        { ok: false, error: "A label with this name already exists." },
        { status: 409 },
      );
    }

    const now = new Date();
    await db
      .update(label)
      .set({
        name: nextName,
        normalizedName: nextNormalizedName,
        color: nextColor,
        updatedAt: now,
      })
      .where(and(eq(label.userId, userId), eq(label.id, existing.id)));

    const updated = await db.query.label.findFirst({
      where: and(eq(label.userId, userId), eq(label.id, existing.id)),
    });
    if (!updated) {
      return Response.json(
        { ok: false, error: "Failed to load updated label." },
        { status: 500 },
      );
    }

    return Response.json({ ok: true, label: toLabelDto(updated) });
  }

  const { id } = payload as { id?: unknown };
  if (!isNonEmptyId(id)) {
    return Response.json({ ok: false, error: "Invalid id." }, { status: 400 });
  }

  const existing = await db.query.label.findFirst({
    where: and(eq(label.userId, userId), eq(label.id, id)),
  });
  if (!existing) {
    return Response.json({ ok: false, error: "Label not found." }, { status: 404 });
  }

  await db.delete(label).where(and(eq(label.userId, userId), eq(label.id, id)));
  return Response.json({ ok: true, deletedId: id });
}
