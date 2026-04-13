import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SortableTable from "../SortableTable";
import { getTeamSlug } from "../../utils/teamSlug";

function formatMoney(num) {
  if (!num) return "$0";
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";

  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}k`;
  return `${sign}$${abs}`;
}

export default function CapSpace() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetch("https://rosterview.onrender.com/league/cap-space")
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : data.teams || [];

        const sorted = arr.sort((a, b) =>
          a.team.localeCompare(b.team)
        );

        setTeams(sorted);
      })
      .catch(err => console.error("Failed to load cap space", err));
  }, []);

  const columns = [
    { key: "team", label: "Team" },
    { key: "cap", label: "Cap Space" },
    { key: "gam", label: "GAM Left" },
    { key: "intl", label: "Intl Used" },
    { key: "dp", label: "Open DP" },
    { key: "u22", label: "Open U22" }
  ];

  const tableData = teams.map(team => {
    const slug = getTeamSlug(team.team);

    return {
      team: (
        <Link
          to={`/team/${slug}`}
          className="flex items-center gap-1.5 hover:underline"
        >
          <img
            src={`/logos/${slug}.png`}
            alt={team.team}
            className="h-4 w-4 object-contain"
          />
          {team.team}
        </Link>
      ),
      cap: formatMoney(team.remaining_cap_space),
      cap_sort: team.remaining_cap_space ?? 0,
      gam: formatMoney(team.estimated_gam_left ?? team.remaining_gam ?? 0),
      gam_sort: team.estimated_gam_left ?? team.remaining_gam ?? 0,
      intl: team.international_slots_used ?? 0,
      intl_sort: team.international_slots_used ?? 0,
      dp: Math.max(0, (team.dp_limit || 3) - (team.dp_count || 0)),
      dp_sort: Math.max(0, (team.dp_limit || 3) - (team.dp_count || 0)),
      u22: Math.max(0, (team.u22_limit || 3) - (team.u22_count || 0)),
      u22_sort: Math.max(0, (team.u22_limit || 3) - (team.u22_count || 0))
    };
  });

  return <SortableTable columns={columns} data={tableData} compact />;
}
