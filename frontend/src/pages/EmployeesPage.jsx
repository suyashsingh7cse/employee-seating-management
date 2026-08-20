import { useMemo, useState } from "react";
import { Search, Plus, Pencil, Trash2, UserRound } from "lucide-react";
import EmployeeFormModal from "../components/EmployeeFormModal";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../hooks/useToast";

export default function EmployeesPage({ data }) {
  const { employees, createEmployee, updateEmployee, deleteEmployee } = data;
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [formTarget, setFormTarget] = useState(null); // null = closed, {} = add, employee = edit
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
    );
  }, [employees, search]);

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Employees</h1>
          <p className="text-sm text-ink-soft mt-1">{employees.length} total</p>
        </div>
        <button
          onClick={() => setFormTarget({})}
          className="flex items-center gap-2 bg-sidebar text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-black transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add employee
        </button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search className="w-4 h-4 text-ink-faint absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, department, or email…"
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-line text-sm bg-surface focus:border-brand"
        />
      </div>

      <div className="bg-surface border border-line rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-soft">
            {employees.length === 0 ? "No employees yet. Add your first one above." : "No employees match your search."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-ink-soft uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Seat</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} className="border-b border-line last:border-0 hover:bg-canvas/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-brand-soft text-brand-dark flex items-center justify-center text-[11px] font-semibold shrink-0">
                        {emp.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                      </div>
                      <span className="font-medium">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-soft">{emp.department}</td>
                  <td className="px-5 py-3 text-ink-soft">{emp.email}</td>
                  <td className="px-5 py-3">
                    {emp.seat ? (
                      <span className="font-mono text-xs bg-seat-open-soft text-seat-open px-2 py-1 rounded">
                        {emp.seat.seat_number}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-ink-faint">
                        <UserRound className="w-3.5 h-3.5" />
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setFormTarget(emp)}
                        aria-label={`Edit ${emp.name}`}
                        className="p-1.5 rounded-md hover:bg-canvas text-ink-soft hover:text-ink"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(emp)}
                        aria-label={`Delete ${emp.name}`}
                        className="p-1.5 rounded-md hover:bg-seat-error-soft text-ink-soft hover:text-seat-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {formTarget !== null && (
        <EmployeeFormModal
          employee={formTarget.id ? formTarget : null}
          onSave={async (payload) => {
            if (formTarget.id) {
              await updateEmployee(formTarget.id, payload);
              toast.success(`${payload.name} updated.`);
            } else {
              await createEmployee(payload);
              toast.success(`${payload.name} added.`);
            }
          }}
          onClose={() => setFormTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Remove employee"
          message={`Remove ${deleteTarget.name}? ${
            deleteTarget.seat ? `This also frees seat ${deleteTarget.seat.seat_number}.` : ""
          } This can't be undone.`}
          confirmLabel="Remove"
          onConfirm={async () => {
            await deleteEmployee(deleteTarget.id);
            toast.success(`${deleteTarget.name} removed.`);
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
