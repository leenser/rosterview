import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { getTeamSlug } from "../../utils/teamSlug"

export default function PositionSpending() {

  const [data, setData] = useState([])
  const [sortKey, setSortKey] = useState("total")

  useEffect(() => {
    fetch("https://rosterview.onrender.com/league/positions")
      .then(res => res.json())
      .then(setData)
  }, [])

  const formatMoney = (value) => {
    if (!value) return "$0"
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
    return `$${value}`
  }

  const getTotal = (team) =>
    (team.gk || 0) + (team.defense || 0) + (team.midfield || 0) + (team.attack || 0)

  const segmentClasses = {
    gk: "bg-blue-500",
    defense: "bg-green-500",
    midfield: "bg-yellow-500",
    attack: "bg-red-500",
  }

  const labelClasses = {
    gk: "text-blue-300",
    defense: "text-green-300",
    midfield: "text-yellow-300",
    attack: "text-red-300",
  }

  return (
    <div className="space-y-6 w-full px-4 sm:px-6">

      <div className="flex flex-wrap gap-4 text-base items-center border-b border-neutral-800 pb-3">
        <span className="text-gray-400 mr-2">Sort:</span>
        <button onClick={() => setSortKey("gk")} className="text-blue-500 hover:underline">GK</button>
        <button onClick={() => setSortKey("defense")} className="text-green-500 hover:underline">Defense</button>
        <button onClick={() => setSortKey("midfield")} className="text-yellow-500 hover:underline">Midfield</button>
        <button onClick={() => setSortKey("attack")} className="text-red-500 hover:underline">Attack</button>
        <button onClick={() => setSortKey("total")} className="text-gray-300 hover:underline">Total</button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {Array.from(new Map(data.map(t => [t.team, t])).values())
          .sort((a, b) => {
            if (sortKey === "total") return getTotal(b) - getTotal(a)
            return (b[sortKey] || 0) - (a[sortKey] || 0)
          })
          .map(team => {
            const slug = getTeamSlug(team.team)

            const total =
              (team.gk || 0) +
              (team.defense || 0) +
              (team.midfield || 0) +
              (team.attack || 0)

            const safeTotal = total === 0 ? 1 : total

            return (
              <div key={`${team.team}-${sortKey}`} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 sm:p-4 flex flex-col gap-3">

                <div className="flex justify-between items-center">
                  <Link to={`/team/${slug}`} className="flex items-center gap-2 font-medium hover:underline">
                    <img
                      src={`/logos/${slug}.png`}
                      alt={team.team}
                      className="w-5 h-5 object-contain"
                    />
                    <span className="text-base sm:text-lg">{team.team}</span>
                  </Link>

                  <span className="text-sm sm:text-base font-semibold text-neutral-300">
                    {formatMoney(total)}
                  </span>
                </div>

                <div className="flex h-5 sm:h-6 rounded overflow-hidden w-full bg-neutral-950/80">

                  <div
                    className={`${segmentClasses.gk} border-r border-gray-900 flex items-center justify-center px-1 text-[10px] text-white font-semibold`}
                    style={{ width: `${(team.gk / safeTotal) * 100}%` }}
                  >
                    {(team.gk / safeTotal) > 0.15 ? formatMoney(team.gk) : ""}
                  </div>

                  <div
                    className={`${segmentClasses.defense} border-r border-gray-900 flex items-center justify-center px-1 text-[10px] text-white font-semibold`}
                    style={{ width: `${(team.defense / safeTotal) * 100}%` }}
                  >
                    {(team.defense / safeTotal) > 0.15 ? formatMoney(team.defense) : ""}
                  </div>

                  <div
                    className={`${segmentClasses.midfield} border-r border-gray-900 flex items-center justify-center px-1 text-[10px] text-white font-semibold`}
                    style={{ width: `${(team.midfield / safeTotal) * 100}%` }}
                  >
                    {(team.midfield / safeTotal) > 0.15 ? formatMoney(team.midfield) : ""}
                  </div>

                  <div
                    className={`${segmentClasses.attack} flex items-center justify-center px-1 text-[10px] text-white font-semibold`}
                    style={{ width: `${(team.attack / safeTotal) * 100}%` }}
                  >
                    {(team.attack / safeTotal) > 0.15 ? formatMoney(team.attack) : ""}
                  </div>

                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mt-1">
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] px-2.5 py-2">
                    <div className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] ${labelClasses.gk}`}>GK</div>
                    <div className="mt-1 text-sm sm:text-base text-white">{formatMoney(team.gk || 0)}</div>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] px-2.5 py-2">
                    <div className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] ${labelClasses.defense}`}>DEF</div>
                    <div className="mt-1 text-sm sm:text-base text-white">{formatMoney(team.defense || 0)}</div>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] px-2.5 py-2">
                    <div className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] ${labelClasses.midfield}`}>MID</div>
                    <div className="mt-1 text-sm sm:text-base text-white">{formatMoney(team.midfield || 0)}</div>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] px-2.5 py-2">
                    <div className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] ${labelClasses.attack}`}>FOR</div>
                    <div className="mt-1 text-sm sm:text-base text-white">{formatMoney(team.attack || 0)}</div>
                  </div>
                </div>

              </div>
            )
          })}
      </div>

    </div>
  )
}
