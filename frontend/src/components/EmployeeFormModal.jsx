import { useState } from "react";
import { Loader2 } from "lucide-react";
import Modal from "./Modal";

const DEPARTMENTS = ["Engineering", "Design", "Product", "Sales", "HR", "Marketing", "Finance"];

export default function EmployeeFormModal({ employee, onSave, onClose }) {
  const [name, setName] = useState(employee?.name ?? "");
  const [email, setEmail] = useState(employee?.email ?? "");
  const [department, setDepartment] = useState(employee?.department ?? DEPARTMENTS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await onSave({ name: name.trim(), email: email.trim(), department });
      onClose();
    } catch (err) {
      setError(err.message || "Could not save this employee.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={employee ? "Edit employee" : "Add employee"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1.5">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-line text-sm focus:border-brand"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-line text-sm focus:border-brand"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1.5">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-line text-sm focus:border-brand"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
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
          {employee ? "Save changes" : "Add employee"}
        </button>
      </form>
    </Modal>
  );
}
