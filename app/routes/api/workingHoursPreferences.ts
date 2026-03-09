import { eq } from "drizzle-orm";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { userExt } from "~/database/schema";
import { getAuth } from "~/lib/auth.server";
import {
  getWorkingHoursForUser,
  upsertWorkingHoursForUser,
} from "~/server/workingHours.server";
import { getDbFromContext } from "~/utils/db.service.server";
import { resolveUserTier } from "~/utils/tier.server";
import { hasEntitlement, type UserTier } from "~/utils/tier";
import { parseWorkingHoursDocument } from "~/utils/workingHours";

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

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const db = getDbFromContext(context);
  const user = session.user as { id: string; createdAt: Date };
  const tier = await resolveTierForUser(db, user);

  if (!hasEntitlement(tier, "workingHours")) {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const workingHours = await getWorkingHoursForUser(db, user.id);
    return Response.json({ ok: true, workingHours });
  } catch (err) {
    console.error("Error loading working hours preferences:", err);
    return Response.json(
      { ok: false, error: "Failed to load working hours preferences." },
      { status: 500 },
    );
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const db = getDbFromContext(context);
  const user = session.user as { id: string; createdAt: Date };
  const tier = await resolveTierForUser(db, user);

  if (!hasEntitlement(tier, "workingHours")) {
    return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const workingHoursPayload =
    typeof payload === "object" && payload !== null && "workingHours" in payload
      ? (payload as { workingHours?: unknown }).workingHours
      : payload;

  const parsed = parseWorkingHoursDocument(workingHoursPayload);
  if (!parsed.ok || !parsed.workingHours) {
    return Response.json(
      { ok: false, error: parsed.error ?? "Invalid working hours payload." },
      { status: 400 },
    );
  }

  try {
    const workingHours = await upsertWorkingHoursForUser(
      db,
      user.id,
      parsed.workingHours,
    );
    return Response.json({
      ok: true,
      workingHours,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error saving working hours preferences:", err);
    return Response.json(
      { ok: false, error: "Failed to save working hours preferences." },
      { status: 500 },
    );
  }
}

