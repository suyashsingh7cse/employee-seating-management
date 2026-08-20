export default function StatCard({ label, value, icon: Icon, accent = "ink" }) {
  const accentClasses = {
    ink: "bg-ink/5 text-ink",
    brand: "bg-brand-soft text-brand-dark",
    open: "bg-seat-open-soft text-seat-open",
    occupied: "bg-seat-occupied-soft text-seat-occupied",
  };

  return (
    <div className="bg-surface border border-line rounded-xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accentClasses[accent]}`}>
        <Icon className="w-5 h-5" strokeWidth={2} />
      </div>
      <div>
        <p className="text-2xl font-semibold font-mono tabular-nums leading-none">{value}</p>
        <p className="text-xs text-ink-soft mt-1.5">{label}</p>
      </div>
    </div>
  );
}
