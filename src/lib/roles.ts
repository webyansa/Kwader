import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const ADMIN_ROLES: AppRole[] = ["super_admin", "admin"];
const EDITOR_ROLES: AppRole[] = ["moderator"];
const ORG_ROLES: AppRole[] = ["org_owner", "org_hr_manager", "org_viewer"];
const JOB_SEEKER_ROLES: AppRole[] = ["job_seeker"];

export const isAdmin = (roles: AppRole[]) =>
  roles.some((r) => ADMIN_ROLES.includes(r));

export const isEditor = (roles: AppRole[]) =>
  roles.some((r) => EDITOR_ROLES.includes(r));

export const isPlatformStaff = (roles: AppRole[]) =>
  roles.some((r) => [...ADMIN_ROLES, ...EDITOR_ROLES].includes(r));

export const isOrganization = (roles: AppRole[]) =>
  roles.some((r) => ORG_ROLES.includes(r));

export const isOrgOwner = (roles: AppRole[]) =>
  roles.includes("org_owner");

export const isJobSeeker = (roles: AppRole[]) =>
  roles.some((r) => JOB_SEEKER_ROLES.includes(r));

export const hasRole = (roles: AppRole[], role: AppRole) =>
  roles.includes(role);

export const getRedirectPath = (roles: AppRole[]): string => {
  if (isPlatformStaff(roles)) return "/admin";
  if (isOrganization(roles)) return "/org/dashboard";
  if (isJobSeeker(roles)) return "/jobs";
  return "/";
};

export const canAccessAdmin = (roles: AppRole[]) => isPlatformStaff(roles);
export const canAccessOrg = (roles: AppRole[]) => isOrganization(roles);
export const canAccessJobSeeker = (roles: AppRole[]) => isJobSeeker(roles);
