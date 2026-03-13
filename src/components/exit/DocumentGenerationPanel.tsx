import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Lock, Unlock, Eye, Send, CheckCircle2, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Employee } from "@/data/mockData";
import { DocumentApprovalDialog } from "./DocumentApprovalDialog";

type DocType = "offer_letter" | "joining_letter" | "experience_letter";
type DocStatus = "draft" | "pending_approval" | "approved" | "signed";

type GeneratedDoc = {
  id: string;
  document_type: DocType;
  rendered_html: string;
  status: DocStatus;
  signature_data?: string | null;
  stamp_data?: string | null;
  created_at: string;
};

type Template = {
  id: string;
  document_type: DocType;
  template_html: string;
};

interface Props {
  employee: Employee;
  isFinanceCleared: boolean;
  onDocGenerated?: () => void;
}

const DOC_CONFIG: Record<DocType, { label: string; description: string; requiresFinance: boolean }> = {
  offer_letter: { label: "Offer Letter", description: "Employment offer confirmation", requiresFinance: false },
  joining_letter: { label: "Joining Letter", description: "Joining confirmation letter", requiresFinance: false },
  experience_letter: { label: "Experience Letter", description: "Work experience certificate — requires Finance clearance", requiresFinance: true },
};

function fillTemplate(html: string, employee: Employee): string {
  const today = new Date();
  const vars: Record<string, string> = {
    employee_name: employee.name,
    employee_id: employee.employeeId,
    designation: employee.role,
    department: employee.department,
    joining_date: employee.joiningDate,
    last_working_day: employee.lastWorkingDay || "TBD",
    manager_name: employee.manager,
    date: today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    year: today.getFullYear().toString(),
  };
  return Object.entries(vars).reduce(
    (html, [key, val]) => html.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val),
    html
  );
}

const STATUS_COLORS: Record<DocStatus, string> = {
  draft: "text-muted-foreground bg-muted",
  pending_approval: "text-warning bg-warning/10",
  approved: "text-info bg-info/10",
  signed: "text-success bg-success/10",
};

