import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { employees, type Employee } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  ChevronDown, ChevronRight, ClipboardList, FileText,
  CheckCircle2, Clock, Sparkles, Plus,
} from "lucide-react";
import { toast } from "sonner";
import { ExitClearanceFormDialog } from "@/components/exit/ExitClearanceFormDialog";
import { DeptClearanceBoard, type DeptTask } from "@/components/exit/DeptClearanceBoard";
import { DocumentGenerationPanel } from "@/components/exit/DocumentGenerationPanel";
import { ExitDocumentsTab } from "@/components/exit/ExitDocumentsTab";

// --- Types ---
type ClearanceForm = {
  id: string;
  employee_id: string;
  employee_name: string;
  contact_number: string;
  personal_email: string;
  forwarding_address: string;
  handover_declaration: boolean;
  last_working_day: string;
  status: string;
};

// --- Exit workflow steps ---
const EXIT_STEPS = [
  "Resignation Submitted",
  "Manager Approval",
  "HR Acknowledgement",
  "Exit Checklist",
  "Dept Clearance",
  "Exit Interview",
  "Final Settlement",
  "Relieving Letter",
];

const getStepProgress = (emp: Employee) => {
  if (emp.exitStatus === "resignation-submitted") return 1;
  if (emp.exitStatus === "notice-period") return 3;
  if (emp.exitStatus === "clearance") return 5;
  if (emp.exitStatus === "completed") return 8;
  return 0;
};

