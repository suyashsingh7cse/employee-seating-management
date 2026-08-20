import { X } from "lucide-react";

export default function Modal({ title, onClose, children, width = "max-w-md" }) {
  return (
    <div
      className="fixed inset-0 z-40 bg-ink/40 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className={`w-full ${width} bg-surface rounded-xl shadow-xl border border-line`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-semibold text-sm">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-ink-faint hover:text-ink">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
