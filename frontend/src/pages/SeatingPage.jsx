import { useMemo, useState } from "react";
import { X } from "lucide-react";
import SeatCard from "../components/SeatCard";
import AssignSeatModal from "../components/AssignSeatModal";
import SeatDetailModal from "../components/SeatDetailModal";
import { useToast } from "../hooks/useToast";

export default function SeatingPage({ data }) {
  const { seats, employees, assignmentForSeat, assignSeat, moveAssignment, removeAssignment } =
    data;
  const toast = useToast();

  const [assignTarget, setAssignTarget] = useState(null); // seat being assigned
  const [detailTarget, setDetailTarget] = useState(null); // seat being inspected
  const [moving, setMoving] = useState(null); // { assignmentId, employeeName, fromSeatId }

  const unassignedEmployees = useMemo(
    () => employees.filter((e) => !e.seat),
    [employees]
  );

  const rows = useMemo(() => {
    const grouped = {};
    for (const seat of seats) {
      grouped[seat.row] = grouped[seat.row] || [];
      grouped[seat.row].push(seat);
    }
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  function handleSeatClick(seat) {
    if (moving) {
      if (seat.id === moving.fromSeatId) {
        setMoving(null);
        return;
      }
      if (seat.is_occupied) {
        toast.error(`${seat.seat_number} is already occupied.`);
        return;
      }
      moveAssignment(moving.assignmentId, seat.id)
        .then(() => {
          toast.success(`${moving.employeeName} moved to ${seat.seat_number}.`);
          setMoving(null);
        })
        .catch((err) => toast.error(err.message || "Could not move employee."));
      return;
    }

    if (seat.is_occupied) {
      setDetailTarget(seat);
    } else {
      setAssignTarget(seat);
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold">Office floor plan</h1>
          <p className="text-sm text-ink-soft mt-1">
            Click an open seat to assign someone, or an occupied seat to move or remove them.
          </p>
        </div>
        <Legend />
      </div>

      {moving && (
        <div className="flex items-center justify-between bg-brand-soft border border-brand/30 text-brand-dark text-sm rounded-lg px-4 py-2.5 mb-5">
          <span>
            Moving <strong>{moving.employeeName}</strong> — click an open seat to place them, or the
            highlighted seat to cancel.
          </span>
          <button onClick={() => setMoving(null)} className="hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="blueprint-grid bg-surface border border-line rounded-xl p-6">
        <div className="space-y-3">
          {rows.map(([row, rowSeats]) => (
            <div key={row} className="flex gap-3">
              {rowSeats
                .sort((a, b) => a.column - b.column)
                .map((seat) => (
                  <div key={seat.id} className="w-24">
                    <SeatCard
                      seat={seat}
                      isMoveSource={moving?.fromSeatId === seat.id}
                      isMoveTarget={!!moving && !seat.is_occupied && moving.fromSeatId !== seat.id}
                      onClick={() => handleSeatClick(seat)}
                    />
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      {assignTarget && (
        <AssignSeatModal
          seat={assignTarget}
          unassignedEmployees={unassignedEmployees}
          onAssign={async (employeeId) => {
            await assignSeat(employeeId, assignTarget.id);
            const emp = employees.find((e) => e.id === employeeId);
            toast.success(`${emp?.name ?? "Employee"} assigned to ${assignTarget.seat_number}.`);
          }}
          onClose={() => setAssignTarget(null)}
        />
      )}

      {detailTarget && (
        <SeatDetailModal
          seat={detailTarget}
          employee={detailTarget.employee}
          onStartMove={() => {
            const assignment = assignmentForSeat(detailTarget.id);
            setMoving({
              assignmentId: assignment.id,
              employeeName: detailTarget.employee.name,
              fromSeatId: detailTarget.id,
            });
          }}
          onRemove={async () => {
            const assignment = assignmentForSeat(detailTarget.id);
            await removeAssignment(assignment.id);
            toast.success(`${detailTarget.employee.name} removed from ${detailTarget.seat_number}.`);
          }}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </div>
  );
}

function Legend() {
  const items = [
    { label: "Available", swatch: "border-dashed border-line bg-surface" },
    { label: "Occupied", swatch: "border-line bg-seat-occupied-soft" },
    { label: "Selected", swatch: "border-brand bg-brand-soft" },
  ];
  return (
    <div className="flex items-center gap-4 text-xs text-ink-soft">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5">
          <span className={`w-3 h-3 rounded border ${it.swatch}`} />
          {it.label}
        </div>
      ))}
    </div>
  );
}
