import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"

function InfoIcon({ text }) {
  return (
    <span className="relative ml-1.5 inline-flex items-center flex-shrink-0 group">
      <span className="flex items-center justify-center w-4 h-4 text-[10px] text-neutral-400 cursor-help border border-neutral-600 rounded-full hover:border-neutral-400 hover:text-neutral-200 transition-colors leading-none">
        i
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded bg-neutral-800 border border-neutral-700 px-3 py-2.5 text-xs text-neutral-200 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 leading-relaxed whitespace-normal">
        {text}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-700" />
      </span>
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

function TransferBadge({ label, value }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs bg-neutral-800 border border-neutral-700 rounded px-2.5 py-1">
      <span className="text-neutral-400">{label}:</span>
      <span className="text-white font-semibold">${value.toLocaleString()}</span>
    </span>
  )
}

function StatusBadge({ status }) {
  if (status === "Unavailable – Injured List")
    return <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">Injured</span>
  if (status === "Unavailable – On Loan")
    return <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Loaned Out</span>
  if (status === "Loan Player")
    return <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">Loaned In</span>
  if (status === "Unavailable – Off Roster")
    return <span className="text-xs px-2 py-0.5 rounded bg-neutral-500/20 text-red-300 border border-red-500/30">Off Roster</span>
  return null
}

function Team() {
  const { slug } = useParams()

  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sortKey, setSortKey] = useState("role")
  const [sortDir, setSortDir] = useState("desc")

  const roleOrder = {
    "Designated Player": 7,
    "U22 Initiative": 6,
    "TAM Player": 5,
    "Senior": 4,
    "Supplemental Roster": 2,
    "Homegrown Player": 1
  }

  const sortedRoster =
    teamData && teamData.cap_breakdown
      ? [...teamData.cap_breakdown].sort((a, b) => {
          let valA, valB
          if (sortKey === "position") {
            valA = roleOrder[a.role || "Senior"] || 3
            valB = roleOrder[b.role || "Senior"] || 3
          } else if (sortKey === "role") {
            valA = roleOrder[a.role] || 3
            valB = roleOrder[b.role] || 3
          } else {
            valA = a.guaranteed_comp
            valB = b.guaranteed_comp
          }
          return sortDir === "desc" ? valB - valA : valA - valB
        })
      : []

  const spendingByLine = { Attack: 0, Midfield: 0, Defense: 0, Goalkeeper: 0 }
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

      if (player.role === "Designated Player") spendingByMechanism["Designated Players"] += salary
      else if (player.role === "U22 Initiative") spendingByMechanism["U22 Players"] += salary
      else if (player.role === "TAM Player") spendingByMechanism["TAM Players"] += salary
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
    return <div className="min-h-screen px-8 py-4 text-neutral-300">Loading team...</div>

  if (error)
    return <div className="min-h-screen px-8 py-4 text-red-400">{error}</div>

  return (
    <div className="min-h-screen">
      <NavBar page={teamData?.team ?? "Team"} />
      <div className="px-8 py-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 flex-shrink-0">
            <img
              src={`/logos/${slug}.png`}
              alt={teamData.team}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-4xl font-semibold leading-tight">{teamData.team}</h1>
            <p className="text-sm text-neutral-400">Roster Model: {teamData.roster_model}<InfoIcon text="Teams choose between two models: the DP Model (up to 3 DPs, 3 U22 slots) or the U22 Model (up to 4 U22 slots, plus $2M extra GAM if under 3 DPs)." /></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">

            {/* Roster Spending Bar */}
            <div className="mb-5 bg-neutral-900 border border-neutral-800 p-4 rounded">
              <div className="flex justify-between items-center mb-3">
                <p className="text-base text-neutral-300 font-semibold flex items-center">
                  Roster Spending
                  <InfoIcon text="The total a team pays its players compared with what counts against the salary cap." />
                </p>
                <p className="text-sm text-neutral-400">
                  Total: ${teamData.cap.total_comp.toLocaleString()}
                </p>
              </div>
              <div className="w-full h-3 bg-neutral-800 rounded overflow-hidden flex mb-3">
                <div
                  className="bg-blue-400 h-full"
                  style={{
                    width: teamData.cap.total_comp > 0
                      ? `${(teamData.cap.total_spend / teamData.cap.total_comp) * 100}%`
                      : "0%",
                  }}
                />
                <div
                  className="bg-neutral-500 h-full"
                  style={{
                    width: teamData.cap.total_comp > 0
                      ? `${((teamData.cap.total_spend - teamData.cap.total_cap_hit) / teamData.cap.total_comp) * 100}%`
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

            <h2 className="text-base font-semibold mb-3">Roster</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-neutral-800 bg-neutral-900 rounded">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-200 text-sm">
                    <th className="text-left px-3 py-2.5">Player</th>
                    <th
                      className="text-left px-3 py-2.5 cursor-pointer select-none"
                      onClick={() => {
                        setSortKey("position")
                        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                      }}
                    >
                      Position {sortKey === "position" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      className="text-left px-3 py-2.5 cursor-pointer select-none"
                      onClick={() => {
                        setSortKey("role")
                        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                      }}
                    >
                      Roster Role {sortKey === "role" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      className="text-right px-3 py-2.5 cursor-pointer select-none"
                      onClick={() => {
                        setSortKey("salary")
                        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                      }}
                    >
                      Total Salary {sortKey === "salary" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th className="text-right px-3 py-2.5">Cap Hit</th>
                    <th className="text-left px-3 py-2.5">Contract Through (Option Years)</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedRoster.map((player, idx) => {
                    const hasTransfer = player.transfer_fee > 0 || player.amortized_transfer_fee > 0

                    
                    let rowClass = "border-b border-neutral-700/50 last:border-b-0"
                    if (player.role === "Designated Player") rowClass += " bg-yellow-500/10"
                    else if (player.role === "U22 Initiative") rowClass += " bg-green-500/10"
                    else if (player.role === "TAM Player") rowClass += " bg-red-500/10"
                    else if (player.role === "Supplemental Roster") rowClass += " bg-neutral-800/40"

                    return (
                      <tr key={player.name + idx} className={rowClass}>
                        <td className="px-3 py-2">
                          <div className="flex flex-col gap-2">
                            {/* Name + status badge on same line */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-white">{player.name}</span>
                              <StatusBadge status={player.status} />
                            </div>
                            {/* Transfer fee badges below */}
                            {hasTransfer && (
                              <div className="flex flex-wrap gap-1.5">
                                {player.transfer_fee > 0 && (
                                  <TransferBadge label="Transfer Fee" value={player.transfer_fee} />
                                )}
                                {player.amortized_transfer_fee > 0 && (
                                  <TransferBadge label="Per year" value={player.amortized_transfer_fee} />
                                )}
                                <InfoIcon text="Estimated Transfer Fee payment per year" />
                              </div>
                            )}
                            
                          </div>
                        </td>

                        <td className="px-3 py-2 text-neutral-300">{player.position}</td>

                        <td className="px-3 py-2 text-neutral-300">
                          {player.role ?? "Senior"}
                        </td>

                        <td className="px-3 py-2 text-right">
                          ${player.guaranteed_comp.toLocaleString()}
                        </td>

                        <td className="px-3 py-2 text-right">
                          ${player.cap_hit.toLocaleString()}
                        </td>

                        <td className="px-3 py-2 text-neutral-300">
                          {(() => {
                            const through = player.contract_through
                            const options = player.option_years
                            if (!through) return "-"
                            if (!options || options === 0) return `${through}`
                            if (Array.isArray(options)) return `${through} (${options.join(", ")})`
                            return `${through} (${options})`
                          })()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">

            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded bg-yellow-500/20">
              <div className="flex justify-between items-center mb-2">
                <p className="text-base text-neutral-300 font-semibold flex items-center">
                  Designated Players
                  <InfoIcon text="Star players paid above the normal cap limit with a lowered cap hit of $803,125" />
                </p>
                <p className="text-base font-semibold">
                  {teamData.validation?.summary?.dp_count ?? 0} / {teamData.validation?.summary?.dp_limit ?? 3}
                </p>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded overflow-hidden">
                <div
                  className="h-full bg-yellow-400"
                  style={{
                    width: `${((teamData.validation?.summary?.dp_count ?? 0) / (teamData.validation?.summary?.dp_limit ?? 3)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="border border-neutral-800 p-4 rounded bg-green-500/20">
              <div className="flex justify-between items-center mb-2">
                <p className="text-base text-neutral-300 font-semibold flex items-center">
                  U22 Players
                  <InfoIcon text="A special rule that allows teams to sign players under 22 with a lowered cap hit of $200,000" />
                </p>
                <p className="text-base font-semibold">
                  {teamData.validation?.summary?.u22_count ?? 0} / {teamData.validation?.summary?.u22_limit ?? 3}
                </p>
              </div>
              <div className="w-full h-2 bg-neutral-800 rounded overflow-hidden">
                <div
                  className="h-full bg-green-400"
                  style={{
                    width: `${((teamData.validation?.summary?.u22_count ?? 0) / (teamData.validation?.summary?.u22_limit ?? 3)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-red-500/20 border border-neutral-800 p-4 rounded flex justify-between items-center">
              <p className="text-base text-neutral-300 font-semibold flex items-center">
                TAM Players
                <InfoIcon text="Players whose cap hit is lowered using Targeted Allocation Money (TAM). Each team is given $2,125,000 in TAM every season" />
              </p>
              <p className="text-base font-semibold">{teamData.counts?.tam_players ?? 0}</p>
            </div>

            <SpendBreakdownBar title="Real Spend by Position" data={spendingByLine} total={totalLineSpend} />
            <SpendBreakdownBar title="Real Spend by Mechanism" data={spendingByMechanism} total={totalMechanismSpend} />

            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded flex justify-between items-center">
              <p className="text-base text-neutral-300 font-semibold flex items-center">
                Total Players
                <InfoIcon text="Players currently available to play, not including injured or loaned out players." />
              </p>
              <p className="text-base font-semibold text-right">
                {teamData.cap_breakdown
                  ? teamData.cap_breakdown.filter(
                      (p) => p.status !== "Unavailable – Injured" && p.status !== "Unavailable – On Loan"
                    ).length
                  : 0}
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded flex justify-between items-center">
              <p className="text-base text-neutral-300 font-semibold flex items-center">
                Senior Roster
                <InfoIcon text="Players occupying roster slots 1-20 which count towards the salary budget." />
              </p>
              <p className="text-base font-semibold text-right">{teamData.counts?.senior_players ?? 0}/20</p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded flex justify-between items-center">
              <p className="text-base text-neutral-300 font-semibold flex items-center">
                Supplemental Roster
                <InfoIcon text="Players in roster spots 21-30 whose salaries usually do not count against the cap." />
              </p>
              <p className="text-base font-semibold text-right">{teamData.counts?.supplemental_players ?? 0}</p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded flex justify-between items-center">
              <p className="text-base text-neutral-300 font-semibold">International Slots Used</p>
              <p className="text-base font-semibold text-right">
                {teamData.validation?.summary?.international_slots_used ?? 0}
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded flex justify-between items-center">
              <p className="text-base text-neutral-300 font-semibold flex items-center">
                Remaining GAM
                <InfoIcon text="Extra league funds teams can use to lower cap hits or make trades." />
              </p>
              <p className="text-base font-semibold text-right">
                ${teamData.validation?.summary?.remaining_gam?.toLocaleString?.() ?? 0}
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded flex justify-between items-center">
              <p className="text-base text-neutral-300 font-semibold flex items-center">
                Remaining Cap Space
                <InfoIcon text="An estimate of how much salary cap room the team still has left." />
              </p>
              <p className="text-base font-semibold text-right">
                ${(6425000 - teamData.cap.total_cap_hit + (teamData.validation?.summary?.starting_gam ?? 0) + 2125000 + (teamData.validation?.summary?.gam_balance ?? 0)).toLocaleString()}
              </p>
            </div>

            {!teamData.validation?.is_valid && (
              <div className="bg-red-500/10 border border-red-500/40 p-4 rounded">
                <p className="text-sm font-semibold text-red-400 mb-2">Roster Issues</p>
                <ul className="text-sm text-red-300 list-disc list-inside space-y-1">
                  {teamData.validation?.issues?.map((issue) => (
                    <li key={issue.type}>{issue.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
    
  )
}

export default Team