import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, Clock, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export type DeptTask = {
  id: string;
  title: string;
  description?: string | null;
  department: string;
  status: "pending" | "completed" | "issue";
  assigned_to?: string | null;
  deadline?: string | null;
  notes?: string | null;
};

interface Props {
  tasks: DeptTask[];
  onTaskUpdated: (taskId: string, newStatus: "pending" | "completed" | "issue") => void;
  isFinanceCleared: boolean;
}

const DEPT_ORDER = ["Manager", "ProjectCoordinator", "IT", "Admin", "Finance", "HR"];
const DEPT_LABELS: Record<string, string> = {
  Manager: "Manager",
  ProjectCoordinator: "Project Coord.",
  IT: "IT",
  Admin: "Admin",
  Finance: "Finance",
  HR: "HR",
};
const DEPT_COLORS: Record<string, string> = {
  Manager: "text-primary bg-primary/10 border-primary/20",
  ProjectCoordinator: "text-info bg-info/10 border-info/20",
  IT: "text-warning bg-warning/10 border-warning/20",
  Admin: "text-secondary-foreground bg-secondary/50 border-border",
  Finance: "text-success bg-success/10 border-success/20",
  HR: "text-accent-foreground bg-accent/30 border-accent/30",
};

const STATUS_CONFIG = {
  pending: { icon: Clock, label: "Pending", className: "text-muted-foreground bg-muted" },
  completed: { icon: CheckCircle2, label: "Completed", className: "text-success bg-success/10" },
  issue: { icon: AlertTriangle, label: "Issue", className: "text-destructive bg-destructive/10" },
};

export function DeptClearanceBoard({ tasks, onTaskUpdated, isFinanceCleared }: Props) {
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (taskId: string, newStatus: "pending" | "completed" | "issue") => {
    setUpdating(taskId);
    try {
      const { error } = await supabase
        .from("exit_dept_tasks")
        .update({ status: newStatus })
        .eq("id", taskId);
      if (error) throw error;
      onTaskUpdated(taskId, newStatus);
      toast.success(`Task marked as ${newStatus}`);
    } catch {
      toast.error("Failed to update task status");
    } finally {
      setUpdating(null);
    }
  };

  const deptGroups = DEPT_ORDER.map((dept) => ({
    dept,
    tasks: tasks.filter((t) => t.department === dept),
  })).filter((g) => g.tasks.length > 0);

  const totalCompleted = tasks.filter((t) => t.status === "completed").length;
  const overallProgress = tasks.length > 0 ? Math.round((totalCompleted / tasks.length) * 100) : 0;
  const hasIssues = tasks.some((t) => t.status === "issue");

  return (
    <div className="space-y-5">
      {/* Overall progress */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Clearance Progress</span>
            <span className="text-sm font-bold text-foreground">{overallProgress}%</span>
          </div>
          <Progress
            value={overallProgress}
            className={cn("h-2", overallProgress === 100 ? "[&>div]:bg-success" : hasIssues ? "[&>div]:bg-destructive" : "")}
          />
        </div>
        {overallProgress === 100 && (
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
        )}
      </div>

      {/* Department rows */}
      <div className="space-y-4">
        {deptGroups.map(({ dept, tasks: deptTasks }) => {
          const completed = deptTasks.filter((t) => t.status === "completed").length;
          const issues = deptTasks.filter((t) => t.status === "issue").length;
          const deptProgress = deptTasks.length > 0 ? Math.round((completed / deptTasks.length) * 100) : 0;
          const isFinanceDept = dept === "Finance";

          return (
            <div key={dept} className="rounded-xl border border-border overflow-hidden">
              {/* Dept header */}
              <div className={cn("px-4 py-2.5 flex items-center justify-between border-b border-border", DEPT_COLORS[dept] || "bg-muted/30")}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{DEPT_LABELS[dept] || dept}</span>
                  {isFinanceDept && !isFinanceCleared && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-warning bg-warning/20 px-2 py-0.5 rounded-full">
                      <Lock className="w-2.5 h-2.5" /> Unlocks document generation
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {issues > 0 && (
                    <span className="text-[10px] text-destructive font-medium">{issues} issue{issues > 1 ? "s" : ""}</span>
                  )}
                  <span className="text-xs text-muted-foreground">{completed}/{deptTasks.length}</span>
                  {deptProgress === 100 && <CheckCircle2 className="w-4 h-4 text-success" />}
                </div>
              </div>

              {/* Task cards */}
              <div className="divide-y divide-border/50">
                {deptTasks.map((task) => {
                  const StatusIcon = STATUS_CONFIG[task.status].icon;
                  return (
                    <div key={task.id} className="flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/10 transition-colors">
                      <StatusIcon className={cn("w-4 h-4 shrink-0", STATUS_CONFIG[task.status].className.split(" ")[0])} />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground")}>
                          {task.title}
                        </p>
                        {task.assigned_to && (
                          <p className="text-xs text-muted-foreground mt-0.5">{task.assigned_to}{task.deadline ? ` · Due ${task.deadline}` : ""}</p>
                        )}
                      </div>

                      {/* 3-state toggle */}
                      <div className="flex items-center gap-1 shrink-0">
                        {(["pending", "completed", "issue"] as const).map((s) => (
                          <button
                            key={s}
                            disabled={updating === task.id}
                            onClick={() => updateStatus(task.id, s)}
                            className={cn(
                              "px-2 py-1 rounded text-[10px] font-semibold transition-all",
                              task.status === s
                                ? STATUS_CONFIG[s].className
                                : "text-muted-foreground bg-transparent hover:bg-muted"
                            )}
                          >
                            {STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
