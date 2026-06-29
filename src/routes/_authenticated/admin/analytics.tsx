import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { AdminCard, PageHeader } from "@/components/admin/AdminCard";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [pageData, setPageData] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<{ path: string; count: number }[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [contactSeries, setContactSeries] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const [pv, dl, ct] = await Promise.all([
        (supabase as any).from("page_views").select("path, created_at").gte("created_at", since),
        (supabase as any).from("cv_downloads").select("created_at").gte("created_at", since),
        supabase.from("contact_messages").select("created_at").gte("created_at", since),
      ]);
      setPageData(bucketByDay(pv.data ?? [], "views"));
      setDownloads(bucketByDay(dl.data ?? [], "downloads"));
      setContactSeries(bucketByDay(ct.data ?? [], "requests"));
      const counts = new Map<string, number>();
      for (const r of pv.data ?? []) counts.set(r.path, (counts.get(r.path) ?? 0) + 1);
      setTopPages(Array.from(counts.entries()).map(([path, count]) => ({ path, count })).sort((a, b) => b.count - a.count).slice(0, 10));
    })();
  }, []);

  return (
    <div>
      <PageHeader title="Analytics" description="Visitor activity, downloads and contact requests over the last 30 days." />

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <AdminCard>
          <h3 className="font-semibold mb-4">Daily page views</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={pageData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="day" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#161616", border: "1px solid #ffffff20", borderRadius: 12 }} />
                <Area type="monotone" dataKey="views" stroke="#8B5CF6" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard delay={0.1}>
          <h3 className="font-semibold mb-4">CV downloads</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={downloads}>
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
          <h3 className="font-semibold mb-4">Contact requests</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={contactSeries}>
                <CartesianGrid stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="day" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#161616", border: "1px solid #ffffff20", borderRadius: 12 }} />
                <Line type="monotone" dataKey="requests" stroke="#EC4899" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard delay={0.1}>
          <h3 className="font-semibold mb-4">Top pages</h3>
          {topPages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data yet.</p>
          ) : (
            <ul className="space-y-2">
              {topPages.map((p) => (
                <li key={p.path} className="flex items-center justify-between text-sm">
                  <span className="truncate text-muted-foreground">{p.path}</span>
                  <span className="text-[#06B6D4] font-medium">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </div>
  );
}

function bucketByDay(rows: { created_at: string }[], key: string) {
  const map = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    map.set(d.toISOString().slice(5, 10), 0);
  }
  for (const r of rows) {
    const k = new Date(r.created_at).toISOString().slice(5, 10);
    if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([day, n]) => ({ day, [key]: n }));
}
