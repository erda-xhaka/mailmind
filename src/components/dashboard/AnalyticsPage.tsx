import { BarChart3, TrendingUp, Clock, Mail, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const weeklyData = [
  { day: "Mon", emails: 24, replied: 18 },
  { day: "Tue", emails: 31, replied: 25 },
  { day: "Wed", emails: 18, replied: 15 },
  { day: "Thu", emails: 42, replied: 35 },
  { day: "Fri", emails: 28, replied: 22 },
  { day: "Sat", emails: 8, replied: 5 },
  { day: "Sun", emails: 5, replied: 3 },
];

const productivityData = [
  { hour: "8AM", score: 65 }, { hour: "9AM", score: 78 }, { hour: "10AM", score: 92 },
  { hour: "11AM", score: 85 }, { hour: "12PM", score: 60 }, { hour: "1PM", score: 55 },
  { hour: "2PM", score: 70 }, { hour: "3PM", score: 88 }, { hour: "4PM", score: 75 },
  { hour: "5PM", score: 45 },
];

const stats = [
  { icon: Mail, label: "Total Emails", value: "156", change: "+12%" },
  { icon: Zap, label: "AI Actions", value: "89", change: "+24%" },
  { icon: Clock, label: "Time Saved", value: "4.2h", change: "+18%" },
  { icon: TrendingUp, label: "Response Rate", value: "94%", change: "+5%" },
];

const AnalyticsPage = () => (
  <div>
    <div className="mb-6">
      <h1 className="font-heading text-2xl font-bold">Analytics</h1>
      <p className="text-muted-foreground text-sm mt-1">Your productivity insights</p>
    </div>

    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
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
          <span className="text-xs text-primary mt-2 block">{s.change} this week</span>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="glass-card p-5">
        <h3 className="font-heading font-semibold mb-4">Email Volume</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyData}>
            <XAxis dataKey="day" stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "hsl(222 47% 10%)", border: "1px solid hsl(222 30% 18%)", borderRadius: "8px", color: "hsl(210 40% 98%)" }} />
            <Bar dataKey="emails" fill="hsl(173 80% 45%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="replied" fill="hsl(173 80% 45% / 0.3)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="glass-card p-5">
        <h3 className="font-heading font-semibold mb-4">Productivity Score</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={productivityData}>
            <XAxis dataKey="hour" stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(215 20% 55%)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "hsl(222 47% 10%)", border: "1px solid hsl(222 30% 18%)", borderRadius: "8px", color: "hsl(210 40% 98%)" }} />
            <Area type="monotone" dataKey="score" stroke="hsl(173 80% 45%)" fill="hsl(173 80% 45% / 0.1)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

export default AnalyticsPage;
