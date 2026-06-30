import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeamSlug } from "../../utils/teamSlug";

export default function DPOverview() {

  const [teamData, setTeamData] = useState([]);

  const formatMoney = (value) => {
    if (!value) return "$0";
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  const StatusBadge = ({ status }) => {
    if (status === "Unavailable – On Loan") {
      return <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Loaned Out</span>;
    }
    if (status === "Loan Player") {
      return <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">Loaned In</span>;
    }
    if (status === "Unavailable – SEI") {
      return <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">SEI</span>;
    }
    if (status === "Unavailable – Injured List") {
      return <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">Injured</span>;
    }
    if (status === "Unavailable – Off Roster") {
      return <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-500/20 text-red-300 border border-red-500/30">Off Roster</span>;
    }
    return null;
  };

  const EstimatedSpend = ({ spend, estimated }) => (
    <span className="text-gray-400 whitespace-nowrap" title={estimated ? "Estimated salary" : undefined}>
      {formatMoney(spend)}{estimated ? "*" : ""}
    </span>
  );

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
            roster_model: team.roster_model,
            dp_limit: team.dp_limit,
            dp_count: team.dp_count,
            u22_limit: team.u22_limit,
            u22_count: team.u22_count,
            dps: team.players || [],
            u22s: []
          };
        });

        u22Array.forEach(team => {
          if (!map[team.team]) {
            map[team.team] = {
              team: team.team,
              roster_model: team.roster_model,
              dp_limit: team.dp_limit,
              dp_count: team.dp_count,
              u22_limit: team.u22_limit,
              u22_count: team.u22_count,
              dps: [],
              u22s: team.players || []
            };
          } else {
            map[team.team].roster_model = map[team.team].roster_model || team.roster_model;
            map[team.team].dp_limit = map[team.team].dp_limit ?? team.dp_limit;
            map[team.team].dp_count = map[team.team].dp_count ?? team.dp_count;
            map[team.team].u22_limit = map[team.team].u22_limit ?? team.u22_limit;
            map[team.team].u22_count = map[team.team].u22_count ?? team.u22_count;
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
        const slug = getTeamSlug(team.team);
        const rosterModel = team.roster_model ?? "";
        const normalizedModel = rosterModel.toLowerCase();
        const isU22Model =
          normalizedModel.includes("u22") ||
          (team.dp_limit === 2 && team.u22_limit === 4);
        const headerClass = isU22Model
          ? "border-green-500/25 bg-green-500/12"
          : "border-yellow-500/25 bg-yellow-500/12";
        const modelTextClass = isU22Model ? "text-green-500" : "text-yellow-500";
        const openDpSlots = Math.max(0, (team.dp_limit ?? 3) - (team.dp_count ?? 0));
        const openU22Slots = Math.max(0, (team.u22_limit ?? 3) - (team.u22_count ?? 0));
        const displayModel = rosterModel || (isU22Model ? "U22 Initiative Player Model" : "Designated Player Model");

        return (
          <div key={i} className="border border-gray-800 rounded-xl overflow-hidden bg-[#111827]">

            {/* Team Header */}
            <div className={`px-4 py-3 border-b border-gray-800 ${headerClass}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <img
                      src={`/logos/${slug}.png`}
                      alt={team.team}
                      className="w-5 h-5 object-contain"
                    />
                    <Link to={`/team/${slug}`} className="font-medium hover:underline">
                      {team.team}
                    </Link>
                    <span className={`text-sm font-medium ${modelTextClass}`}>{displayModel}</span>
                  </div>
                </div>

                <div className="text-right text-sm leading-relaxed text-neutral-300">
                  <div>Open DP Slots: {openDpSlots} Open U22 Slots: {openU22Slots}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2">

              {/* DP Column */}
              <div className="border-r border-gray-800">
                <div className="px-4 py-2.5 text-base text-yellow-400 font-semibold border-b border-gray-800">
                  Designated Players
                </div>

                {(team.dps || []).map((p, j) => (
                  <div key={j} className="flex items-center justify-between gap-3 px-4 py-2.5 text-base border-b border-gray-900">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-gray-300">{p.name}</span>
                      {p.status && <StatusBadge status={p.status} />}
                      {p.dp_buydown_eligible && (
                        <span
                          className="text-[10px] px-2 py-0.5 rounded bg-yellow-300/10 text-yellow-100 border border-yellow-300/30"
                          title="Eligible to be bought down with allocation money"
                        >
                          Buy-down
                        </span>
                      )}
                    </div>
                    <EstimatedSpend spend={p.spend} estimated={p.salary_estimated} />
                  </div>
                ))}

                {team.dps.length === 0 && (
                  <div className="px-4 py-2.5 text-base text-gray-500">None</div>
                )}
              </div>

              {/* U22 Column */}
              <div>
                <div className="px-4 py-2.5 text-base text-green-400 font-semibold border-b border-gray-800">
                  U22 Players
                </div>

                {(team.u22s || []).map((p, j) => (
                  <div key={j} className="flex items-center justify-between gap-3 px-4 py-2.5 text-base border-b border-gray-900">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-gray-300">{p.name}</span>
                      {p.status && <StatusBadge status={p.status} />}
                    </div>
                    <EstimatedSpend spend={p.spend} estimated={p.salary_estimated} />
                  </div>
                ))}

                {team.u22s.length === 0 && (
                  <div className="px-4 py-2.5 text-base text-gray-500">None</div>
                )}
              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
}
