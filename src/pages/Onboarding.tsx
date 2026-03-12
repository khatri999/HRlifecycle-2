import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { TaskDetailDialog } from "@/components/shared/TaskDetailDialog";
import { Progress } from "@/components/ui/progress";
import { employees, onboardingTasks, generateOnboardingTasks, type OnboardingTask } from "@/data/mockData";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronRight, Plus, Sparkles, MessageSquare, Paperclip } from "lucide-react";
import { toast } from "sonner";

const Onboarding = () => {
  const onboardingEmployees = employees.filter(
    (e) => e.status === "onboarding" || e.onboardingStatus === "in-progress"
  );
  const [expandedId, setExpandedId] = useState<string | null>(onboardingEmployees[0]?.id || null);
  const [selectedTask, setSelectedTask] = useState<OnboardingTask | null>(null);
  const [generatedTasksMap, setGeneratedTasksMap] = useState<Record<string, OnboardingTask[]>>({});

  const getTasksForEmployee = (empId: string) => {
    const existing = onboardingTasks.filter((t) => t.employeeId === empId);
    const generated = generatedTasksMap[empId] || [];
    return [...existing, ...generated];
  };

  const handleGenerateTasks = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    const existing = onboardingTasks.filter((t) => t.employeeId === empId);
    if (existing.length > 0) {
      toast.info("Onboarding tasks already exist for this employee");
      return;
    }
    const tasks = generateOnboardingTasks(emp);
    setGeneratedTasksMap((prev) => ({ ...prev, [empId]: tasks }));
    toast.success(`Generated ${tasks.length} onboarding tasks for ${emp.name}`);
  };

  const categories = ["HR", "IT", "Admin", "Manager", "Employee"] as const;
  const selectedEmpName = selectedTask
    ? employees.find((e) => e.id === selectedTask.employeeId)?.name
    : undefined;

  return (
    <AppLayout title="Onboarding" subtitle={`${onboardingEmployees.length} employees currently onboarding`}>
      <div className="space-y-4">
        {onboardingEmployees.map((emp) => {
          const tasks = getTasksForEmployee(emp.id);
          const isExpanded = expandedId === emp.id;
          const completedTasks = tasks.filter((t) => t.status === "completed").length;
          const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

          return (
            <div key={emp.id} className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
              <button
                onClick={() => setExpandedId(isExpanded ? null : emp.id)}
                className="w-full flex items-center gap-4 p-5 hover:bg-muted/20 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                  {emp.avatar}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-foreground">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {emp.role} · {emp.department} · Joining {emp.joiningDate}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">{completedTasks}/{tasks.length} tasks</p>
                  </div>
                  <ProgressRing progress={tasks.length > 0 ? taskProgress : emp.onboardingProgress} />
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border px-5 pb-5">
                  {/* Progress bar */}
                  {tasks.length > 0 && (
                    <div className="mt-4 mb-4 flex items-center gap-3">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</span>
                      <div className="flex-1">
                        <Progress value={taskProgress} className="h-2.5" />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{taskProgress}%</span>
                    </div>
                  )}

                  {tasks.length > 0 ? (
                    categories.map((cat) => {
                      const catTasks = tasks.filter((t) => t.category === cat);
                      if (catTasks.length === 0) return null;
                      const catCompleted = catTasks.filter((t) => t.status === "completed").length;
                      return (
                        <div key={cat} className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{cat}</p>
                            <span className="text-[10px] text-muted-foreground">{catCompleted}/{catTasks.length} done</span>
                          </div>
                          <div className="space-y-2">
                            {catTasks.map((task) => (
                              <button
                                key={task.id}
                                onClick={() => setSelectedTask(task)}
                                className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                              >
                                {task.status === "completed" ? (
                                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                                ) : task.status === "in-progress" ? (
                                  <Clock className="w-4 h-4 text-info shrink-0" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={cn("text-sm", task.status === "completed" ? "text-muted-foreground line-through" : "text-foreground")}>
                                    {task.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {task.assignedTo} · Due {task.deadline}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
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
                                  <StatusBadge status={task.status} />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="mt-4 text-center py-8">
                      <Sparkles className="w-8 h-8 text-primary/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-3">No tasks assigned yet</p>
                      <button
                        onClick={() => handleGenerateTasks(emp.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Generate Onboarding Tasks
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
        employeeName={selectedEmpName}
      />
    </AppLayout>
  );
};

export default Onboarding;
