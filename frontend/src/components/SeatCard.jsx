export default function SeatCard({ seat, onClick, isMoveTarget, isMoveSource }) {
  const base =
    "relative border rounded-lg px-2 py-3 text-center transition-all cursor-pointer select-none font-mono";

  let stateClasses;
  if (isMoveSource) {
    stateClasses = "border-brand bg-brand-soft ring-2 ring-brand/40";
  } else if (isMoveTarget) {
    stateClasses = "border-seat-open bg-seat-open-soft ring-2 ring-seat-open/30 hover:ring-4";
  } else if (seat.is_occupied) {
    stateClasses = "border-line bg-seat-occupied-soft hover:border-ink-faint";
  } else {
    stateClasses = "border-dashed border-line bg-surface hover:border-brand hover:bg-brand-soft/40";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${stateClasses}`}
      title={seat.is_occupied ? `${seat.seat_number} — ${seat.employee.name}` : `${seat.seat_number} — available`}
    >
      <div className="text-[11px] font-semibold tracking-wide text-ink-soft">{seat.seat_number}</div>
      <div className="mt-1.5 text-[11px] leading-tight font-sans truncate">
        {seat.is_occupied ? (
          <span className="text-ink font-medium">{seat.employee.name.split(" ")[0]}</span>
        ) : (
          <span className="text-ink-faint">Open</span>
        )}
      </div>
    </button>
  );
}
