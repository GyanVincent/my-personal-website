import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, User, GraduationCap, Wrench, FolderKanban, Award, Briefcase,
  PenSquare, MessageSquare, Inbox, BarChart3, Settings, LogOut, Menu, X, ShieldCheck, FileBadge, Lock, Users,

} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LOGO_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAdminRoles } from "@/lib/admin/useRoles";
import { can, isAdminUser, moduleForPath, ROLE_LABEL, type AdminModule } from "@/lib/admin/rbac";

const NAV: { to: string; label: string; icon: any; exact?: boolean; module: AdminModule }[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true, module: "overview" },
  { to: "/admin/profile", label: "Profile", icon: User, module: "profile" },
  { to: "/admin/education", label: "Education", icon: GraduationCap, module: "education" },
  { to: "/admin/skills", label: "Skills", icon: Wrench, module: "skills" },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban, module: "projects" },
  { to: "/admin/certificates", label: "Certificates", icon: Award, module: "certificates" },
  { to: "/admin/cv", label: "Resume / CV", icon: FileBadge, module: "cv" },
  { to: "/admin/services", label: "Services", icon: Briefcase, module: "services" },
  { to: "/admin/blog", label: "Blog", icon: PenSquare, module: "blog" },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquare, module: "testimonials" },
  { to: "/admin/messages", label: "Messages", icon: Inbox, module: "messages" },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, module: "analytics" },
  { to: "/admin/roles", label: "Roles", icon: Users, module: "roles" },
  { to: "/admin/settings", label: "Settings", icon: Settings, module: "settings" },

];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { roles, userId, loading } = useAdminRoles();

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  async function claimAdmin() {
    if (!userId) return;
    const { data: existing } = await supabase.from("user_roles").select("id").eq("role", "admin").limit(1);
    if ((existing ?? []).length > 0) { toast.error("An admin already exists."); return; }
    const { error } = await supabase.rpc("claim_first_admin");
    if (error) { toast.error(error.message); return; }
    toast.success("You're now the admin!");
    window.location.reload();
  }

  if (loading || roles === null) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  }

  if (!isAdminUser(roles)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <ShieldCheck className="mx-auto text-[#8B5CF6] mb-4" size={40} />
          <h1 className="text-2xl font-bold">Admin access required</h1>
          <p className="text-sm text-muted-foreground mt-2">You don't have a staff role on this site. If you're the site owner and no admin exists yet, claim the admin role below.</p>
          <button onClick={claimAdmin} className="mt-6 rounded-xl px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4]">Claim admin role</button>
          <button onClick={signOut} className="mt-3 ml-2 rounded-xl px-5 py-2.5 text-sm font-medium bg-white/5 hover:bg-white/10">Sign out</button>
        </div>
      </div>
    );
  }

  const isActive = (to: string, exact?: boolean) => exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
  const visibleNav = NAV.filter((item) => can(roles, item.module, "read"));
  const activeModule = moduleForPath(pathname);
  const hasRouteAccess = activeModule === null ? true : can(roles, activeModule, "read");
  const primaryRoleLabel = roles.includes("admin") ? ROLE_LABEL.admin : roles.includes("editor") ? ROLE_LABEL.editor : ROLE_LABEL.moderator;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-white/5 bg-[#0A0A0A]/95 backdrop-blur-xl transition-all duration-300 sticky top-0 h-screen",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
          <img src={LOGO_URL} alt="" className="h-9 w-9 rounded-lg ring-1 ring-[#8B5CF6]/40 shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">VinTechAI</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{primaryRoleLabel}</p>
            </div>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {visibleNav.map((item) => {
            const active = isActive(item.to, item.exact);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition group relative",
                  active
                    ? "bg-gradient-to-r from-[#8B5CF6]/20 to-[#06B6D4]/10 text-white"
                    : "text-muted-foreground hover:text-white hover:bg-white/5",
                )}
                title={collapsed ? item.label : undefined}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-gradient-to-b from-[#8B5CF6] to-[#06B6D4] rounded-r" />}
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-white/5 space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition"
            title={collapsed ? "Expand" : "Collapse"}
          >
            <Menu size={18} />
            {!collapsed && <span>Collapse</span>}
          </button>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition">
            <LogOut size={18} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="lg:hidden fixed inset-0 bg-black/70 z-40" />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "tween", duration: 0.25 }} className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#0A0A0A] border-r border-white/5 z-50 flex flex-col">
              <div className="flex items-center justify-between px-4 py-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <img src={LOGO_URL} alt="" className="h-9 w-9 rounded-lg ring-1 ring-[#8B5CF6]/40" />
                  <div>
                    <p className="font-semibold text-sm">VinTechAI Admin</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{primaryRoleLabel}</p>
                  </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="h-8 w-8 rounded-lg bg-white/5 inline-flex items-center justify-center"><X size={16} /></button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                {visibleNav.map((item) => {
                  const active = isActive(item.to, item.exact);
                  return (
                    <Link key={item.to} to={item.to} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition", active ? "bg-gradient-to-r from-[#8B5CF6]/20 to-[#06B6D4]/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5")}>
                      <item.icon size={18} /> {item.label}
                    </Link>
                  );
                })}
              </nav>
              <button onClick={signOut} className="m-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10"><LogOut size={18} /> Sign out</button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-30 bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="h-9 w-9 rounded-lg bg-white/5 inline-flex items-center justify-center"><Menu size={18} /></button>
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="" className="h-7 w-7 rounded-md ring-1 ring-[#8B5CF6]/40" />
            <span className="font-semibold text-sm">Admin</span>
          </div>
          <div className="w-9" />
        </header>
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-[1400px] w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {hasRouteAccess ? children : <ForbiddenView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function ForbiddenView() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#06B6D4]/10 inline-flex items-center justify-center mb-4 ring-1 ring-white/10">
          <Lock className="text-[#8B5CF6]" size={24} />
        </div>
        <h1 className="text-2xl font-bold">Access denied</h1>
        <p className="text-sm text-muted-foreground mt-2">Your role doesn't include permission to view this module. Ask an administrator if you believe this is a mistake.</p>
        <Link to="/admin" className="inline-flex mt-6 rounded-xl px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4]">Back to overview</Link>
      </div>
    </div>
  );
}
