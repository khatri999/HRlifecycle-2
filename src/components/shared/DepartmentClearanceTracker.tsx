import { getDepartmentClearance, type ExitTask } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  tasks: ExitTask[];
}

export function DepartmentClearanceTracker({ tasks }: Props) {
  const clearance = getDepartmentClearance(tasks);
  const overallCompleted = tasks.filter((t) => t.status === "completed").length;
  const overallProgress = tasks.length > 0 ? Math.round((overallCompleted / tasks.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Overall */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Clearance</span>
        <div className="flex-1">
          <Progress value={overallProgress} className="h-2.5" />
        </div>
        <span className="text-xs font-semibold text-foreground">{overallProgress}%</span>
      </div>

      {/* Per department */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {clearance.map((dept) => (
          <div key={dept.department} className="bg-muted/30 rounded-lg p-3 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-foreground">{dept.department}</span>
              {dept.progress === 100 ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </div>
            <Progress
              value={dept.progress}
              className={cn("h-1.5", dept.progress === 100 && "[&>div]:bg-success")}
            />
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {dept.completed}/{dept.total} tasks completed
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
