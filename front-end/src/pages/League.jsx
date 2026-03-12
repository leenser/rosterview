import { useState } from "react";
import SpendingProfiles from "../components/league/SpendingProfiles";
import GAMTable from "../components/league/GAMTable";
import PositionSpending from "../components/league/PositionSpending";
import DPOverview from "../components/league/DPOverview";
import NavBar from "../components/NavBar";

export default function League() {
  const [activeTable, setActiveTable] = useState("spending");

  return (
    <div className="min-h-screen">

      <NavBar page="League" />

      <div className="p-6 space-y-8">

        <div className="flex gap-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTable("spending")}
            className={`pb-3 text-sm font-medium border-b-2 transition ${
              activeTable === "spending"
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Spending Profiles
          </button>

          <button
            onClick={() => setActiveTable("gam")}
            className={`pb-3 text-sm font-medium border-b-2 transition ${
              activeTable === "gam"
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            GAM Table
          </button>

          <button
            onClick={() => setActiveTable("positions")}
            className={`pb-3 text-sm font-medium border-b-2 transition ${
              activeTable === "positions"
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Position Spending
          </button>

          <button
            onClick={() => setActiveTable("dp")}
            className={`pb-3 text-sm font-medium border-b-2 transition ${
              activeTable === "dp"
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            DP Overview
          </button>

          <button
            onClick={() => setActiveTable("cap")}
            className={`pb-3 text-sm font-medium border-b-2 transition ${
              activeTable === "cap"
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Cap Space
          </button>
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