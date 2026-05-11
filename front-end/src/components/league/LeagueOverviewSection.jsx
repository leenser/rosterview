import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import SpendingProfiles from "./SpendingProfiles"
import GAMTable from "./GAMTable"
import PositionSpending from "./PositionSpending"
import DPOverview from "./DPOverview"
import CapSpace from "./CapSpace"

const TABS = [
  { key: "spending", label: "Spending Profiles", icon: "💰" },
  { key: "gam", label: "GAM Table", icon: "📊" },
  { key: "positions", label: "Position Spending", icon: "🎯" },
  { key: "dp", label: "DP/U22 Overview", icon: "⭐" },
  { key: "cap", label: "Cap Space", icon: "📋" },
]

function LeagueTableContent({ activeTable }) {
  if (activeTable === "spending") return <SpendingProfiles />
  if (activeTable === "gam") return <GAMTable />
  if (activeTable === "positions") return <PositionSpending />
  if (activeTable === "dp") return <DPOverview />
  return <CapSpace />
}

function LeagueTabBar({ activeTable, onSelect, className = "" }) {
  return (
    <div className={`mt-6 w-full rounded-[22px] border border-white/8 bg-blue/[0.035] p-1.5 ${className}`}>
      <div className="grid min-w-[52rem] grid-cols-5 gap-1.5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onSelect(tab.key)}
            className={`flex items-center justify-center gap-2 rounded-[18px] px-4 py-3 text-xs sm:text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
              activeTable === tab.key
                ? "bg-blue-600 text-white-950"
                : "bg-transparent text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200"
            }`}
          >
            <span className="text-sm opacity-90">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function LeagueOverviewSection({
  paramKey = "tab",
  variant = "page",
  title = "League Overview",
  description = "Compare roster construction, GAM movement, cap flexibility, and designated-player usage",
}) {
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTable = useMemo(() => {
    const tab = searchParams.get(paramKey)
    return TABS.some((item) => item.key === tab) ? tab : "spending"
  }, [paramKey, searchParams])

  function setActiveTable(tabKey) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set(paramKey, tabKey)
      return next
    })
  }

  if (variant === "home") {
    return (
      <section
        id="league-overview"
        className="relative overflow-hidden rounded-[28px] border border-white/8 bg-neutral-950"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-8 top-0 h-32 w-32 rounded-full bg-sky-500/8 blur-3xl" />
          <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-emerald-400/6 blur-3xl" />
        </div>

        <div className="relative border-b border-white/8 px-4 sm:px-6 lg:px-8 pt-6 sm:pt-7 pb-5">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {title}
          </h2>
          {description && (
            <p className="mt-2 max-w-2xl text-sm sm:text-base leading-relaxed text-neutral-400">
              {description}
            </p>
          )}

          <div className="overflow-x-auto no-scrollbar pb-1">
            <LeagueTabBar activeTable={activeTable} onSelect={setActiveTable} />
          </div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <LeagueTableContent activeTable={activeTable} />
        </div>
      </section>
    )
  }

  return (
    <>
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
              {title}
            </h1>
            <p className="max-w-2xl text-sm sm:text-base leading-relaxed text-neutral-400">
              {description}
            </p>
          </div>

          <div className="overflow-x-auto no-scrollbar pb-1">
            <LeagueTabBar activeTable={activeTable} onSelect={setActiveTable} className="mt-7" />
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="relative">
          <div className="pointer-events-none absolute -inset-2 rounded-[28px] bg-gradient-to-br from-white/[0.03] via-transparent to-sky-400/[0.03]" />
          <div className="relative">
            <LeagueTableContent activeTable={activeTable} />
          </div>
        </div>
      </div>
    </>
  )
}
