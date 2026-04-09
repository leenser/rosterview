import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SortableTable from "../SortableTable";
import { getTeamSlug } from "../../utils/teamSlug";

export default function SpendingProfiles() {

  const columns = [
    { key: "team", label: "Team" },
    { key: "senior", label: "Base Spend" },
    { key: "dp", label: "DP Spend" },
    { key: "u22", label: "U22 Spend" },
    { key: "supplemental", label: "Supplemental Spend" },
    { key: "total", label: "Total Spend" },
  ];

  const [data, setData] = useState([]);

  const formatMoney = (value) => {
    if (!value) return "$0"
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`
    return `$${value}`
  }

  useEffect(() => {
    fetch("https://rosterview.onrender.com/league/spending")
      .then(res => res.json())
      .then(rows => {
        const normalized = rows.map(r => {
          const slug = getTeamSlug(r.team)

          const teamCell = (
            <Link
              to={`/team/${slug}`}
              className="flex items-center gap-2 hover:underline"
            >
              <img
                src={`/logos/${slug}.png`}
                alt={r.team}
                className="w-5 h-5 object-contain"
              />
              <span>{r.team}</span>
            </Link>
          )

          return {
            team: teamCell,
            senior: formatMoney(r.senior ?? r.budget ?? 0),
            dp: formatMoney(r.dp ?? r.dp_spend ?? 0),
            u22: formatMoney(r.u22 ?? r.u22_spend ?? 0),
            supplemental: formatMoney(r.supplemental ?? r.supplemental_spend ?? 0),
            total: formatMoney(r.total ?? r.total_spend ?? 0)
          }
        })
        setData(normalized)
      })
      .catch(err => console.error("Failed to load league spending", err));
  }, []);

  return (
    <div>


      <SortableTable columns={columns} data={data} />

    </div>
  );
}
