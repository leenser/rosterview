import TeamCard from "/src/components/TeamCard"
import { useEffect, useState } from "react"
import NavBar from "/src/components/NavBar"
import Footer from "../components/Footer"
import LeagueOverviewSection from "../components/league/LeagueOverviewSection"

const STAT_ITEMS = [
  { label: "MLS Clubs", value: "30", type: "neutral" },
  { label: "Base Cap", value: "$6.425M", type: "neutral" },
  { label: "DP Player Model", value: "3 DPs / 3 U22s", type: "dp" },
  { label: "U22 Initiative Player Model", value: "2 DPs / 4 U22s / +$2M GAM ", type: "u22" },
  { label: "Total TAM", value: "$2.125M", type: "tam" },
  { label: "Senior Slots", value: "1-20", type: "neutral" },
  { label: "Supplemental Slots", value: "21-31", type: "supplemental" },
]

function StatPill({ label, value, type = "neutral" }) {
  const styles = {
    neutral: "border-neutral-700/50",
    dp: "border-yellow-500/40 bg-yellow-500/5",
    u22: "border-green-500/40 bg-green-500/5",
    tam: "border-red-500/40 bg-red-500/5",
    supplemental: "border-neutral-500/40 bg-neutral-800/40",
  }

  const accent = {
    neutral: "bg-neutral-600",
    dp: "bg-yellow-400",
    u22: "bg-green-400",
    tam: "bg-red-400",
    supplemental: "bg-neutral-400",
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 border rounded-full backdrop-blur-sm flex-shrink-0 ${styles[type]}`}>
      <span className="text-sm sm:text-base font-semibold text-white tracking-tight">
        {value}
      </span>
      <span className="text-[10px] sm:text-[11px] text-neutral-400 uppercase tracking-widest leading-tight">
        {label}
      </span>
    </div>
  )
}

function Home() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadTeams() {
      try {
        setLoading(true)
        setError("")
        const res = await fetch("https://rosterview.onrender.com/teams")
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
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
    <div className="min-h-screen bg-neutral-950">
      <NavBar page="Home" />

      {/* Hero */}
      <div className="relative border-b border-neutral-800 overflow-hidden">
        {/* Soccer pitch line art background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.045] pointer-events-none"
          viewBox="0 0 1200 340"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer pitch boundary */}
          <rect x="60" y="20" width="1080" height="300" fill="none" stroke="white" strokeWidth="2" />
          {/* Center line */}
          <line x1="600" y1="20" x2="600" y2="320" stroke="white" strokeWidth="2" />
          {/* Center circle */}
          <circle cx="600" cy="170" r="70" fill="none" stroke="white" strokeWidth="2" />
          {/* Center spot */}
          <circle cx="600" cy="170" r="4" fill="white" />
          {/* Left penalty box */}
          <rect x="60" y="95" width="132" height="150" fill="none" stroke="white" strokeWidth="2" />
          {/* Left goal box */}
          <rect x="60" y="130" width="55" height="80" fill="none" stroke="white" strokeWidth="2" />
          {/* Left penalty spot */}
          <circle cx="170" cy="170" r="3" fill="white" />
          {/* Left penalty arc */}
          <path d="M 162 95 A 70 70 0 0 1 162 245" fill="none" stroke="white" strokeWidth="2" strokeDasharray="8 4" />
          {/* Right penalty box */}
          <rect x="1008" y="95" width="132" height="150" fill="none" stroke="white" strokeWidth="2" />
          {/* Right goal box */}
          <rect x="1085" y="130" width="55" height="80" fill="none" stroke="white" strokeWidth="2" />
          {/* Right penalty spot */}
          <circle cx="1030" cy="170" r="3" fill="white" />
          {/* Right penalty arc */}
          <path d="M 1038 95 A 70 70 0 0 0 1038 245" fill="none" stroke="white" strokeWidth="2" strokeDasharray="8 4" />
          {/* Corner arcs */}
          <path d="M 60 38 A 18 18 0 0 1 78 20" fill="none" stroke="white" strokeWidth="2" />
          <path d="M 1122 20 A 18 18 0 0 1 1140 38" fill="none" stroke="white" strokeWidth="2" />
          <path d="M 60 302 A 18 18 0 0 0 78 320" fill="none" stroke="white" strokeWidth="2" />
          <path d="M 1122 320 A 18 18 0 0 0 1140 302" fill="none" stroke="white" strokeWidth="2" />
        </svg>

        {/* Radial glow from center */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(37,99,235,0.13) 0%, transparent 70%)" }}
        />
        {/* Left blue bleed */}
        <div className="absolute top-0 left-0 w-72 h-full bg-blue-900/10 blur-3xl pointer-events-none" />


        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-10 sm:pb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-neutral-500 uppercase tracking-widest font-medium">
              2026 Season Data
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight sm:leading-none mb-3">
            MLS <span className="text-blue-400">RosterView</span>
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-xl leading-relaxed mb-8 sm:mb-10">
            Explore roster construction, salary cap breakdowns, and spending
            patterns across all 30 Major League Soccer clubs.
          </p>

          <div className="relative overflow-hidden">
            <div
              className="flex gap-2 sm:gap-3 whitespace-nowrap w-max"
              style={{
                animation: "scroll 20s linear infinite",
              }}
            >
              {[...STAT_ITEMS, ...STAT_ITEMS].map((s, i) => (
                <StatPill key={i} label={s.label} value={s.value} type={s.type} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-widest">
              All Clubs
            </h2>
            {!loading && !error && (
              <span className="text-xs text-neutral-600">{teams.length} teams</span>
            )}
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-neutral-500 text-sm">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading teams...
            </div>
          )}

          {!loading && error && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {teams.map((team) => (
                <TeamCard key={team.id} name={team.name} slug={team.id} />
              ))}
            </div>
          )}
        </section>

        <LeagueOverviewSection
          paramKey="leagueTab"
          variant="home"
          title="League Overview"
        />
      </div>
      <Footer />
      <style>
      {`
      @keyframes scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      `}
      </style>
    </div>
    
  )
}

export default Home
