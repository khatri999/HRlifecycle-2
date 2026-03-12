import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TaskDetailDialog } from "@/components/shared/TaskDetailDialog";
import { onboardingTasks, exitTasks, employees, type OnboardingTask, type ExitTask } from "@/data/mockData";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, Paperclip } from "lucide-react";

type CombinedTask = (OnboardingTask | ExitTask) & { type: "onboarding" | "exit" };

const Tasks = () => {
  const allTasks: CombinedTask[] = [
    ...onboardingTasks.map((t) => ({ ...t, type: "onboarding" as const })),
    ...exitTasks.map((t) => ({ ...t, type: "exit" as const })),
  ];
  const [filter, setFilter] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<CombinedTask | null>(null);

  const filtered = filter === "all" ? allTasks : allTasks.filter((t) => t.status === filter);
  const getEmployeeName = (id: string) => employees.find((e) => e.id === id)?.name || "Unknown";

  const filters = [
    { value: "all", label: "All", count: allTasks.length },
    { value: "pending", label: "Pending", count: allTasks.filter((t) => t.status === "pending").length },
    { value: "in-progress", label: "In Progress", count: allTasks.filter((t) => t.status === "in-progress").length },
    { value: "completed", label: "Completed", count: allTasks.filter((t) => t.status === "completed").length },
  ];

  return (
    <AppLayout title="Task Management" subtitle="All onboarding and exit tasks">
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Task</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">For Employee</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Assigned To</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <p className="font-medium text-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.description}</p>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{getEmployeeName(task.employeeId)}</td>
                  <td className="py-3 px-4 text-muted-foreground">{task.assignedTo}</td>
                  <td className="py-3 px-4">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", task.type === "onboarding" ? "bg-info/10 text-info" : "bg-warning/10 text-warning")}>
                      {task.type === "onboarding" ? "Onboarding" : "Exit"}
                    </span>
                  </td>
                  <td className="py-3 px-4"><StatusBadge status={task.status} /></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {task.comments.length > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <MessageSquare className="w-3 h-3" /> {task.comments.length}
                        </span>
                      )}
                      {task.attachments.length > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Paperclip className="w-3 h-3" /> {task.attachments.length}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        employeeName={selectedTask ? getEmployeeName(selectedTask.employeeId) : undefined}
      />
    </AppLayout>
  );
};

export default Tasks;
