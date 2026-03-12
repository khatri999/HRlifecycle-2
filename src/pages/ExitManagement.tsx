import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TaskDetailDialog } from "@/components/shared/TaskDetailDialog";
import { DepartmentClearanceTracker } from "@/components/shared/DepartmentClearanceTracker";
import { Progress } from "@/components/ui/progress";
import { employees, exitTasks, generateExitTasks, type ExitTask } from "@/data/mockData";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronRight, MessageSquare, Paperclip, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

const exitSteps = [
  "Resignation Submitted",
  "Manager Approval",
  "HR Acknowledgement",
  "Exit Checklist",
  "Dept Clearance",
  "Exit Interview",
  "Final Settlement",
  "Relieving Letter",
];

const getStepProgress = (emp: typeof employees[0]) => {
  if (emp.exitStatus === "resignation-submitted") return 1;
  if (emp.exitStatus === "notice-period") return 3;
  if (emp.exitStatus === "clearance") return 5;
  if (emp.exitStatus === "completed") return 8;
  return 0;
};

const ExitManagement = () => {
  const exitEmployees = employees.filter(
    (e) => e.status === "notice-period" || e.exitStatus !== "none"
  );
  const [expandedId, setExpandedId] = useState<string | null>(exitEmployees[0]?.id || null);
  const [selectedTask, setSelectedTask] = useState<ExitTask | null>(null);
  const [generatedTasksMap, setGeneratedTasksMap] = useState<Record<string, ExitTask[]>>({});

  const getTasksForEmployee = (empId: string) => {
    const existing = exitTasks.filter((t) => t.employeeId === empId);
    const generated = generatedTasksMap[empId] || [];
    return [...existing, ...generated];
  };

  const handleGenerateExitTasks = (empId: string) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    const existing = exitTasks.filter((t) => t.employeeId === empId);
    if (existing.length > 0) {
      toast.info("Exit tasks already exist for this employee");
      return;
    }
    const tasks = generateExitTasks(emp);
    setGeneratedTasksMap((prev) => ({ ...prev, [empId]: tasks }));
    toast.success(`Generated ${tasks.length} exit tasks for ${emp.name}`);
  };

  const categories = ["Manager", "IT", "Admin", "Finance", "HR"] as const;
  const selectedEmpName = selectedTask
    ? employees.find((e) => e.id === selectedTask.employeeId)?.name
    : undefined;

  return (
    <AppLayout title="Exit Management" subtitle={`${exitEmployees.length} employees in exit process`}>
      <div className="space-y-4">
        {exitEmployees.map((emp) => {
          const tasks = getTasksForEmployee(emp.id);
          const isExpanded = expandedId === emp.id;
          const stepProgress = getStepProgress(emp);
          const completedTasks = tasks.filter((t) => t.status === "completed").length;
          const overallProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

          return (
            <div key={emp.id} className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
              <button
                onClick={() => setExpandedId(isExpanded ? null : emp.id)}
                className="w-full flex items-center gap-4 p-5 hover:bg-muted/20 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-warning/10 text-warning flex items-center justify-center text-sm font-semibold shrink-0">
                  {emp.avatar}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-foreground">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {emp.role} · {emp.department} · LWD: {emp.lastWorkingDay || "TBD"}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {tasks.length > 0 && (
                    <span className="text-xs text-muted-foreground hidden sm:block">{completedTasks}/{tasks.length} cleared</span>
                  )}
                  <StatusBadge status={emp.exitStatus} />
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border px-5 pb-5">
                  {/* Exit Progress Steps */}
                  <div className="mt-4 mb-6">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Exit Workflow Progress</p>
                    <div className="flex items-center gap-1 overflow-x-auto pb-2">
                      {exitSteps.map((step, i) => (
                        <div key={step} className="flex items-center shrink-0">
                          <div className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium",
                            i < stepProgress ? "bg-success/10 text-success" : i === stepProgress ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            {i < stepProgress ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-current flex items-center justify-center text-[8px]">{i + 1}</span>}
                            <span className="hidden lg:inline">{step}</span>
                          </div>
                          {i < exitSteps.length - 1 && <div className={cn("w-4 h-px mx-0.5", i < stepProgress ? "bg-success" : "bg-border")} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clearance Tracker */}
                  {tasks.length > 0 ? (
                    <>
                      <div className="mb-6">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Department Clearance</p>
                        <DepartmentClearanceTracker tasks={tasks} />
                      </div>

                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">All Tasks</p>
                      {categories.map((cat) => {
                        const catTasks = tasks.filter((t) => t.category === cat);
                        if (catTasks.length === 0) return null;
                        return (
                          <div key={cat} className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1.5">{cat}</p>
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
                                    <p className="text-xs text-muted-foreground">{task.assignedTo}{task.deadline ? ` · Due ${task.deadline}` : ""}</p>
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
                      })}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Sparkles className="w-8 h-8 text-warning/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-3">No exit tasks generated yet</p>
                      <button
                        onClick={() => handleGenerateExitTasks(emp.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Generate Exit Tasks
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

export default ExitManagement;
