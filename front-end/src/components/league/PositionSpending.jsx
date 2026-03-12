import { useEffect, useState } from "react"

export default function PositionSpending() {

  const [data, setData] = useState([])
  const [sortKey, setSortKey] = useState("total")

  useEffect(() => {
    fetch("http://localhost:8000/league/positions")
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

  return (
    <div className="space-y-6 max-w-3xl">

      <h2 className="text-xl font-semibold">
        Position Spending
      </h2>
      <div className="flex gap-4 text-sm mb-2 items-center">
        <span className="text-gray-400 mr-2">Sort:</span>
        <button onClick={() => setSortKey("gk")} className="text-blue-500 hover:underline">GK</button>
        <button onClick={() => setSortKey("defense")} className="text-green-500 hover:underline">Defense</button>
        <button onClick={() => setSortKey("midfield")} className="text-yellow-500 hover:underline">Midfield</button>
        <button onClick={() => setSortKey("attack")} className="text-red-500 hover:underline">Attack</button>
        <button onClick={() => setSortKey("total")} className="text-gray-300 hover:underline">Total</button>
      </div>

      {Array.from(new Map(data.map(t => [t.team, t])).values())
        .sort((a, b) => {
          if (sortKey === "total") return getTotal(b) - getTotal(a)
          return (b[sortKey] || 0) - (a[sortKey] || 0)
        })
        .map(team => {

        const total =
          (team.gk || 0) +
          (team.defense || 0) +
          (team.midfield || 0) +
          (team.attack || 0)

        const safeTotal = total === 0 ? 1 : total

        return (
          <div key={`${team.team}-${sortKey}`} className="grid grid-cols-[220px_1fr_100px] items-center gap-4">

            <a
              href={`/team/${team.team
                .toLowerCase()
                .replace(/\./g, "")
                .replace(/ /g, "-")
                .replace("dc-united", "d-c-united")}`}
              className="flex items-center gap-2 font-medium hover:underline"
            >
              <img
                src={`/logos/${team.team
                  .toLowerCase()
                  .replace(/\./g, "")
                  .replace(/ /g, "-")
                  .replace("dc-united", "d-c-united")}.png`}
                alt={team.team}
                className="w-5 h-5 object-contain"
              />
              <span>{team.team}</span>
            </a>

            <div className="flex h-2 rounded overflow-hidden max-w-md">

              <div
                className="bg-blue-500 border-r border-gray-900 flex items-center justify-center text-[10px] text-white font-semibold"
                title={`GK: ${formatMoney(team.gk)}`}
                style={{ width: `${(team.gk / safeTotal) * 100}%` }}
              >
                {(team.gk / safeTotal) > 0.12 ? formatMoney(team.gk) : ""}
              </div>

              <div
                className="bg-green-500 border-r border-gray-900 flex items-center justify-center text-[10px] text-white font-semibold"
                title={`Defense: ${formatMoney(team.defense)}`}
                style={{ width: `${(team.defense / safeTotal) * 100}%` }}
              >
                {(team.defense / safeTotal) > 0.12 ? formatMoney(team.defense) : ""}
              </div>

              <div
                className="bg-yellow-500 border-r border-gray-900 flex items-center justify-center text-[10px] text-white font-semibold"
                title={`Midfield: ${formatMoney(team.midfield)}`}
                style={{ width: `${(team.midfield / safeTotal) * 100}%` }}
              >
                {(team.midfield / safeTotal) > 0.12 ? formatMoney(team.midfield) : ""}
              </div>

              <div
                className="bg-red-500 flex items-center justify-center text-[10px] text-white font-semibold"
                title={`Attack: ${formatMoney(team.attack)}`}
                style={{ width: `${(team.attack / safeTotal) * 100}%` }}
              >
                {(team.attack / safeTotal) > 0.12 ? formatMoney(team.attack) : ""}
              </div>

            </div>

            <div className="text-right font-medium">
              {formatMoney(total)}
            </div>

          </div>
        )
      })}

    </div>
  )
}