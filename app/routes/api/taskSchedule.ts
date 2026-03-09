import { eq } from "drizzle-orm";
import type { ActionFunctionArgs } from "react-router";
import { userExt } from "~/database/schema";
import { getAuth } from "~/lib/auth.server";
import { hasCalendarWriteScope } from "~/server/googleCalendar.server";
import {
  isValidTimeZone,
  scheduleTaskForUser,
  type TaskScheduleResult,
} from "~/server/taskScheduling.server";
import { getDbFromContext } from "~/utils/db.service.server";
import { hasEntitlement, type UserTier } from "~/utils/tier";
import { resolveUserTier } from "~/utils/tier.server";

async function resolveTierForUser(
  db: ReturnType<typeof getDbFromContext>,
  user: { id: string; createdAt: Date },
): Promise<UserTier> {
  const ext = await db.query.userExt.findFirst({
    where: eq(userExt.userId, user.id),
  });
  const storedTier = (ext?.tier ?? "free") as UserTier;
  return resolveUserTier(user, storedTier, db);
}

function toStatus(result: TaskScheduleResult): number {
  if (result.ok) return 200;
  switch (result.code) {
    case "FORBIDDEN":
      return 403;
    case "NEEDS_GOOGLE_WRITE_SCOPE":
      return 403;
    case "TASK_NOT_FOUND":
      return 404;
    case "TASK_DONE":
      return 409;
    case "NO_SLOT_FOUND":
      return 422;
    case "CALENDAR_NOT_CONNECTED":
      return 409;
    default:
      return 500;
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return Response.json(
      { ok: false, code: "FORBIDDEN", error: "Unauthorized" },
      { status: 401 },
    );
  }

  const user = session.user as { id: string; createdAt: Date };
  const db = getDbFromContext(context);
  const tier = await resolveTierForUser(db, user);
  if (!hasEntitlement(tier, "assistedScheduling")) {
    return Response.json({ ok: false, code: "FORBIDDEN" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { ok: false, code: "INTERNAL", error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const taskId =
    typeof payload === "object" && payload !== null
      ? (payload as { taskId?: unknown }).taskId
      : undefined;
  const timeZone =
    typeof payload === "object" && payload !== null
      ? (payload as { timeZone?: unknown }).timeZone
      : undefined;

  if (typeof taskId !== "string" || taskId.trim().length === 0) {
    return Response.json(
      { ok: false, code: "INTERNAL", error: "Missing taskId." },
      { status: 400 },
    );
  }
  if (typeof timeZone !== "string" || !isValidTimeZone(timeZone)) {
    return Response.json(
      { ok: false, code: "INTERNAL", error: "Missing or invalid timeZone." },
      { status: 400 },
    );
  }

  const hasWriteScope = await hasCalendarWriteScope(db, user.id);
  if (!hasWriteScope) {
    return Response.json(
      {
        ok: false,
        code: "NEEDS_GOOGLE_WRITE_SCOPE",
      },
      { status: 403 },
    );
  }

  const env = context.cloudflare.env as any;
  const result = await scheduleTaskForUser(db, env, {
    userId: user.id,
    taskId: taskId.trim(),
    timeZone,
  });

  return Response.json(result, { status: toStatus(result) });
}
