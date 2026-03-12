import { useState } from "react"
import { Link } from "react-router-dom"

const teamColors = {
  "atlanta-united": "#a50044",
  "austin-fc": "#00b140",
  "cf-montreal": "#002a6aff",
  "charlotte-fc": "#1a85c8",
  "chicago-fire-fc": "#8a1538",
  "colorado-rapids": "#862633",
  "columbus-crew": "#fdb913",
  "d-c-united": "#ef3e42",
  "fc-cincinnati": "#f05323",
  "fc-dallas": "#c8102e",
  "houston-dynamo-fc": "#f97316",
  "inter-miami-cf": "#f7b5cd",
  "la-galaxy": "#ffd100",
  "los-angeles-fc": "#c9a227",
  "minnesota-united-fc": "#8c92ac",
  "nashville-sc": "#ece83a",
  "new-england-revolution": "#0049a3ff",
  "new-york-city-fc": "#6cadde",
  "new-york-red-bulls": "#d50032",
  "orlando-city-sc": "#633492",
  "philadelphia-union": "#b1872e",
  "portland-timbers": "#004812",
  "real-salt-lake": "#a6192e",
  "san-diego-fc": "#00a3e0",
  "san-jose-earthquakes": "#0066b3",
  "seattle-sounders-fc": "#5d9732",
  "sporting-kansas-city": "#93b1d7",
  "st-louis-city-sc": "#ed174c",
  "toronto-fc": "#a6192e",
  "vancouver-whitecaps-fc": "#0041baff"
}

function TeamCard({ name, slug }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    
    <Link to={`/team/${slug}`}>
        <div
          className="group bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 transition-all duration-200 flex flex-col items-center justify-center gap-4 p-6 rounded-xl shadow-sm"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            boxShadow: isHovered ? `0 0 22px ${teamColors[slug] || "#6366f1"}` : "none"
          }}
        >

          <div className="w-16 h-16 flex-shrink-0">
            <img
              src={`/logos/${slug}.png`}
              alt={name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
            />
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-lg font-semibold text-neutral-200 leading-tight min-h-[3rem] flex items-center justify-center">
              <span className="line-clamp-2">
                {name}
              </span>
            </p>

            <span className="text-sm text-neutral-500 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
              View roster →
            </span>
          </div>

        </div>
    </Link>
    
  )
}

export default TeamCard