import { useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "./Modal";

export default function AssignSeatModal({ seat, unassignedEmployees, onAssign, onClose }) {
  const [employeeId, setEmployeeId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!employeeId) return;
    setSubmitting(true);
    setError("");
    try {
      await onAssign(Number(employeeId));
      onClose();
    } catch (err) {
      setError(err.message || "Could not assign this seat.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`Assign seat ${seat.seat_number}`} onClose={onClose}>
      {unassignedEmployees.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Every employee already has a seat. Remove someone from their current seat first, or add a new
          employee.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1.5">Employee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-line text-sm focus:border-brand"
              required
            >
              <option value="" disabled>
                Select an employee…
              </option>
              {unassignedEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.department}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-seat-error bg-seat-error-soft rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-brand-dark text-white text-sm font-medium py-2.5 rounded-lg hover:bg-brand transition-colors disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Assign to {seat.seat_number}
          </button>
        </form>
      )}
    </Modal>
  );
}
