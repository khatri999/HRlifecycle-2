import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/shared/MetricCard";
import { BarChart3, TrendingUp, Clock, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const onboardingData = [
  { month: "Oct", completed: 4 },
  { month: "Nov", completed: 6 },
  { month: "Dec", completed: 3 },
  { month: "Jan", completed: 5 },
  { month: "Feb", completed: 7 },
  { month: "Mar", completed: 3 },
];

const attritionData = [
  { name: "Engineering", value: 3 },
  { name: "Marketing", value: 2 },
  { name: "Design", value: 1 },
  { name: "Finance", value: 1 },
];

const exitReasons = [
  { reason: "Better opportunity", count: 4 },
  { reason: "Personal reasons", count: 2 },
  { reason: "Relocation", count: 1 },
  { reason: "Higher education", count: 1 },
];

const COLORS = [
  "hsl(173, 58%, 39%)",
  "hsl(210, 100%, 52%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 51%)",
];

const Reports = () => {
  return (
    <AppLayout title="Reports & Insights" subtitle="HR analytics and trends">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Onboarding Rate" value="72%" icon={TrendingUp} subtitle="Completion this quarter" />
        <MetricCard title="Avg. Onboarding Time" value="12 days" icon={Clock} subtitle="Target: 10 days" iconClassName="bg-warning/10 text-warning" />
        <MetricCard title="Attrition Rate" value="8.5%" icon={Users} subtitle="Last 6 months" iconClassName="bg-destructive/10 text-destructive" />
        <MetricCard title="Exit Interviews" value="92%" icon={BarChart3} subtitle="Completion rate" iconClassName="bg-success/10 text-success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
          <h3 className="font-display font-semibold text-foreground mb-4">Monthly Onboarding</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={onboardingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(220, 10%, 46%)" }} />
              <Tooltip />
              <Bar dataKey="completed" fill="hsl(173, 58%, 39%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
          <h3 className="font-display font-semibold text-foreground mb-4">Attrition by Department</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={attritionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {attritionData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {attritionData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-medium text-foreground ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 animate-fade-in">
          <h3 className="font-display font-semibold text-foreground mb-4">Exit Reason Analysis</h3>
          <div className="space-y-3">
            {exitReasons.map((r) => (
              <div key={r.reason} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-40 shrink-0">{r.reason}</span>
                <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(r.count / 8) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-8 text-right">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Reports;
