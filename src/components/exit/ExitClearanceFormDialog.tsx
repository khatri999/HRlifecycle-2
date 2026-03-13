import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClipboardList } from "lucide-react";
import type { Employee } from "@/data/mockData";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
  onSubmitted: (formId: string) => void;
}

const EXIT_TASK_TEMPLATES = [
  { title: "Confirm knowledge transfer completed", description: "Ensure all KT sessions are done", department: "Manager", assigned_to: "" },
  { title: "Confirm project handover", description: "Hand over all ongoing projects with documentation", department: "Manager", assigned_to: "" },
  { title: "Review exit clearance", description: "Overall review of clearance status", department: "Manager", assigned_to: "" },
  { title: "Coordinate handover documentation", description: "Coordinate with team on documentation handover", department: "ProjectCoordinator", assigned_to: "" },
  { title: "Update project status tracker", description: "Ensure all project statuses are up to date", department: "ProjectCoordinator", assigned_to: "" },
  { title: "Disable system access", description: "Revoke all system access on LWD", department: "IT", assigned_to: "Amit Deshmukh" },
  { title: "Recover laptop and IT assets", description: "Collect work laptop, peripherals, and IT equipment", department: "IT", assigned_to: "Amit Deshmukh" },
  { title: "Deactivate official accounts", description: "Deactivate email and all official accounts", department: "IT", assigned_to: "Amit Deshmukh" },
  { title: "Collect employee ID card", description: "Collect employee ID and access cards", department: "Admin", assigned_to: "Admin Team" },
  { title: "Recover office assets", description: "Collect furniture or equipment issued to employee", department: "Admin", assigned_to: "Admin Team" },
  { title: "Collect SIM card if issued", description: "Recover company SIM card if applicable", department: "Admin", assigned_to: "Admin Team" },
  { title: "Confirm expense submissions", description: "Ensure all expense claims are submitted", department: "Finance", assigned_to: "Finance Team" },
  { title: "Clear loans or advances", description: "Verify and settle any pending loans or advances", department: "Finance", assigned_to: "Finance Team" },
  { title: "Process Full & Final settlement", description: "Calculate and process final settlement amount", department: "Finance", assigned_to: "Finance Team" },
  { title: "Conduct exit interview", description: "Schedule and conduct exit interview", department: "HR", assigned_to: "Meera Joshi" },
  { title: "Verify employee documentation", description: "Review and verify all employee documents", department: "HR", assigned_to: "Meera Joshi" },
  { title: "Review departmental clearance", description: "Final HR review of all departmental clearances", department: "HR", assigned_to: "Meera Joshi" },
];

export function ExitClearanceFormDialog({ open, onOpenChange, employee, onSubmitted }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    contact_number: "",
    personal_email: "",
    forwarding_address: "",
    handover_declaration: false,
  });

  const lwd = employee.lastWorkingDay || "";

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.handover_declaration) {
      toast.error("Please confirm the handover declaration before submitting");
      return;
    }
    setLoading(true);
    try {
      // Insert clearance form
      const { data: formData, error: formError } = await supabase
        .from("exit_clearance_forms")
        .insert({
          employee_id: employee.id,
          employee_name: employee.name,
          employee_code: employee.employeeId,
          department: employee.department,
          designation: employee.role,
          manager: employee.manager,
          last_working_day: lwd || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          contact_number: form.contact_number,
          personal_email: form.personal_email,
          forwarding_address: form.forwarding_address,
          handover_declaration: form.handover_declaration,
        })
        .select()
        .single();

      if (formError) throw formError;

      // Auto-generate departmental tasks
      const tasks = EXIT_TASK_TEMPLATES.map((t) => ({
        ...t,
        employee_id: employee.id,
        clearance_form_id: formData.id,
        assigned_to: t.department === "Manager" ? employee.manager : t.assigned_to,
        deadline: lwd || null,
      }));

      const { error: taskError } = await supabase.from("exit_dept_tasks").insert(tasks);
      if (taskError) throw taskError;

      toast.success(`Clearance form submitted! ${tasks.length} departmental tasks generated.`);
      onSubmitted(formData.id);
      onOpenChange(false);
    } catch (err: unknown) {
      toast.error("Failed to submit form: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            Exit Clearance Form — {employee.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Pre-filled fields (read-only) */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border">
            <div>
              <Label className="text-xs text-muted-foreground">Employee Name</Label>
              <p className="text-sm font-medium text-foreground mt-0.5">{employee.name}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Employee ID</Label>
              <p className="text-sm font-medium text-foreground mt-0.5">{employee.employeeId}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Department</Label>
              <p className="text-sm font-medium text-foreground mt-0.5">{employee.department}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Designation</Label>
              <p className="text-sm font-medium text-foreground mt-0.5">{employee.role}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Reporting Manager</Label>
              <p className="text-sm font-medium text-foreground mt-0.5">{employee.manager}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Last Working Day</Label>
              <p className="text-sm font-medium text-foreground mt-0.5">{lwd || "To be confirmed"}</p>
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="contact_number">Contact Number <span className="text-destructive">*</span></Label>
              <Input
                id="contact_number"
                placeholder="+91 98765 43210"
                value={form.contact_number}
                onChange={(e) => set("contact_number", e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="personal_email">Personal Email Address <span className="text-destructive">*</span></Label>
              <Input
                id="personal_email"
                type="email"
                placeholder="personal@gmail.com"
                value={form.personal_email}
                onChange={(e) => set("personal_email", e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="forwarding_address">Forwarding Address <span className="text-destructive">*</span></Label>
              <Textarea
                id="forwarding_address"
                placeholder="Full mailing address for courier delivery"
                value={form.forwarding_address}
                onChange={(e) => set("forwarding_address", e.target.value)}
                required
                className="mt-1 min-h-[80px]"
              />
            </div>
          </div>

          {/* Declaration */}
          <div className="p-4 rounded-lg border border-warning/30 bg-warning/5">
            <div className="flex items-start gap-3">
              <Checkbox
                id="declaration"
                checked={form.handover_declaration}
                onCheckedChange={(v) => set("handover_declaration", !!v)}
                className="mt-0.5"
              />
              <Label htmlFor="declaration" className="text-sm text-foreground cursor-pointer leading-relaxed">
                I hereby declare that I have completed all work handovers, knowledge transfers, and project documentation as required. I confirm that all company assets in my possession will be returned on or before my last working day.
              </Label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Submitting..." : "Submit & Start Clearance Process"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
