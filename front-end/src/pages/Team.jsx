import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import NavBar from "../components/NavBar"

function InfoIcon({ text }) {
  return (
    <span
      className="ml-2 text-xs text-neutral-400 cursor-help border border-neutral-600 rounded-full px-1.5"
      title={text}
    >
      i
    </span>
  )
}

function SpendBreakdownBar({ title, data, total }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-4 rounded">
      <h3 className="text-base font-semibold mb-3">{title}</h3>

      <div className="w-full h-3 rounded-full overflow-hidden bg-neutral-800 mb-4 flex">
        {Object.entries(data).map(([label, value]) => {
          const widthPercent = total > 0 ? (value / total) * 100 : 0
          const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0"

          let color = "bg-neutral-400"
          if (label === "Attack") color = "bg-red-400"
          if (label === "Midfield") color = "bg-blue-400"
          if (label === "Defense") color = "bg-green-400"
          if (label === "Goalkeeper") color = "bg-yellow-400"

          if (label === "Designated Players") color = "bg-yellow-400"
          if (label === "U22 Players") color = "bg-green-400"
          if (label === "TAM Players") color = "bg-blue-400"

          return (
            <div
              key={label}
              className={color}
              style={{ width: `${widthPercent}%` }}
              title={`${label}: ${percent}%`}
            />
          )
        })}
      </div>

      <div className="space-y-2">
        {Object.entries(data).map(([label, value]) => {
          const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0"

          return (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-neutral-300">{label}</span>
              <span className="text-neutral-400">{percent}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Team() {
  const { slug } = useParams()

  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sortDir, setSortDir] = useState("desc")

  const sortedRoster =
    teamData && teamData.cap_breakdown
      ? [...teamData.cap_breakdown].sort((a, b) =>
          sortDir === "desc"
            ? b.guaranteed_comp - a.guaranteed_comp
            : a.guaranteed_comp - b.guaranteed_comp
        )
      : []

  const spendingByLine = {
    Attack: 0,
    Midfield: 0,
    Defense: 0,
    Goalkeeper: 0,
  }

  const spendingByMechanism = {
    "Designated Players": 0,
    "U22 Players": 0,
    "TAM Players": 0,
    "Senior Players": 0,
  }

  if (teamData?.cap_breakdown) {
    teamData.cap_breakdown.forEach((player) => {
      const salary = player.guaranteed_comp ?? 0
      const pos = player.position ?? ""

      if (["ST", "LW", "RW"].includes(pos)) spendingByLine.Attack += salary
      else if (["DM", "CM", "AM", "RM", "LM"].includes(pos)) spendingByLine.Midfield += salary
      else if (["LB", "RB", "CB"].includes(pos)) spendingByLine.Defense += salary
      else if (pos === "GK") spendingByLine.Goalkeeper += salary

      if (player.role === "Designated Player")
        spendingByMechanism["Designated Players"] += salary
      else if (player.role === "U22 Initiative")
        spendingByMechanism["U22 Players"] += salary
      else if (player.role === "TAM Player")
        spendingByMechanism["TAM Players"] += salary
      else spendingByMechanism["Senior Players"] += salary
    })
  }

  const totalLineSpend = Object.values(spendingByLine).reduce((a, b) => a + b, 0)
  const totalMechanismSpend = Object.values(spendingByMechanism).reduce((a, b) => a + b, 0)

  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true)
        setError("")

        const res = await fetch(`http://localhost:8000/team/${slug}`)
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)

        const data = await res.json()
        setTeamData(data)
      } catch (err) {
        console.error(err)
        setError("Could not load team data.")
      } finally {
        setLoading(false)
      }
    }

    loadTeam()
  }, [slug])

  if (loading)
    return <div className="min-h-screen px-8 py-6 text-neutral-300">Loading team...</div>

  if (error)
    return <div className="min-h-screen px-8 py-6 text-red-400">{error}</div>

  return (
    <div className="min-h-screen">
      <NavBar page={teamData?.team ?? "Team"} />
      <div className="px-8 py-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 flex-shrink-0">
          <img
            src={`/logos/${slug}.png`}
            alt={teamData.team}
            className="w-full h-full object-contain"
          />
        </div>

        <div>
          <h1 className="text-5xl font-semibold leading-tight">{teamData.team}</h1>
          <p className="text-sm text-neutral-400">
            Roster Model: {teamData.roster_model}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        <div className="lg:col-span-3">

          <div className="mb-8 bg-neutral-900 border border-neutral-800 p-4 rounded">
            <div className="flex justify-between items-center mb-3">
              <p className="text-base text-neutral-300 font-semibold flex items-center">
                Roster Spending
                <InfoIcon text="Total player compensation vs what counts against the MLS salary budget." />
              </p>
              <p className="text-sm text-neutral-400">
                Total: ${teamData.cap.total_comp.toLocaleString()}
              </p>
            </div>

            <div className="w-full h-3 bg-neutral-800 rounded overflow-hidden flex mb-3">
              <div
                className="bg-blue-400 h-full"
                style={{
                  width:
                    teamData.cap.total_comp > 0
                      ? `${(teamData.cap.total_cap_hit / teamData.cap.total_comp) * 100}%`
                      : "0%",
                }}
              />

              <div
                className="bg-neutral-500 h-full"
                style={{
                  width:
                    teamData.cap.total_comp > 0
                      ? `${((teamData.cap.total_comp - teamData.cap.total_cap_hit) / teamData.cap.total_comp) * 100}%`
                      : "0%",
                }}
              />
            </div>

            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2 text-neutral-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                Cap Hit: ${teamData.cap.total_cap_hit.toLocaleString()}
              </div>

              <div className="flex items-center gap-2 text-neutral-400">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-500"></span>
                Off-Budget: ${(teamData.cap.total_comp - teamData.cap.total_cap_hit).toLocaleString()}
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">Roster</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-neutral-800 bg-neutral-900 rounded">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-200 text-lg">
                  <th className="text-left px-4 py-3">Player</th>
                  <th className="text-left px-4 py-3">Position</th>
                  <th className="text-left px-4 py-3">Roster Role</th>
                  <th
                    className="text-right px-4 py-3 cursor-pointer select-none"
                    onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                  >
                    Compensation {sortDir === "desc" ? "↓" : "↑"}
                  </th>
                  <th className="text-left px-4 py-3">Cap Hit</th>
                  <th className="text-left px-4 py-3">Contract Through (Option Years)</th>
                  <th className="text-left px-4 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {sortedRoster.map((player) => {
                  let rowClass = "border-b border-neutral-800 last:border-b-0"

                  if (player.role === "Designated Player") rowClass += " bg-yellow-500/10"
                  else if (player.role === "U22 Initiative") rowClass += " bg-green-500/10"
                  else if (player.role === "TAM Player") rowClass += " bg-red-500/10"
                  else if (player.role === "Supplemental Roster") rowClass += " bg-neutral-800/40"

                  return (
                    <tr key={player.name} className={rowClass}>
                      <td className="px-4 py-3 flex items-center gap-2">
                        <span>{player.name}</span>
                      </td>

                      <td className="px-4 py-3 text-neutral-300">{player.position}</td>

                      <td className="px-4 py-3 text-neutral-300">
                        {player.role ?? "Senior"}
                      </td>

                      <td className="px-4 py-3 text-right">
                        ${player.guaranteed_comp.toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-right">
                        ${player.cap_hit.toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-neutral-300">
                        {(() => {
                          const through = player.contract_through
                          const options = player.option_years

                          if (!through) return "-"

                          if (!options || options === 0) {
                            return `${through}`
                          }

                          // if backend already provides option years as array
                          if (Array.isArray(options)) {
                            return `${through} (${options.join(", ")})`
                          }

                          // if backend gives number of option years
                          return `${through} (${options})`
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        {player.status === "Unavailable \u2013 SEI" && (
                          <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                            SEI
                          </span>
                        )}

                        {player.status === "Unavailable \u2013 On Loan" && (
                          <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                            Loaned Out
                          </span>
                        )}

                        {player.status === "Loan Player" && (
                          <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Loaned In
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded bg-yellow-500/20">
            <div className="flex justify-between items-center mb-2">
              <p className="text-base text-neutral-300 font-semibold flex items-center">
                Designated Players
                <InfoIcon text="Players whose salary exceeds the maximum budget charge. Clubs may have up to 3." />
              </p>
              <p className="text-lg font-semibold">
                {teamData.validation?.summary?.dp_count ?? 0} / {teamData.validation?.summary?.dp_limit ?? 3}
              </p>
            </div>
            <div className="w-full h-2 bg-neutral-800 rounded overflow-hidden">
              <div
                className="h-full bg-yellow-400"
                style={{
                  width: `${
                    ((teamData.validation?.summary?.dp_count ?? 0) /
                      (teamData.validation?.summary?.dp_limit ?? 3)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="border border-neutral-800 p-4 rounded bg-green-500/20">
            <div className="flex justify-between items-center mb-2">
              <p className="text-base text-neutral-300 font-semibold flex items-center">
                U22 Players
                <InfoIcon text="Young players signed under the U22 Initiative with reduced cap charges." />
              </p>
              <p className="text-lg font-semibold">
                {teamData.validation?.summary?.u22_count ?? 0} / {teamData.validation?.summary?.u22_limit ?? 3}
              </p>
            </div>
            <div className="w-full h-2 bg-neutral-800 rounded overflow-hidden">
              <div
                className="h-full bg-green-400"
                style={{
                  width: `${
                    ((teamData.validation?.summary?.u22_count ?? 0) /
                      (teamData.validation?.summary?.u22_limit ?? 3)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="bg-red-500/20 border border-neutral-800 p-4 rounded flex justify-between items-center">
            <p className="text-base text-neutral-300 font-semibold flex items-center">
              TAM Players
              <InfoIcon text="Players whose salaries are bought down using Targeted Allocation Money." />
            </p>
            <p className="text-lg font-semibold">
              {teamData.counts?.tam_players ?? 0}
            </p>
          </div>


          <SpendBreakdownBar
            title="Spending by Position"
            data={spendingByLine}
            total={totalLineSpend}
          />

          <SpendBreakdownBar
            title="Spending by Mechanism"
            data={spendingByMechanism}
            total={totalMechanismSpend}
          />

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded flex justify-between items-center">
            <p className="text-base text-neutral-300 font-semibold flex items-center">
              Total Players
              <InfoIcon text="Active roster players excluding players on SEI or loaned out." />
            </p>
            <p className="text-lg font-semibold text-right">
              {teamData.cap_breakdown
                ? teamData.cap_breakdown.filter(
                    (p) =>
                      p.status !== "Unavailable – SEI" &&
                      p.status !== "Unavailable – On Loan"
                  ).length
                : 0}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded flex justify-between items-center">
            <p className="text-base text-neutral-300 font-semibold flex items-center">
              Supplemental Roster
              <InfoIcon text="Players occupying roster slots 21-30 which do not count against the salary budget." />
            </p>
            <p className="text-lg font-semibold text-right">
              {teamData.counts?.supplemental_players ?? 0}
            </p>
          </div>


          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded flex justify-between items-center">
            <p className="text-base text-neutral-300 font-semibold">International Slots Used</p>
            <p className="text-lg font-semibold text-right">
              {teamData.validation?.summary?.international_slots_used ?? 0}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded flex justify-between items-center">
            <p className="text-base text-neutral-300 font-semibold flex items-center">
              Remaining GAM
              <InfoIcon text="General Allocation Money available for buying down salaries or trades." />
            </p>
            <p className="text-lg font-semibold text-right">
              ${teamData.validation?.summary?.remaining_gam?.toLocaleString?.() ?? 0}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded flex justify-between items-center">
            <p className="text-base text-neutral-300 font-semibold flex items-center">
              Remaining Cap Space
              <InfoIcon text="Estimated salary budget space remaining after current cap charges." />
            </p>
            <p className="text-lg font-semibold text-right">
              ${(6425000 - teamData.cap.total_cap_hit + (teamData.validation?.summary?.remaining_gam ?? 0) + 2125000).toLocaleString()}
            </p>
          </div>

          {!teamData.validation?.is_valid && (
            <div className="bg-red-500/10 border border-red-500/40 p-4 rounded">
              <p className="text-sm font-semibold text-red-400 mb-2">
                Roster Issues
              </p>
              <ul className="text-sm text-red-300 list-disc list-inside space-y-1">
                {teamData.validation?.issues?.map(issue => (
                  <li key={issue.type}>{issue.message}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
      </div>
    </div>
  )
}

export default Team