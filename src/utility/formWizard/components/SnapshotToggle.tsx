// /components/SnapshotToggle.tsx
import React, { useEffect, useState } from "react";
import { History, X } from "lucide-react";
import { SnapshotSidebar } from "./SnapshotSidebar";

interface SnapshotToggleProps {
  processId: string;
  position?: "left" | "right";
  className?: string;
  sidebarWidthPx?: number;
}

export const SnapshotToggle: React.FC<SnapshotToggleProps> = ({
  processId,
  position = "right",
  className = "",
  sidebarWidthPx = 380,
}) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-5 ${position === "right" ? "right-5" : "left-5"} z-40 inline-flex items-center gap-2 rounded-full shadow-lg border bg-white px-4 py-2 hover:bg-zinc-50 ${className}`}
        title="Zapisane wersje (snapshots)"
      >
        <History className="w-4 h-4" />
        <span className="text-sm">Wersje</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            className={`fixed top-0 ${position === "right" ? "right-0" : "left-0"} h-full bg-white z-50 border-l shadow-xl`}
            style={{ width: sidebarWidthPx, maxWidth: "100%" }}
          >
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md hover:bg-zinc-100"
                aria-label="Zamknij panel snapshotów"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SnapshotSidebar
              processId={processId}
              onClose={() => setOpen(false)}
              className="pt-10"
            />
          </div>
        </>
      )}
    </>
  );
};
