import { useState } from "react";
import SpendingProfiles from "../components/league/SpendingProfiles";
import GAMTable from "../components/league/GAMTable";
import PositionSpending from "../components/league/PositionSpending";
import DPOverview from "../components/league/DPOverview";
import NavBar from "../components/NavBar";

const TABS = [
  { key: "spending", label: "Spending Profiles", icon: "💰" },
  { key: "gam", label: "GAM Table", icon: "📊" },
  { key: "positions", label: "Position Spending", icon: "🎯" },
  { key: "dp", label: "DP Overview", icon: "⭐" },
  { key: "cap", label: "Cap Space", icon: "📋" },
];

export default function League() {
  const [activeTable, setActiveTable] = useState("spending");

  const activeTab = TABS.find((t) => t.key === activeTable);

  return (
    <div className="min-h-screen bg-neutral-950">
      <NavBar page="League" />

      {/* Page Header */}
      <div className="border-b border-neutral-800 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-8 pt-8 pb-0">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            League Overview
          </h1>
          <p className="text-neutral-500 text-sm mb-6">
            League-wide salary data, GAM allocations, and roster construction trends — 2025 MLS season.
          </p>

          {/* Tab Bar */}
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTable(tab.key)}
                className={`relative px-4 py-2.5 text-sm font-medium rounded-t-md transition-all duration-150 ${
                  activeTable === tab.key
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
                }`}
              >
                {tab.label}
                {activeTable === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Panel */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-5 flex items-center gap-2">
          <span className="text-lg">{activeTab?.icon}</span>
          <h2 className="text-base font-semibold text-neutral-200">
            {activeTab?.label}
          </h2>
        </div>

        <div>
          {activeTable === "spending" && <SpendingProfiles />}
          {activeTable === "gam" && <GAMTable />}
          {activeTable === "positions" && <PositionSpending />}
          {activeTable === "dp" && <DPOverview />}
        </div>
      </div>
    </div>
  );
}
