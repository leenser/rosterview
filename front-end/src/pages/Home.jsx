import TeamCard from "/src/components/TeamCard"
import { useEffect, useState } from "react"
import NavBar from "/src/components/NavBar"




function Home() {
    const [teams, setTeams] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
    async function loadTeams() {
      try {
        setLoading(true)
        setError("")

        const res = await fetch("http://localhost:8000/teams")
        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`)
        }

        const data = await res.json()
        setTeams(data)
      } catch (err) {
        console.error(err)
        setError("Could not load teams. Check that the backend is running.")
      } finally {
        setLoading(false)
      }
    }

    loadTeams()
    }, [])

  return (
    <div className="min-h-screen">
      <NavBar page="Home" />
      <div className="px-8 py-10">
        <div className="max-w-7xl mx-auto">

          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-white mb-2">
              MLS RosterView
            </h1>
            <p className="text-neutral-400">
              Explore roster construction, salary cap breakdowns, and spending across Major League Soccer clubs.
            </p>
          </div>

          {loading && <p className="text-neutral-300">Loading teams...</p>}
          {!loading && error && <p className="text-red-400">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {teams.map((team) => (
                <TeamCard key={team.id} name={team.name} slug={team.id} />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default Home