export type UserTier = "free" | "plus" | "vip" | "trial";

export const TRIAL_DURATION_DAYS = 60;
export const TRIAL_DURATION_MS = TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;

export type TierFeature =
  | "audioBreakdown"
  | "weeklySummary"
  | "onDemandSummary"
  | "assistedScheduling"
  | "workingHours";

const PLUS_ENTITLEMENTS: Record<TierFeature, boolean> = {
  audioBreakdown: true,
  weeklySummary: true,
  onDemandSummary: true,
  assistedScheduling: true,
  workingHours: true,
};
const FREE_ENTITLEMENTS: Record<TierFeature, boolean> = {
  audioBreakdown: false,
  weeklySummary: false,
  onDemandSummary: false,
  assistedScheduling: false,
  workingHours: false,
};

export const TIER_ENTITLEMENTS: Record<
  UserTier,
  Record<TierFeature, boolean>
> = {
  free: FREE_ENTITLEMENTS,
  plus: PLUS_ENTITLEMENTS,
  vip: PLUS_ENTITLEMENTS,
  trial: PLUS_ENTITLEMENTS, // effective until expiry; caller must resolve first
};

export function hasEntitlement(tier: UserTier, feature: TierFeature): boolean {
  return TIER_ENTITLEMENTS[tier][feature];
}
