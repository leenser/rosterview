import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import SpendingProfiles from "../components/league/SpendingProfiles";
import GAMTable from "../components/league/GAMTable";
import PositionSpending from "../components/league/PositionSpending";
import DPOverview from "../components/league/DPOverview";
import CapSpace from "../components/league/CapSpace";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer"

const TABS = [
  { key: "spending", label: "Spending Profiles", icon: "💰" },
  { key: "gam", label: "GAM Table", icon: "📊" },
  { key: "positions", label: "Position Spending", icon: "🎯" },
  { key: "dp", label: "DP/U22 Overview", icon: "⭐" },
  { key: "cap", label: "Cap Space", icon: "📋" },
];

export default function League() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTable = useMemo(() => {
    const tab = searchParams.get("tab");
    return TABS.some((item) => item.key === tab) ? tab : "spending";
  }, [searchParams]);

  function setActiveTable(tabKey) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tabKey);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <NavBar page="League" />

      {/* Page Header */}
      <div className="relative overflow-hidden border-b border-white/8 bg-neutral-950">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-sky-500/12 blur-3xl" />
          <div className="absolute top-12 left-0 h-48 w-48 rounded-full bg-emerald-400/8 blur-3xl" />
          <div className="absolute right-0 top-10 h-52 w-52 rounded-full bg-amber-400/8 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-6">
         

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
              League Overview
            </h1>
            <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-neutral-400">
              Compare roster construction, GAM movement, cap flexibility, and designated-player usage across the league in one place.
            </p>
          </div>

          <div className="mt-7 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTable(tab.key)}
                className={`group relative flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs sm:text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                  activeTable === tab.key
                    ? "border-sky-400/30 bg-sky-400/12 text-white shadow-[0_12px_30px_rgba(14,165,233,0.12)]"
                    : "border-white/8 bg-white/[0.03] text-neutral-400 hover:border-white/14 hover:bg-white/[0.06] hover:text-neutral-200"
                }`}
              >
                <span className="text-sm opacity-90">{tab.icon}</span>
                <span>{tab.label}</span>
                {activeTable === tab.key && (
                  <span className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Panel */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="relative">
          <div className="pointer-events-none absolute -inset-2 rounded-[28px] bg-gradient-to-br from-white/[0.03] via-transparent to-sky-400/[0.03]" />
          <div className="relative">
            {activeTable === "spending" && <SpendingProfiles />}
            {activeTable === "gam" && <GAMTable />}
            {activeTable === "positions" && <PositionSpending />}
            {activeTable === "dp" && <DPOverview />}
            {activeTable === "cap" && <CapSpace />}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
