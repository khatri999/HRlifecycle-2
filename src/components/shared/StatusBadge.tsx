import { cn } from "@/lib/utils";

type StatusType = "active" | "onboarding" | "notice-period" | "exited" | "completed" | "in-progress" | "pending" | "overdue" | "not-started" | "resignation-submitted" | "clearance" | "none";

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-success/10 text-success" },
  onboarding: { label: "Onboarding", className: "bg-info/10 text-info" },
  "notice-period": { label: "Notice Period", className: "bg-warning/10 text-warning" },
  exited: { label: "Exited", className: "bg-muted text-muted-foreground" },
  completed: { label: "Completed", className: "bg-success/10 text-success" },
  "in-progress": { label: "In Progress", className: "bg-info/10 text-info" },
  pending: { label: "Pending", className: "bg-warning/10 text-warning" },
  overdue: { label: "Overdue", className: "bg-destructive/10 text-destructive" },
  "not-started": { label: "Not Started", className: "bg-muted text-muted-foreground" },
  "resignation-submitted": { label: "Resignation Submitted", className: "bg-warning/10 text-warning" },
  clearance: { label: "Clearance", className: "bg-info/10 text-info" },
  none: { label: "N/A", className: "bg-muted text-muted-foreground" },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.none;
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", config.className, className)}>
      {config.label}
    </span>
  );
}
