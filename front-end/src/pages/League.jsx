import { useState } from "react";
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
  const [activeTable, setActiveTable] = useState("spending");

  const activeTab = TABS.find((t) => t.key === activeTable);

  return (
    <div className="min-h-screen bg-neutral-950">
      <NavBar page="League" />

      {/* Page Header */}
      <div className="border-b border-neutral-800 bg-neutral-950">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-0">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            League Overview
          </h1>
          <p className="text-neutral-500 text-sm mb-6">
            League-wide salary data, GAM allocations, and roster construction trends.
          </p>

          {/* Tab Bar */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTable(tab.key)}
                className={`relative px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-t-md transition-all duration-150 whitespace-nowrap ${
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
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        

        <div>
          {activeTable === "spending" && <SpendingProfiles />}
          {activeTable === "gam" && <GAMTable />}
          {activeTable === "positions" && <PositionSpending />}
          {activeTable === "dp" && <DPOverview />}
          {activeTable === "cap" && <CapSpace />}
        </div>
      </div>
      <Footer />
    </div>
  );
}
