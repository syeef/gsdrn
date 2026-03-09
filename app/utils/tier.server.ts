import { eq } from "drizzle-orm";
import { userExt } from "~/database/schema";
import type { DB } from "~/utils/db.service.server";
import { TRIAL_DURATION_MS, type UserTier } from "~/utils/tier";

export async function resolveUserTier(
  user: { id: string; createdAt: Date },
  storedTier: UserTier,
  db: DB,
): Promise<UserTier> {
  if (
    storedTier === "trial" &&
    Date.now() > user.createdAt.getTime() + TRIAL_DURATION_MS
  ) {
    await db
      .update(userExt)
      .set({ tier: "free", updatedAt: new Date() })
      .where(eq(userExt.userId, user.id));
    return "free";
  }
  return storedTier;
}
