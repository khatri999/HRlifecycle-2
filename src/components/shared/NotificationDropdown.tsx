import { useState } from "react";
import { Bell, CheckCircle2, AlertTriangle, UserPlus, PlayCircle } from "lucide-react";
import { notifications as initialNotifications, type Notification } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const iconMap: Record<Notification["type"], typeof Bell> = {
  "task-assigned": UserPlus,
  "task-completed": CheckCircle2,
  "deadline-reminder": AlertTriangle,
  "workflow-started": PlayCircle,
};

const iconColorMap: Record<Notification["type"], string> = {
  "task-assigned": "text-info",
  "task-completed": "text-success",
  "deadline-reminder": "text-warning",
  "workflow-started": "text-primary",
};

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(initialNotifications);
  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => setItems(items.map((n) => ({ ...n, read: true })));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-semibold">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-display font-semibold text-sm text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-6">No notifications</p>
              ) : (
                items.map((n) => {
                  const Icon = iconMap[n.type];
                  return (
                    <Link
                      key={n.id}
                      to={n.link || "#"}
                      onClick={() => {
                        setItems(items.map((i) => i.id === n.id ? { ...i, read: true } : i));
                        setOpen(false);
                      }}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50",
                        !n.read && "bg-primary/5"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", iconColorMap[n.type])} />
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs font-medium", !n.read ? "text-foreground" : "text-muted-foreground")}>
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">{n.timestamp}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />}
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
