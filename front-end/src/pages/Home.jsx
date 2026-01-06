import TeamCard from "/src/components/TeamCard"
import { useEffect, useState } from "react"




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
    <div className="min-h-screen px-8 py-6">
      <h1 className="text-2xl font-semibold mb-6">MLS Teams</h1>

      {loading && <p className="text-neutral-300">Loading teams...</p>}
      {!loading && error && <p className="text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {teams.map(team => (
            <TeamCard key={team.id} name={team.name} slug={team.id} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Home

const teams = [
  { name: "Atlanta United", slug: "atlanta-united" },
  { name: "Austin FC", slug: "austin-fc" },
  { name: "CF Montreal", slug: "cf-montreal" },
  { name: "Charlotte FC", slug: "charlotte-fc" },
  { name: "Chicago Fire FC", slug: "chicago-fire-fc" },
  { name: "Colorado Rapids", slug: "colorado-rapids" },
  { name: "Columbus Crew", slug: "columbus-crew" },
  { name: "D.C. United", slug: "d-c-united" },
  { name: "FC Cincinnati", slug: "fc-cincinnati" },
  { name: "FC Dallas", slug: "fc-dallas" },
  { name: "Houston Dynamo FC", slug: "houston-dynamo-fc" },
  { name: "Inter Miami CF", slug: "inter-miami-cf" },
  { name: "LA Galaxy", slug: "la-galaxy" },
  { name: "Los Angeles FC", slug: "los-angeles-fc" },
  { name: "Minnesota United FC", slug: "minnesota-united-fc" },
  { name: "Nashville SC", slug: "nashville-sc" },
  { name: "New England Revolution", slug: "new-england-revolution" },
  { name: "New York City FC", slug: "new-york-city-fc" },
  { name: "New York Red Bulls", slug: "new-york-red-bulls" },
  { name: "Orlando City SC", slug: "orlando-city-sc" },
  { name: "Philadelphia Union", slug: "philadelphia-union" },
  { name: "Portland Timbers", slug: "portland-timbers" },
  { name: "Real Salt Lake", slug: "real-salt-lake" },
  { name: "San Diego FC", slug: "san-diego-fc" },
  { name: "San Jose Earthquakes", slug: "san-jose-earthquakes" },
  { name: "Seattle Sounders FC", slug: "seattle-sounders-fc" },
  { name: "Sporting Kansas City", slug: "sporting-kansas-city" },
  { name: "St. Louis CITY SC", slug: "st-louis-city-sc" },
  { name: "Toronto FC", slug: "toronto-fc" },
  { name: "Vancouver Whitecaps FC", slug: "vancouver-whitecaps-fc" },
]