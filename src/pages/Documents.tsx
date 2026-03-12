import { AppLayout } from "@/components/layout/AppLayout";
import { employees } from "@/data/mockData";
import { FileText, CheckCircle2, XCircle, Download } from "lucide-react";

const Documents = () => {
  const employeesWithDocs = employees.filter((e) => e.documents.length > 0);

  return (
    <AppLayout title="Document Management" subtitle="Employee documents and verification">
      <div className="space-y-4">
        {employeesWithDocs.map((emp) => (
          <div key={emp.id} className="bg-card rounded-xl border border-border p-5 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                {emp.avatar}
              </div>
              <div>
                <p className="font-medium text-foreground">{emp.name}</p>
                <p className="text-xs text-muted-foreground">{emp.employeeId} · {emp.department}</p>
              </div>
            </div>
            <div className="space-y-2">
              {emp.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.type} · Uploaded {doc.uploadedAt}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {doc.verified ? (
                      <span className="flex items-center gap-1 text-xs text-success font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-warning font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                    <button className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {employeesWithDocs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No documents uploaded yet.</div>
        )}
      </div>
    </AppLayout>
  );
};

export default Documents;
