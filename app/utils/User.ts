type UserLike = {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function getInitials(u?: UserLike | null) {
  if (!u) return "??";
  const pick = (s: string) => (s ? (Array.from(s.trim())[0] ?? "") : "");

  let a = pick(u.firstName ?? "");
  let b = pick(u.lastName ?? "");

  if (!a && !b && u.name) {
    const parts = u.name.trim().split(/\s+/);
    a = pick(parts[0] ?? "");
    b = pick(parts.at(-1) ?? "");
  }

  if (!a && !b && u.email) a = pick(u.email.split("@")[0] ?? "");

  const initials = (a + b).slice(0, 2).toUpperCase();
  return initials || "??";
}

export function getFullName(u?: UserLike | null) {
  if (!u) return "";
  if (u.firstName || u.lastName)
    return [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  return (u.name ?? "").trim();
}
