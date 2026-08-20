import { LayoutGrid, Users, Armchair, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "seating", label: "Seating", icon: Armchair },
  { id: "employees", label: "Employees", icon: Users },
  { id: "assistant", label: "AI Assistant", icon: Sparkles },
];

export default function Sidebar({ active, onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 shrink-0 bg-sidebar text-white flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <LayoutGrid className="w-4.5 h-4.5 text-brand" strokeWidth={2.5} />
        </div>
        <span className="font-semibold tracking-tight">Seating Admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active === id
                ? "bg-white/10 text-white font-medium"
                : "text-sidebar-soft hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4" strokeWidth={2} />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-2 px-3 py-2 text-sm text-sidebar-soft">
          <div className="w-7 h-7 rounded-full bg-brand/20 text-brand flex items-center justify-center text-xs font-semibold">
            {user?.username?.[0]?.toUpperCase() ?? "A"}
          </div>
          <span className="truncate">{user?.username}</span>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-soft hover:bg-white/5 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
