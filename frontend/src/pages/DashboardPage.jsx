import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import OverviewPage from "./OverviewPage";
import SeatingPage from "./SeatingPage";
import EmployeesPage from "./EmployeesPage";
import AIAssistantPage from "./AIAssistantPage";
import { useSeatingData } from "../hooks/useSeatingData";
import Footer from "../components/Footer";

const PAGES = {
  overview: OverviewPage,
  seating: SeatingPage,
  employees: EmployeesPage,
  assistant: AIAssistantPage,
};

export default function DashboardPage() {
  const [active, setActive] = useState("overview");
  const data = useSeatingData();
  const ActivePage = PAGES[active];

  return (
    <div className="flex">
      <Sidebar active={active} onNavigate={setActive} />
      <main className="flex-1 p-8 max-w-6xl">
        {data.loading ? (
          <div className="flex items-center justify-center h-64 text-ink-soft gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading seating data…
          </div>
        ) : data.loadError ? (
          <div className="flex items-center gap-2 text-seat-error bg-seat-error-soft rounded-lg px-4 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {data.loadError} —{" "}
            <button onClick={data.refresh} className="underline font-medium">
              retry
            </button>
          </div>
        ) : (
          <ActivePage data={data} />
        )}
         <Footer />
      </main>
    </div>
  );
}
