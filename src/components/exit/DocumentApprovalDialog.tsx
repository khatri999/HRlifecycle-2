import { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PenLine, RotateCcw, Stamp, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type DocStatus = "draft" | "pending_approval" | "approved" | "signed";

type ApprovalDoc = {
  id: string;
  document_type: string;
  rendered_html: string;
  status: DocStatus;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: ApprovalDoc;
  onApproved: (doc: Partial<ApprovalDoc> & { id: string }) => void;
}

// Official stamp SVG as data URL
const DEFAULT_STAMP = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'>
  <circle cx='60' cy='60' r='56' fill='none' stroke='%23c0a020' stroke-width='3'/>
  <circle cx='60' cy='60' r='50' fill='none' stroke='%23c0a020' stroke-width='1.5'/>
  <text x='60' y='52' text-anchor='middle' font-family='Georgia,serif' font-size='10' fill='%23c0a020' font-weight='bold'>REALTHINGKS</text>
  <text x='60' y='66' text-anchor='middle' font-family='Georgia,serif' font-size='7' fill='%23c0a020'>OFFICIAL SEAL</text>
  <text x='60' y='78' text-anchor='middle' font-family='Georgia,serif' font-size='7' fill='%23c0a020'>HUMAN RESOURCES</text>
</svg>`;

export function DocumentApprovalDialog({ open, onOpenChange, document, onApproved }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [useStamp, setUseStamp] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setHasSignature(false);
  }, [open]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const endDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleApprove = async () => {
    if (!hasSignature) {
      toast.error("Please add a signature before approving");
      return;
    }
    setSaving(true);
    try {
      const canvas = canvasRef.current;
      const signatureData = canvas?.toDataURL("image/png") || null;
      const stampData = useStamp ? DEFAULT_STAMP : null;

      const { data, error } = await supabase
        .from("generated_documents")
        .update({
          status: "signed",
          signature_data: signatureData,
          stamp_data: stampData,
          approved_by: "Nishith Shah",
          approved_at: new Date().toISOString(),
        })
        .eq("id", document.id)
        .select()
        .single();

      if (error) throw error;
      toast.success("Document approved and signed by Nishith Shah!");
      onApproved(data as ApprovalDoc);
    } catch (err: unknown) {
      toast.error("Failed to save approval: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Final Approval — Nishith Shah
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-2">
          {/* Document preview */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Document Preview</p>
            <div
              className="bg-white rounded-lg border border-border shadow-sm overflow-auto max-h-[400px] text-foreground text-xs"
              dangerouslySetInnerHTML={{ __html: document.rendered_html }}
            />
          </div>

          {/* Signature & stamp */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <PenLine className="w-3.5 h-3.5" /> Signature Canvas
                </p>
                <button
                  onClick={clearCanvas}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              </div>
              <div className="rounded-lg border-2 border-dashed border-border overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={150}
                  className="w-full touch-none cursor-crosshair"
                  style={{ display: "block" }}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={endDraw}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">Draw your signature above</p>
            </div>

            {/* Stamp toggle */}
            <div className={cn("flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors", useStamp ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20")} onClick={() => setUseStamp(!useStamp)}>
              <Stamp className={cn("w-5 h-5 shrink-0", useStamp ? "text-primary" : "text-muted-foreground")} />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Official Company Stamp</p>
                <p className="text-xs text-muted-foreground">Add RealThingks official seal</p>
              </div>
              {useStamp && (
                <img
                  src={DEFAULT_STAMP}
                  alt="Stamp preview"
                  className="w-10 h-10 shrink-0"
                />
              )}
            </div>

            {/* Approver info */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs font-medium text-foreground">Approver: Nishith Shah</p>
              <p className="text-xs text-muted-foreground">Director, RealThingks</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Date: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            <Button
              onClick={handleApprove}
              disabled={!hasSignature || saving}
              className="w-full"
            >
              {saving ? "Saving..." : "Approve & Sign Document"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
