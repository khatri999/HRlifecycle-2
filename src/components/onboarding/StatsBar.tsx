import { CheckCircle2, Clock, AlertCircle, ListChecks } from "lucide-react";

interface StatsBarProps {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

export default function StatsBar({ total, completed, inProgress, pending }: StatsBarProps) {
  const stats = [
    {
      label: "Total Tasks",
      value: total,
      icon: ListChecks,
      colorClass: "text-primary bg-primary/10",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      colorClass: "text-success bg-success/10",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Clock,
      colorClass: "text-amber bg-amber/10",
    },
    {
      label: "Pending",
      value: pending,
      icon: AlertCircle,
      colorClass: "text-muted-foreground bg-muted",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, colorClass }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-xl bg-card px-4 py-4 shadow-soft border border-border"
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg flex-shrink-0 ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
