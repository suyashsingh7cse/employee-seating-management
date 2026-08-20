import { useState } from "react";
import { Loader2, ArrowLeftRight, UserMinus } from "lucide-react";
import Modal from "./Modal";

export default function SeatDetailModal({ seat, employee, onStartMove, onRemove, onClose }) {
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  async function handleRemove() {
    setRemoving(true);
    setError("");
    try {
      await onRemove();
      onClose();
    } catch (err) {
      setError(err.message || "Could not remove this assignment.");
      setRemoving(false);
    }
  }

  return (
    <Modal title={`Seat ${seat.seat_number}`} onClose={onClose}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-brand-soft text-brand-dark flex items-center justify-center text-sm font-semibold">
          {employee.name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div>
          <p className="text-sm font-medium">{employee.name}</p>
          <p className="text-xs text-ink-soft">
            {employee.department} · {employee.email}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-seat-error bg-seat-error-soft rounded-lg px-3 py-2 mb-4">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            onStartMove();
            onClose();
          }}
          className="flex items-center justify-center gap-2 border border-line text-sm font-medium py-2.5 rounded-lg hover:bg-canvas transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Move
        </button>
        <button
          onClick={handleRemove}
          disabled={removing}
          className="flex items-center justify-center gap-2 border border-seat-error text-seat-error text-sm font-medium py-2.5 rounded-lg hover:bg-seat-error-soft transition-colors disabled:opacity-60"
        >
          {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
          Remove
        </button>
      </div>
    </Modal>
  );
}
