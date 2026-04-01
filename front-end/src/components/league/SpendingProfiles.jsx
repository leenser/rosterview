import { useEffect, useState } from "react";
import SortableTable from "../SortableTable";

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
    fetch("http://localhost:8000/league/spending")
      .then(res => res.json())
      .then(rows => {
        const normalized = rows.map(r => {
          let slug = r.team
            .toLowerCase()
            .replace(/\./g, "")
            .replace(/ /g, "-")

          // Handle special logo filenames
          if (slug === "dc-united") slug = "d-c-united"
          if (slug === "st-louis-city-sc") slug = "st-louis-city-sc"

          const teamCell = (
            <a
              href={`/team/${slug}`}
              className="flex items-center gap-2 hover:underline"
            >
              <img
                src={`/logos/${slug}.png`}
                alt={r.team}
                className="w-5 h-5 object-contain"
              />
              <span>{r.team}</span>
            </a>
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