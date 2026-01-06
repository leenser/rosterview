import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"

function Team() {
  const { slug } = useParams()

  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sortDir, setSortDir] = useState("desc")

  const sortedRoster = teamData && teamData.cap_breakdown
  ? [...teamData.cap_breakdown].sort((a, b) =>
      sortDir === "desc"
        ? b.base_salary - a.base_salary
        : a.base_salary - b.base_salary
    )
  : []

  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true)
        setError("")

        const res = await fetch(`http://localhost:8000/team/${slug}`)
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`)
        }

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

  if (loading) {
    return (
      <div className="min-h-screen px-8 py-6 text-neutral-300">
        Loading team...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen px-8 py-6 text-red-400">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen px-8 py-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 flex-shrink-0">
          <img
            src={`/logos/${slug}.png`}
            alt={teamData.team}
            className="w-full h-full object-contain"
          />
        </div>

        <div>
          <h1 className="text-3xl font-semibold leading-tight">
            {teamData.team}
          </h1>
          <p className="text-sm text-neutral-400">
            Roster Model: {teamData.roster_model}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* MAIN CONTENT */}
        <div className="lg:col-span-3">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded">
              <p className="text-sm text-neutral-400">Total base salary</p>
              <p className="text-lg font-semibold">
                ${teamData.cap.total_base_salary.toLocaleString()}
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded">
              <p className="text-sm text-neutral-400">Total cap hit</p>
              <p className="text-lg font-semibold">
                ${teamData.cap.total_cap_hit.toLocaleString()}
              </p>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">
            Roster
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-neutral-800 bg-neutral-900 rounded">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 text-sm">
                  <th className="text-left px-4 py-3">Player</th>
                  <th className="text-left px-4 py-3">Position</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th
                    className="text-right px-4 py-3 cursor-pointer select-none"
                    onClick={() => setSortDir(d => (d === "desc" ? "asc" : "desc"))}
                  >
                    Base Salary {sortDir === "desc" ? "↓" : "↑"}
                  </th>
                  <th className="text-left px-4 py-3">Roster Role</th>
                </tr>
              </thead>

              <tbody>
                {sortedRoster.map(player => {
                  let rowClass = "border-b border-neutral-800 last:border-b-0"

                  if (player.role === "Designated Player") {
                    rowClass += " bg-yellow-500/10"
                  } else if (player.role === "U22 Initiative") {
                    rowClass += " bg-green-500/10"
                  } else if (player.role === "TAM Player") {
                    rowClass += " bg-red-500/10"
                  } else if (player.role === "Supplemental Roster") {
                    rowClass += " bg-neutral-800/40"
                  }

                  return (
                    <tr key={player.name} className={rowClass}>
                      <td className="px-4 py-3">{player.name}</td>
                      <td className="px-4 py-3 text-neutral-300">{player.position}</td>
                      <td className="px-4 py-3 text-neutral-300">
                        {player.status ?? "Active"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        ${player.base_salary.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-neutral-300">
                        {player.role ?? "Senior"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-1 space-y-4">

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded">
            <p className="text-sm text-neutral-400">Total Players</p>
            <p className="text-lg font-semibold">
              {teamData.cap_breakdown ? teamData.cap_breakdown.length : 0}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded">
            <p className="text-sm text-neutral-400">Supplemental Roster</p>
            <p className="text-lg font-semibold">
              {teamData.cap_breakdown
                ? teamData.cap_breakdown.filter(p => p.role === "Supplemental Roster").length
                : 0}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded">
            <p className="text-sm text-neutral-400">Designated Players</p>
            <p className="text-lg font-semibold">
              {teamData.validation.summary.dp_count} / {teamData.validation.summary.dp_limit}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded">
            <p className="text-sm text-neutral-400">U22 Players</p>
            <p className="text-lg font-semibold">
              {teamData.validation.summary.u22_count} / {teamData.validation.summary.u22_limit}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded">
            <p className="text-sm text-neutral-400">International Slots Used</p>
            <p className="text-lg font-semibold">
              {teamData.validation.summary.international_slots_used}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded">
            <p className="text-sm text-neutral-400">Remaining TAM</p>
            <p className="text-lg font-semibold">
              ${teamData.validation.summary.tam_remaining.toLocaleString()}
            </p>
          </div>

          {!teamData.validation.is_valid && (
            <div className="bg-red-500/10 border border-red-500/40 p-4 rounded">
              <p className="text-sm font-semibold text-red-400 mb-2">
                Roster Issues
              </p>
              <ul className="text-sm text-red-300 list-disc list-inside space-y-1">
                {teamData.validation.issues.map(issue => (
                  <li key={issue.type}>{issue.message}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}

export default Team