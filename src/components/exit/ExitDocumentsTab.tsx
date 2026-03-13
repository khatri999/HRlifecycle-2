import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Download, Upload, Mail, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Employee } from "@/data/mockData";

type DocStatus = "draft" | "pending_approval" | "approved" | "signed";

type GeneratedDoc = {
  id: string;
  document_type: string;
  rendered_html: string;
  status: DocStatus;
  created_at: string;
  approved_by?: string | null;
};

type Upload = {
  id: string;
  document_id: string;
  file_name: string;
  file_url: string;
  uploaded_by?: string | null;
  email_sent: boolean;
  uploaded_at: string;
};

interface Props {
  employee: Employee;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  offer_letter: "Offer Letter",
  joining_letter: "Joining Letter",
  experience_letter: "Experience Letter",
};

const STATUS_COLORS: Record<DocStatus, string> = {
  draft: "text-muted-foreground bg-muted",
  pending_approval: "text-warning bg-warning/10",
  approved: "text-info bg-info/10",
  signed: "text-success bg-success/10",
};

export function ExitDocumentsTab({ employee }: Props) {
  const [docs, setDocs] = useState<GeneratedDoc[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingUploadDocId, setPendingUploadDocId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [employee.id]);

  const fetchData = async () => {
    setLoading(true);
    const [dRes, uRes] = await Promise.all([
      supabase.from("generated_documents").select("*").eq("employee_id", employee.id).order("created_at", { ascending: false }),
      supabase.from("exit_document_uploads").select("*").eq("employee_id", employee.id),
    ]);
    if (dRes.data) setDocs(dRes.data as GeneratedDoc[]);
    if (uRes.data) setUploads(uRes.data as Upload[]);
    setLoading(false);
  };

  const printDocument = (doc: GeneratedDoc) => {
    const win = window.open("", "_blank");
    if (!win) return;
    const name = DOC_TYPE_LABELS[doc.document_type] || "Document";

    // Build combined HTML with signature/stamp if available
    win.document.write(`<!DOCTYPE html><html><head><title>${name} - ${employee.name}</title>
      <style>body{margin:0;font-family:Georgia,serif;} @media print{.no-print{display:none;}}</style>
    </head><body>
      ${doc.rendered_html}
    </body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 300);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingUploadDocId) return;

    if (file.size > 10 * 1024 * 1024) { toast.error("File must be under 10MB"); return; }

    setUploading(pendingUploadDocId);
    try {
      const path = `${employee.id}/${pendingUploadDocId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("exit-documents")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("exit-documents").getPublicUrl(path);

      const { data, error: dbError } = await supabase
        .from("exit_document_uploads")
        .insert({
          employee_id: employee.id,
          document_id: pendingUploadDocId,
          file_name: file.name,
          file_url: urlData.publicUrl,
          uploaded_by: "HR",
        })
        .select()
        .single();
      if (dbError) throw dbError;

      setUploads((prev) => [...prev, data as Upload]);
      toast.success("Signed document uploaded successfully!");
    } catch (err: unknown) {
      toast.error("Upload failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setUploading(null);
      setPendingUploadDocId(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerUpload = (docId: string) => {
    setPendingUploadDocId(docId);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const markEmailSent = async (upload: Upload) => {
    setSendingEmail(upload.id);
    try {
      const { error } = await supabase
        .from("exit_document_uploads")
        .update({ email_sent: true, email_sent_at: new Date().toISOString() })
        .eq("id", upload.id);
      if (error) throw error;
      setUploads((prev) => prev.map((u) => u.id === upload.id ? { ...u, email_sent: true } : u));
      toast.success(`Document delivery recorded for ${employee.name}`);
    } catch {
      toast.error("Failed to mark email as sent");
    } finally {
      setSendingEmail(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No documents generated yet.</p>
        <p className="text-xs mt-1">Generate documents from the Documents tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={handleFileSelect} />

      {docs.map((doc) => {
        const docUploads = uploads.filter((u) => u.document_id === doc.id);
        const label = DOC_TYPE_LABELS[doc.document_type] || doc.document_type;

        return (
          <div key={doc.id} className="rounded-xl border border-border overflow-hidden">
            {/* Doc header */}
            <div className="flex items-center gap-3 p-4 bg-card">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize", STATUS_COLORS[doc.status])}>
                    {doc.status.replace("_", " ")}
                  </span>
                  {doc.approved_by && (
                    <span className="text-[10px] text-muted-foreground">Signed by {doc.approved_by}</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Generated {new Date(doc.created_at).toLocaleDateString("en-IN")}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => printDocument(doc)}>
                  <Download className="w-3 h-3" /> Print/PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={uploading === doc.id}
                  onClick={() => triggerUpload(doc.id)}
                >
                  {uploading === doc.id
                    ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</>
                    : <><Upload className="w-3 h-3" /> Upload Signed</>}
                </Button>
              </div>
            </div>

            {/* Uploaded files */}
            {docUploads.length > 0 && (
              <div className="border-t border-border divide-y divide-border/50">
                {docUploads.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3 bg-muted/10">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{u.file_name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Uploaded by {u.uploaded_by} · {new Date(u.uploaded_at).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={u.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      {u.email_sent ? (
                        <span className="flex items-center gap-1 text-[10px] text-success font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Delivered
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          disabled={sendingEmail === u.id}
                          onClick={() => markEmailSent(u)}
                          className="text-xs"
                        >
                          {sendingEmail === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                          Send to Employee
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
