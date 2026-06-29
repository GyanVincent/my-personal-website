// Role-based access control for the admin dashboard.
// Roles are stored in public.user_roles (see has_role SECURITY DEFINER fn).
// This file is the single source of truth for which roles may access which
// modules and which actions inside them.

export type AdminRole = "admin" | "editor" | "moderator";

export type AdminModule =
  | "overview"
  | "profile"
  | "education"
  | "skills"
  | "projects"
  | "certificates"
  | "cv"
  | "services"
  | "blog"
  | "testimonials"
  | "messages"
  | "analytics"
  | "settings"
  | "roles";


export type Action = "read" | "write" | "delete";

// Module → roles allowed to read that module
const MODULE_READ: Record<AdminModule, AdminRole[]> = {
  overview:     ["admin", "editor", "moderator"],
  profile:      ["admin", "editor"],
  education:    ["admin", "editor"],
  skills:       ["admin", "editor"],
  projects:     ["admin", "editor"],
  certificates: ["admin", "editor"],
  cv:           ["admin", "editor"],
  services:     ["admin", "editor"],
  blog:         ["admin", "editor", "moderator"],
  testimonials: ["admin", "editor", "moderator"],
  messages:     ["admin", "moderator"],
  analytics:    ["admin", "moderator"],
  settings:     ["admin"],
  roles:        ["admin"],

};

// Module → roles allowed to create/update
const MODULE_WRITE: Record<AdminModule, AdminRole[]> = {
  overview:     [],
  profile:      ["admin", "editor"],
  education:    ["admin", "editor"],
  skills:       ["admin", "editor"],
  projects:     ["admin", "editor"],
  certificates: ["admin", "editor"],
  cv:           ["admin", "editor"],
  services:     ["admin", "editor"],
  blog:         ["admin", "editor"],
  testimonials: ["admin", "editor", "moderator"],
  messages:     ["admin", "moderator"],
  analytics:    [],
  settings:     ["admin"],
  roles:        ["admin"],

};

// Module → roles allowed to delete
const MODULE_DELETE: Record<AdminModule, AdminRole[]> = {
  overview:     [],
  profile:      ["admin"],
  education:    ["admin", "editor"],
  skills:       ["admin", "editor"],
  projects:     ["admin", "editor"],
  certificates: ["admin", "editor"],
  cv:           ["admin", "editor"],
  services:     ["admin", "editor"],
  blog:         ["admin", "editor"],
  testimonials: ["admin", "moderator"],
  messages:     ["admin", "moderator"],
  analytics:    [],
  settings:     ["admin"],
  roles:        ["admin"],
};


export const ROLE_LABEL: Record<AdminRole, string> = {
  admin: "Administrator",
  editor: "Content Editor",
  moderator: "Moderator",
};

export const ALL_ROLES: AdminRole[] = ["admin", "editor", "moderator"];

export function can(roles: AdminRole[], module: AdminModule, action: Action = "read"): boolean {
  const map = action === "write" ? MODULE_WRITE : action === "delete" ? MODULE_DELETE : MODULE_READ;
  const allowed = map[module] ?? [];
  return roles.some((r) => allowed.includes(r));
}

export function isAdminUser(roles: AdminRole[]): boolean {
  return roles.length > 0;
}

// Maps URL path → module key. Used by the layout to gate the active route.
export function moduleForPath(pathname: string): AdminModule | null {
  const p = pathname.replace(/\/$/, "");
  if (p === "/admin" || p === "") return "overview";
  const m = p.match(/^\/admin\/([^/]+)/);
  if (!m) return null;
  const key = m[1] as AdminModule;
  return (key in MODULE_READ) ? key : null;
}
