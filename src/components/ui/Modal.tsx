import type { PropsWithChildren, ReactNode } from "react";
import Button from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
}: PropsWithChildren<ModalProps>) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#1e1e1e] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.7)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#e1e1e1]">{title}</h3>
          <Button
            variant="ghost"
            onClick={onClose}
            aria-label="Close"
            className="text-[#a0a0a0] hover:text-white hover:bg-[#121212] rounded-md p-1 transition"
          >
            ✕
          </Button>
        </div>
        <div className="text-[#e1e1e1]">{children}</div>
      </div>
    </div>
  );
}
