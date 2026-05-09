import { motion, AnimatePresence } from "framer-motion";
import { FileText, FileCode, Archive, Copy, X } from "lucide-react";
import { toast } from "sonner";

export function ExportModal({ open, onClose, title }: { open: boolean; onClose: () => void; title: string }) {
  const opts = [
    { label: "PDF Report", icon: FileText },
    { label: "Markdown", icon: FileCode },
    { label: "ZIP Project Structure", icon: Archive },
    { label: "Copy All", icon: Copy },
  ];
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border p-6"
            style={{ background: "#111111", borderColor: "#2A2A2A", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold">Export Launch Package</h3>
                <p className="mt-1 text-xs text-muted-foreground">Choose a format for {title}.</p>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {opts.map((o) => {
                const Icon = o.icon;
                return (
                  <button
                    key={o.label}
                    onClick={() => {
                      toast.success("Export simulated in frontend demo.");
                      onClose();
                    }}
                    className="flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors hover:border-[rgba(255,45,45,0.5)]"
                    style={{ background: "#181818", borderColor: "#2A2A2A" }}
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{o.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
