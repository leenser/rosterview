import { useEffect, useState } from "react";

export default function DPOverview() {

  const [teamData, setTeamData] = useState([]);

  const formatMoney = (value) => {
    if (!value) return "$0";
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  const getSlug = (teamName) => {
    let slug = teamName
      .toLowerCase()
      .replace(/\./g, "")
      .replace(/ /g, "-");

    if (slug === "dc-united") slug = "d-c-united";
    if (slug === "st-louis-city-sc") slug = "st-louis-city-sc";

    return slug;
  };

  useEffect(() => {
    Promise.all([
      fetch("https://rosterview.onrender.com/league/dps").then(res => res.json()),
      fetch("https://rosterview.onrender.com/league/u22").then(res => res.json())
    ])
      .then(([dpRows, u22Rows]) => {
        const dpArray = Array.isArray(dpRows) ? dpRows : dpRows.teams || dpRows.data || [];
        const u22Array = Array.isArray(u22Rows) ? u22Rows : u22Rows.teams || u22Rows.data || [];

        const map = {};

        dpArray.forEach(team => {
          map[team.team] = {
            team: team.team,
            dps: team.players || [],
            u22s: []
          };
        });

        u22Array.forEach(team => {
          if (!map[team.team]) {
            map[team.team] = {
              team: team.team,
              dps: [],
              u22s: team.players || []
            };
          } else {
            map[team.team].u22s = team.players || [];
          }
        });

        const combined = Object.values(map).sort((a, b) =>
          a.team.localeCompare(b.team)
        );

        setTeamData(combined);
      })
      .catch(err => console.error("Failed to load DP/U22 overview", err));
  }, []);

  return (
    <div className="space-y-6">

      {teamData.map((team, i) => {
        const slug = getSlug(team.team);

        return (
          <div key={i} className="border border-gray-800 rounded-xl overflow-hidden bg-[#111827]">

            {/* Team Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-800/40">
              <img
                src={`/logos/${slug}.png`}
                alt={team.team}
                className="w-5 h-5 object-contain"
              />
              <a href={`/team/${slug}`} className="font-medium hover:underline">
                {team.team}
              </a>
            </div>

            <div className="grid grid-cols-2">

              {/* DP Column */}
              <div className="border-r border-gray-800">
                <div className="px-4 py-2 text-sm text-yellow-400 font-semibold border-b border-gray-800">
                  Designated Players
                </div>

                {(team.dps || []).map((p, j) => (
                  <div key={j} className="flex justify-between px-4 py-2 text-sm border-b border-gray-900">
                    <span className="text-gray-300">{p.name}</span>
                    <span className="text-gray-400">{formatMoney(p.spend)}</span>
                  </div>
                ))}

                {team.dps.length === 0 && (
                  <div className="px-4 py-2 text-sm text-gray-500">None</div>
                )}
              </div>

              {/* U22 Column */}
              <div>
                <div className="px-4 py-2 text-sm text-green-400 font-semibold border-b border-gray-800">
                  U22 Players
                </div>

                {(team.u22s || []).map((p, j) => (
                  <div key={j} className="flex justify-between px-4 py-2 text-sm border-b border-gray-900">
                    <span className="text-gray-300">{p.name}</span>
                    <span className="text-gray-400">{formatMoney(p.spend)}</span>
                  </div>
                ))}

                {team.u22s.length === 0 && (
                  <div className="px-4 py-2 text-sm text-gray-500">None</div>
                )}
              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
}