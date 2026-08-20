import { useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "./Modal";

export default function ConfirmDialog({ title, message, confirmLabel = "Confirm", onConfirm, onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setSubmitting(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-ink-soft mb-4">{message}</p>
      {error && <p className="text-sm text-seat-error bg-seat-error-soft rounded-lg px-3 py-2 mb-4">{error}</p>}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onClose}
          className="border border-line text-sm font-medium py-2.5 rounded-lg hover:bg-canvas transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className="flex items-center justify-center gap-2 bg-seat-error text-white text-sm font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
