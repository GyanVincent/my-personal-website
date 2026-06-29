import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FolderKanban, Award, PenSquare, Inbox, Download, Eye, ArrowUpRight, Sparkles } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { AdminCard, PageHeader } from "@/components/admin/AdminCard";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Overview,
});

type Stats = {
  projects: number; certificates: number; posts: number; messages: number;
  downloads: number; views: number; unreadMessages: number;
};

function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [viewSeries, setViewSeries] = useState<any[]>([]);
  const [downloadSeries, setDownloadSeries] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [p, c, b, m, mu, dl, pv, msgs, pv30, dl30] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("certificates").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        (supabase as any).from("contact_messages").select("id", { count: "exact", head: true }).eq("read", false),
        (supabase as any).from("cv_downloads").select("id", { count: "exact", head: true }),
        (supabase as any).from("page_views").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(5),
        (supabase as any).from("page_views").select("created_at").gte("created_at", new Date(Date.now() - 30*86400000).toISOString()),
        (supabase as any).from("cv_downloads").select("created_at").gte("created_at", new Date(Date.now() - 30*86400000).toISOString()),
      ]);
      setStats({
        projects: p.count ?? 0,
        certificates: c.count ?? 0,
        posts: b.count ?? 0,
        messages: m.count ?? 0,
        unreadMessages: mu.count ?? 0,
        downloads: dl.count ?? 0,
        views: pv.count ?? 0,
      });
      setRecentMessages(msgs.data ?? []);
      setViewSeries(bucketByDay(pv30.data ?? [], "views"));
      setDownloadSeries(bucketByDay(dl30.data ?? [], "downloads"));
    })();
  }, []);

  const cards = [
    { label: "Projects", value: stats?.projects, icon: FolderKanban, color: "from-[#8B5CF6] to-[#6D28D9]" },
    { label: "Certificates", value: stats?.certificates, icon: Award, color: "from-[#06B6D4] to-[#0891B2]" },
    { label: "Blog posts", value: stats?.posts, icon: PenSquare, color: "from-[#EC4899] to-[#BE185D]" },
    { label: "Messages", value: stats?.messages, icon: Inbox, color: "from-[#F59E0B] to-[#D97706]", badge: stats?.unreadMessages },
    { label: "CV downloads", value: stats?.downloads, icon: Download, color: "from-[#10B981] to-[#059669]" },
    { label: "Page views", value: stats?.views, icon: Eye, color: "from-[#3B82F6] to-[#1D4ED8]" },
  ];

  return (
    <div>
      <PageHeader title="Welcome back, Vincent" description="Here's what's happening across your portfolio." />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#161616] p-5">
              <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${c.color} opacity-15 blur-2xl`} />
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${c.color} inline-flex items-center justify-center shadow-lg`}>
                  <c.icon size={18} className="text-white" />
                </div>
                {c.badge && c.badge > 0 ? <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8B5CF6] text-white">{c.badge} new</span> : null}
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight">{c.value ?? "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <AdminCard>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Page views (30 days)</h3>
              <p className="text-xs text-muted-foreground">Daily visitor activity</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewSeries}>
                <defs>
                  <linearGradient id="gView" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="day" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#161616", border: "1px solid #ffffff20", borderRadius: 12 }} />
                <Area type="monotone" dataKey="views" stroke="#8B5CF6" strokeWidth={2} fill="url(#gView)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard delay={0.1}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">CV downloads (30 days)</h3>
              <p className="text-xs text-muted-foreground">Resume download activity</p>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={downloadSeries}>
                <CartesianGrid stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="day" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#161616", border: "1px solid #ffffff20", borderRadius: 12 }} />
                <Bar dataKey="downloads" fill="#06B6D4" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <AdminCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent messages</h3>
            <Link to="/admin/messages" className="text-xs text-[#06B6D4] hover:underline inline-flex items-center gap-1">View all <ArrowUpRight size={12} /></Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No messages yet.</p>
          ) : (
            <div className="space-y-2">
              {recentMessages.map((m) => (
                <div key={m.id} className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{m.name} <span className="text-muted-foreground font-normal">— {m.subject}</span></p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{m.message}</p>
                  </div>
                  {!m.read && <span className="h-2 w-2 rounded-full bg-[#8B5CF6] shrink-0 mt-2" />}
                </div>
              ))}
            </div>
          )}
        </AdminCard>
        <AdminCard delay={0.1}>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Sparkles size={16} className="text-[#06B6D4]" /> Quick actions</h3>
          <div className="space-y-2">
            {[
              { to: "/admin/projects", label: "Add a project" },
              { to: "/admin/blog", label: "Write a blog post" },
              { to: "/admin/certificates", label: "Upload a certificate" },
              { to: "/admin/cv", label: "Update your CV" },
            ].map((q) => (
              <Link key={q.to} to={q.to} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/3 hover:bg-gradient-to-r hover:from-[#8B5CF6]/10 hover:to-[#06B6D4]/10 transition group">
                <span className="text-sm">{q.label}</span>
                <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-[#06B6D4]" />
              </Link>
            ))}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

function bucketByDay(rows: { created_at: string }[], key: string) {
  const map = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    map.set(d.toISOString().slice(5,10), 0);
  }
  for (const r of rows) {
    const k = new Date(r.created_at).toISOString().slice(5,10);
    if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([day, n]) => ({ day, [key]: n }));
}
