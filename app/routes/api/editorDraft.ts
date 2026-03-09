import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getAuth } from "~/lib/auth.server";
import { editorDraft } from "~/database/schema";
import { getDbFromContext } from "~/utils/db.service.server";
import { decryptAtRest, encryptAtRest } from "~/utils/encryption.server";

const isValidMode = (mode: unknown): mode is "notes" | "todos" =>
  mode === "notes" || mode === "todos";

const isValidDate = (value: unknown): value is string =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");
  const date = url.searchParams.get("date");

  if (!isValidMode(mode) || !isValidDate(date)) {
    return new Response("Invalid parameters", { status: 400 });
  }

  const db = getDbFromContext(context);
  const draft = await db.query.editorDraft.findFirst({
    where: and(
      eq(editorDraft.userId, userId),
      eq(editorDraft.mode, mode),
      eq(editorDraft.editorDate, date),
    ),
  });

  if (!draft) {
    return Response.json({ content: null, updatedAt: null });
  }

  let content: unknown = null;
  try {
    const decryptedContent = await decryptAtRest(
      draft.content,
      context.cloudflare.env,
    );
    content = JSON.parse(decryptedContent);
  } catch {
    content = null;
  }

  return Response.json({
    content,
    updatedAt: draft.updatedAt ? draft.updatedAt.getTime() : null,
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

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

  const contentString = JSON.stringify(content ?? null);
  const encryptedContent = await encryptAtRest(
    contentString,
    context.cloudflare.env,
  );
  const now = new Date();

  const db = getDbFromContext(context);
  await db
    .insert(editorDraft)
    .values({
      id: nanoid(),
      userId,
      mode,
      editorDate: date,
      content: encryptedContent,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [editorDraft.userId, editorDraft.mode, editorDraft.editorDate],
      set: {
        content: encryptedContent,
        updatedAt: now,
      },
    });

  return Response.json({ ok: true, updatedAt: now.getTime() });
}
