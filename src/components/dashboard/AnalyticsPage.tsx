import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Clock, Mail, Zap, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { supabase } from "@/integrations/supabase/client";

const AnalyticsPage = () => {
  const [stats, setStats] = useState({ total: 0, unread: 0, starred: 0, read: 0 });
  const [weeklyData, setWeeklyData] = useState<{ day: string; emails: number; read: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const { data: emails, error } = await supabase
        .from("emails")
        .select("is_read, is_starred, category, created_at");

      if (error || !emails) {
        setLoading(false);
        return;
      }

      // Stats
      const total = emails.length;
      const unread = emails.filter((e) => !e.is_read).length;
      const starred = emails.filter((e) => e.is_starred).length;
      const read = emails.filter((e) => e.is_read).length;
      setStats({ total, unread, starred, read });

      // Weekly data - last 7 days
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weekly: Record<string, { emails: number; read: number }> = {};
      for (const d of days) weekly[d] = { emails: 0, read: 0 };

      for (const e of emails) {
        if (!e.created_at) continue;
        const dayName = days[new Date(e.created_at).getDay()];
        weekly[dayName].emails++;
        if (e.is_read) weekly[dayName].read++;
      }
      setWeeklyData(days.map((d) => ({ day: d, emails: weekly[d].emails, read: weekly[d].read })));

      // Category data
      const cats: Record<string, number> = {};
      for (const e of emails) {
        const cat = e.category || "uncategorized";
        cats[cat] = (cats[cat] || 0) + 1;
      }
      setCategoryData(Object.entries(cats).map(([name, count]) => ({ name, count })));

      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  const responseRate = stats.total > 0 ? Math.round((stats.read / stats.total) * 100) : 0;

  const statCards = [
    { icon: Mail, label: "Total Emails", value: stats.total.toString() },
    { icon: Zap, label: "Unread", value: stats.unread.toString() },
    { icon: Clock, label: "Starred", value: stats.starred.toString() },
    { icon: TrendingUp, label: "Read Rate", value: `${responseRate}%` },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Your real email insights</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-heading font-bold">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats.total === 0 ? (
        <div className="glass-card p-8 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">No email data yet. Sync your Gmail to see analytics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h3 className="font-heading font-semibold mb-4">Email Volume by Day</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(222 47% 10%)", border: "1px solid hsl(222 30% 18%)", borderRadius: "8px", color: "hsl(210 40% 98%)" }} />
                <Bar dataKey="emails" fill="hsl(173 80% 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="read" fill="hsl(173 80% 45% / 0.3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-5">
            <h3 className="font-heading font-semibold mb-4">By Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip contentStyle={{ background: "hsl(222 47% 10%)", border: "1px solid hsl(222 30% 18%)", borderRadius: "8px", color: "hsl(210 40% 98%)" }} />
                <Bar dataKey="count" fill="hsl(173 80% 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
