export type ProfileVisibility = "public" | "link_only" | "hidden";

export const normalizeProfileVisibility = (value?: string | null): ProfileVisibility => {
  const normalized = (value || "public").toLowerCase();

  if (normalized === "hidden" || normalized === "private") return "hidden";
  if (normalized === "link_only" || normalized === "unlisted") return "link_only";
  return "public";
};

export const isProfileHidden = (value?: string | null) => normalizeProfileVisibility(value) === "hidden";

export const isProfileUnlisted = (value?: string | null) => normalizeProfileVisibility(value) === "link_only";

export const hasPublicUsername = (username?: string | null) => Boolean(username && username.trim().length > 0);