export function DocumentGenerationPanel({ employee, isFinanceCleared, onDocGenerated }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([]);
  const [generating, setGenerating] = useState<DocType | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [approvalDoc, setApprovalDoc] = useState<GeneratedDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [employee.id]);

  const fetchData = async () => {
    setLoading(true);
    const [tRes, dRes] = await Promise.all([
      supabase.from("document_templates").select("id, document_type, template_html"),
      supabase.from("generated_documents").select("*").eq("employee_id", employee.id),
    ]);
    if (tRes.data) setTemplates(tRes.data as Template[]);
    if (dRes.data) setGeneratedDocs(dRes.data as GeneratedDoc[]);
    setLoading(false);
  };

  const generateDocument = async (docType: DocType) => {
    const template = templates.find((t) => t.document_type === docType);
    if (!template) { toast.error("Template not found"); return; }

    setGenerating(docType);
    try {
      const rendered = fillTemplate(template.template_html, employee);
      const { data, error } = await supabase
        .from("generated_documents")
        .insert({
          employee_id: employee.id,
          template_id: template.id,
          document_type: docType,
          rendered_html: rendered,
          status: "draft",
          created_by: "HR",
        })
        .select()
        .single();
      if (error) throw error;
      setGeneratedDocs((prev) => [...prev.filter((d) => d.document_type !== docType), data as GeneratedDoc]);
      toast.success(`${DOC_CONFIG[docType].label} generated successfully!`);
      onDocGenerated?.();
    } catch (err: unknown) {
      toast.error("Failed to generate document: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setGenerating(null);
    }
  };

  const sendForApproval = async (doc: GeneratedDoc) => {
    const { error } = await supabase
      .from("generated_documents")
      .update({ status: "pending_approval" })
      .eq("id", doc.id);
    if (error) { toast.error("Failed to send for approval"); return; }
    setGeneratedDocs((prev) => prev.map((d) => d.id === doc.id ? { ...d, status: "pending_approval" } : d));
    toast.success("Sent to Nishith Shah for approval");
  };

  const printDocument = (html: string, name: string) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${name}</title><style>body{margin:0;font-family:Georgia,serif;}</style></head><body>${html}</body></html>`);
    win.document.close();
    win.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isFinanceCleared && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20 text-sm">
          <Lock className="w-4 h-4 text-warning shrink-0" />
          <span className="text-muted-foreground">
            <span className="font-semibold text-warning">Experience Letter locked</span> — Finance must complete Full &amp; Final Settlement first.
            Offer &amp; Joining letters are available now.
          </span>
        </div>
      )}
      {isFinanceCleared && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20 text-sm">
          <Unlock className="w-4 h-4 text-success shrink-0" />
          <span className="text-muted-foreground"><span className="font-semibold text-success">All documents unlocked</span> — Finance clearance complete.</span>
        </div>
      )}

      {(["offer_letter", "joining_letter", "experience_letter"] as DocType[]).map((docType) => {
        const cfg = DOC_CONFIG[docType];
        const existing = generatedDocs.find((d) => d.document_type === docType);
        const isLocked = cfg.requiresFinance && !isFinanceCleared;
        const isPreviewOpen = previewing === docType;

        return (
          <div key={docType} className={cn("rounded-xl border overflow-hidden", isLocked ? "border-border/50 opacity-60" : "border-border")}>
            <div className="flex items-center gap-3 p-4 bg-card">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", isLocked ? "bg-muted" : "bg-primary/10")}>
                {isLocked ? <Lock className="w-4 h-4 text-muted-foreground" /> : <FileText className="w-4 h-4 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{cfg.label}</p>
                  {existing && (
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", STATUS_COLORS[existing.status])}>
                      {existing.status.replace("_", " ")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{cfg.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!existing && !isLocked && (
                  <Button
                    size="sm"
                    disabled={generating === docType}
                    onClick={() => generateDocument(docType)}
                  >
                    {generating === docType ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</> : "Generate"}
                  </Button>
                )}
                {existing && (
                  <>
                    <button
                      onClick={() => setPreviewing(isPreviewOpen ? null : docType)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {isPreviewOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                    {existing.status === "draft" && (
                      <Button size="sm" variant="outline" onClick={() => sendForApproval(existing)}>
                        <Send className="w-3 h-3" /> Send for Approval
                      </Button>
                    )}
                    {existing.status === "pending_approval" && docType === "experience_letter" && (
                      <Button size="sm" onClick={() => setApprovalDoc(existing)}>
                        <CheckCircle2 className="w-3 h-3" /> Approve &amp; Sign
                      </Button>
                    )}
                    {(existing.status === "approved" || existing.status === "signed") && (
                      <Button size="sm" variant="outline" onClick={() => printDocument(existing.rendered_html, cfg.label)}>
                        Print / PDF
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Preview panel */}
            {isPreviewOpen && existing && (
              <div className="border-t border-border p-4 bg-muted/20">
                <div
                  className="bg-white rounded-lg border border-border shadow-sm overflow-auto max-h-[480px] text-foreground"
                  style={{ minHeight: 200 }}
                  dangerouslySetInnerHTML={{ __html: existing.rendered_html }}
                />
                {(existing.signature_data || existing.stamp_data) && (
                  <div className="flex items-center gap-4 mt-3">
                    {existing.signature_data && (
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1">Signature</p>
                        <img src={existing.signature_data} alt="Signature" className="h-10 rounded border border-border bg-white" />
                      </div>
                    )}
                    {existing.stamp_data && (
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-1">Stamp</p>
                        <img src={existing.stamp_data} alt="Stamp" className="h-10 rounded border border-border bg-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Approval dialog */}
      {approvalDoc && (
        <DocumentApprovalDialog
          open={!!approvalDoc}
          onOpenChange={(o) => !o && setApprovalDoc(null)}
          document={approvalDoc}
          onApproved={(updatedDoc) => {
            setGeneratedDocs((prev) => prev.map((d) => d.id === updatedDoc.id ? updatedDoc as GeneratedDoc : d));
            setApprovalDoc(null);
          }}
        />
      )}
    </div>
  );
}