// --- Timeline step component ---
function ExitTimeline({ emp }: { emp: Employee }) {
  const stepProgress = getStepProgress(emp);
  return (
    <div className="space-y-3 py-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Exit Workflow Progress</p>
      <div className="relative pl-6">
        {EXIT_STEPS.map((step, i) => {
          const done = i < stepProgress;
          const active = i === stepProgress;
          return (
            <div key={step} className="relative flex items-start gap-3 pb-5 last:pb-0">
              {/* Connector line */}
              {i < EXIT_STEPS.length - 1 && (
                <div className={cn("absolute left-3 top-5 w-px h-full -translate-x-1/2", done ? "bg-success" : "bg-border")} />
              )}
              {/* Dot */}
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10",
                done ? "bg-success text-success-foreground" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <div className="pt-0.5">
                <p className={cn("text-sm font-medium", done ? "text-success" : active ? "text-primary" : "text-muted-foreground")}>
                  {step}
                </p>
                {active && <p className="text-xs text-muted-foreground mt-0.5">In progress</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Main component ---
const ExitManagement = () => {
  const exitEmployees = employees.filter(
    (e) => e.status === "notice-period" || e.exitStatus !== "none"
  );

  const [expandedId, setExpandedId] = useState<string | null>(exitEmployees[0]?.id || null);
  const [clearanceForms, setClearanceForms] = useState<Record<string, ClearanceForm>>({});
  const [deptTasks, setDeptTasks] = useState<Record<string, DeptTask[]>>({});
  const [showFormDialog, setShowFormDialog] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchAllData();
  }, [refreshKey]);

  const fetchAllData = async () => {
    setLoading(true);
    const empIds = exitEmployees.map((e) => e.id);
    const [formsRes, tasksRes] = await Promise.all([
      supabase.from("exit_clearance_forms").select("*").in("employee_id", empIds),
      supabase.from("exit_dept_tasks").select("*").in("employee_id", empIds),
    ]);

    if (formsRes.data) {
      const map: Record<string, ClearanceForm> = {};
      formsRes.data.forEach((f) => { map[f.employee_id] = f as ClearanceForm; });
      setClearanceForms(map);
    }
    if (tasksRes.data) {
      const map: Record<string, DeptTask[]> = {};
      tasksRes.data.forEach((t) => {
        if (!map[t.employee_id]) map[t.employee_id] = [];
        map[t.employee_id].push(t as DeptTask);
      });
      setDeptTasks(map);
    }
    setLoading(false);
  };

  const handleTaskUpdated = (empId: string, taskId: string, newStatus: "pending" | "completed" | "issue") => {
    setDeptTasks((prev) => ({
      ...prev,
      [empId]: (prev[empId] || []).map((t) => t.id === taskId ? { ...t, status: newStatus } : t),
    }));
  };

  const isFinanceCleared = (empId: string) => {
    const tasks = deptTasks[empId] || [];
    const financeTasks = tasks.filter((t) => t.department === "Finance");
    return financeTasks.length > 0 && financeTasks.every((t) => t.status === "completed");
  };

  const getOverallProgress = (empId: string) => {
    const tasks = deptTasks[empId] || [];
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.status === "completed").length;
    return Math.round((completed / tasks.length) * 100);
  };

  return (
    <AppLayout
      title="Exit Management"
      subtitle={`${exitEmployees.length} employees in exit process`}
    >
      <div className="space-y-4">
        {exitEmployees.map((emp) => {
          const isExpanded = expandedId === emp.id;
          const hasForm = !!clearanceForms[emp.id];
          const tasks = deptTasks[emp.id] || [];
          const financeCleared = isFinanceCleared(emp.id);
          const progress = getOverallProgress(emp.id);
          const hasIssues = tasks.some((t) => t.status === "issue");

          return (
            <div key={emp.id} className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
              {/* Accordion header */}
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
                  {hasForm && tasks.length > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="h-1 flex-1 max-w-[120px] rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", hasIssues ? "bg-destructive" : progress === 100 ? "bg-success" : "bg-primary")}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{progress}% cleared</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {!hasForm && (
                    <span className="text-[10px] font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">Form Pending</span>
                  )}
                  {hasIssues && (
                    <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                      Issues
                    </span>
                  )}
                  <StatusBadge status={emp.exitStatus} />
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>

              {/* Expanded panel */}
              {isExpanded && (
                <div className="border-t border-border">
                  {/* Step 1: No clearance form → prompt */}
                  {!hasForm ? (
                    <div className="px-5 py-8 text-center">
                      <ClipboardList className="w-10 h-10 text-warning/40 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-foreground mb-1">Clearance Form Not Submitted</p>
                      <p className="text-xs text-muted-foreground mb-4">
                        The employee must complete the exit clearance form to start the departmental clearance process.
                      </p>
                      <button
                        onClick={() => setShowFormDialog(emp.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Start Exit Clearance Form
                      </button>
                    </div>
                  ) : (
                    /* Tabbed interface */
                    <Tabs defaultValue="clearance" className="w-full">
                      <div className="px-5 pt-4">
                        <TabsList className="w-full sm:w-auto">
                          <TabsTrigger value="clearance" className="flex items-center gap-1.5">
                            <ClipboardList className="w-3.5 h-3.5" />
                            Clearance
                          </TabsTrigger>
                          <TabsTrigger value="documents" className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            Documents
                          </TabsTrigger>
                          <TabsTrigger value="uploads" className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            Exit Files
                          </TabsTrigger>
                          <TabsTrigger value="timeline" className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Timeline
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      {/* CLEARANCE TAB */}
                      <TabsContent value="clearance" className="px-5 pb-5 mt-4">
                        {/* Employee form summary */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5 p-3 rounded-lg bg-muted/30 border border-border text-xs">
                          <div>
                            <p className="text-muted-foreground">Contact</p>
                            <p className="font-medium text-foreground">{clearanceForms[emp.id].contact_number}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Personal Email</p>
                            <p className="font-medium text-foreground truncate">{clearanceForms[emp.id].personal_email}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Handover Declaration</p>
                            <p className={cn("font-medium", clearanceForms[emp.id].handover_declaration ? "text-success" : "text-destructive")}>
                              {clearanceForms[emp.id].handover_declaration ? "✓ Confirmed" : "Not confirmed"}
                            </p>
                          </div>
                        </div>

                        {tasks.length > 0 ? (
                          <DeptClearanceBoard
                            tasks={tasks}
                            onTaskUpdated={(taskId, status) => handleTaskUpdated(emp.id, taskId, status)}
                            isFinanceCleared={financeCleared}
                          />
                        ) : (
                          <div className="text-center py-8">
                            <Sparkles className="w-8 h-8 text-warning/40 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">Loading departmental tasks...</p>
                          </div>
                        )}
                      </TabsContent>

                      {/* DOCUMENTS TAB */}
                      <TabsContent value="documents" className="px-5 pb-5 mt-4">
                        <DocumentGenerationPanel
                          employee={emp}
                          isFinanceCleared={financeCleared}
                          onDocGenerated={() => setRefreshKey((k) => k + 1)}
                        />
                      </TabsContent>

                      {/* EXIT FILES TAB */}
                      <TabsContent value="uploads" className="px-5 pb-5 mt-4">
                        <ExitDocumentsTab employee={emp} />
                      </TabsContent>

                      {/* TIMELINE TAB */}
                      <TabsContent value="timeline" className="px-5 pb-5 mt-4">
                        <ExitTimeline emp={emp} />
                      </TabsContent>
                    </Tabs>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Clearance form dialog */}
      {showFormDialog && (() => {
        const emp = employees.find((e) => e.id === showFormDialog);
        if (!emp) return null;
        return (
          <ExitClearanceFormDialog
            open={!!showFormDialog}
            onOpenChange={(o) => !o && setShowFormDialog(null)}
            employee={emp}
            onSubmitted={() => {
              setShowFormDialog(null);
              setRefreshKey((k) => k + 1);
              toast.success("Clearance process started!");
            }}
          />
        );
      })()}
    </AppLayout>
  );
};

export default ExitManagement;
