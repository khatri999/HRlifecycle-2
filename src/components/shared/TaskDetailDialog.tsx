import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MessageSquare, Paperclip, FileText, Calendar, User, Building2 } from "lucide-react";
import type { OnboardingTask, ExitTask } from "@/data/mockData";
import { cn } from "@/lib/utils";

type Task = OnboardingTask | ExitTask;

interface Props {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName?: string;
}

export function TaskDetailDialog({ task, open, onOpenChange, employeeName }: Props) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{task.title}</span>
            <StatusBadge status={task.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <p className="text-sm text-muted-foreground">{task.description}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-3.5 h-3.5" />
              <span>Assigned to: <span className="text-foreground font-medium">{task.assignedTo}</span></span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-3.5 h-3.5" />
              <span>Dept: <span className="text-foreground font-medium">{task.assignedDepartment}</span></span>
            </div>
            {"deadline" in task && task.deadline && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>Due: <span className="text-foreground font-medium">{task.deadline}</span></span>
              </div>
            )}
            {employeeName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-3.5 h-3.5" />
                <span>For: <span className="text-foreground font-medium">{employeeName}</span></span>
              </div>
            )}
          </div>

          {/* Comments */}
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-3.5 h-3.5" /> Comments ({task.comments.length})
            </h4>
            {task.comments.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No comments yet</p>
            ) : (
              <div className="space-y-2">
                {task.comments.map((c) => (
                  <div key={c.id} className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{c.author}</span>
                      <span className="text-[10px] text-muted-foreground">{c.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
              <Paperclip className="w-3.5 h-3.5" /> Attachments ({task.attachments.length})
            </h4>
            {task.attachments.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No attachments</p>
            ) : (
              <div className="space-y-1.5">
                {task.attachments.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border border-border/50">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{a.name}</p>
                      <p className="text-[10px] text-muted-foreground">{a.size} · {a.uploadedBy} · {a.uploadedAt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
