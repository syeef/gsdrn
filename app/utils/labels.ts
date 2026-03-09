export const LABEL_COLORS = ["gray", "blue", "green", "orange", "red"] as const;

export type LabelColor = (typeof LABEL_COLORS)[number];
export type LabelMode = "notes" | "todos";

export type LabelDto = {
  id: string;
  name: string;
  color: LabelColor;
  createdAt: number;
  updatedAt: number;
};

export const LABEL_NAME_MIN_LENGTH = 1;
export const LABEL_NAME_MAX_LENGTH = 48;

export const isLabelMode = (value: unknown): value is LabelMode =>
  value === "notes" || value === "todos";

export const isLabelColor = (value: unknown): value is LabelColor =>
  typeof value === "string" &&
  (LABEL_COLORS as readonly string[]).includes(value);

export const sanitizeLabelName = (name: string): string =>
  name.trim().replace(/\s+/g, " ");

export const normalizeLabelName = (name: string): string =>
  sanitizeLabelName(name).toLowerCase();

export const isNonEmptyId = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const validateLabelName = (
  value: unknown,
): { ok: true; name: string; normalizedName: string } | { ok: false; error: string } => {
  if (typeof value !== "string") {
    return { ok: false, error: "Name must be a string." };
  }

  const name = sanitizeLabelName(value);
  if (name.length < LABEL_NAME_MIN_LENGTH || name.length > LABEL_NAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `Name must be between ${LABEL_NAME_MIN_LENGTH} and ${LABEL_NAME_MAX_LENGTH} characters.`,
    };
  }

  return { ok: true, name, normalizedName: normalizeLabelName(name) };
};

