import { useMemo } from "react";
import { Users, Armchair, CheckCircle2, CircleDashed } from "lucide-react";
import StatCard from "../components/StatCard";

export default function OverviewPage({ data }) {
  const { employees, seats } = data;

  const stats = useMemo(() => {
    const occupied = seats.filter((s) => s.is_occupied).length;
    return {
      totalEmployees: employees.length,
      totalSeats: seats.length,
      occupied,
      available: seats.length - occupied,
    };
  }, [employees, seats]);

  const byDepartment = useMemo(() => {
    const counts = {};
    for (const e of employees) counts[e.department] = (counts[e.department] || 0) + 1;
    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, [employees]);

  return (
    <div>
      <h1 className="text-lg font-semibold mb-6">Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total employees" value={stats.totalEmployees} icon={Users} accent="ink" />
        <StatCard label="Total seats" value={stats.totalSeats} icon={Armchair} accent="brand" />
        <StatCard label="Occupied" value={stats.occupied} icon={CheckCircle2} accent="occupied" />
        <StatCard label="Available" value={stats.available} icon={CircleDashed} accent="open" />
      </div>

      <div className="bg-surface border border-line rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-4">Headcount by department</h2>
        {byDepartment.length === 0 ? (
          <p className="text-sm text-ink-soft">No employees yet.</p>
        ) : (
          <div className="space-y-3">
            {byDepartment.map(([dept, count]) => (
              <div key={dept} className="flex items-center gap-3">
                <span className="text-sm w-28 shrink-0 text-ink-soft">{dept}</span>
                <div className="flex-1 h-2 bg-canvas rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full"
                    style={{ width: `${(count / stats.totalEmployees) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-mono w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
