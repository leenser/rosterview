import { useEffect, useState } from "react";
import SortableTable from "../SortableTable";

export default function GAMTable() {

  const columns = [
    { key: "team", label: "Team" },
    { key: "start", label: "GAM Start of Year" },
    { key: "release", label: "GAM Last Release" },
    { key: "estimated", label: "Estimated GAM Spend since last release" },
    { key: "net", label: "Net GAM Spend" }
  ];

  function formatMoney(num) {
    if (num === 0) return "$0"
    const sign = num < 0 ? "-" : ""
    const abs = Math.abs(num)
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
    if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000)}k`
    return `${sign}$${abs}`
  }

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("https://rosterview.onrender.com/league/gam")
      .then(res => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        return res.json()
      })
      .then(rows => {
        if (!Array.isArray(rows)) {
          console.error("Expected array, got:", rows)
          setData([])
          return
        }

        const normalized = rows.map(r => {
          const teamName = r.team;

          let slug = teamName
            .toLowerCase()
            .replace(/\./g, "")
            .replace(/ /g, "-");

          if (slug === "dc-united") slug = "d-c-united";

          const teamCell = (
            <a href={`/team/${slug}`} className="flex items-center gap-2 hover:underline">
              <img src={`/logos/${slug}.png`} alt={teamName} className="w-5 h-5 object-contain" />
              <span>{teamName}</span>
            </a>
          );

          const start = r.start ?? r.starting_gam ?? 0;
          const release = r.release ?? r.remaining_gam ?? 0;
          const estimated = r.estimated ?? r.gam_balance ?? 0;
          const netValue = release + estimated;

          const netDisplay = (
            <span data-value={netValue}>
              {netValue > 0 ? (
                <span className="text-red-400 font-medium">-{formatMoney(Math.abs(netValue))}</span>
              ) : netValue < 0 ? (
                <span className="text-green-400 font-medium">+{formatMoney(Math.abs(netValue))}</span>
              ) : (
                <span>$0</span>
              )}
            </span>
          );

          return {
            team: teamCell,
            team_sort: teamName,
            start: <span>{formatMoney(start)}</span>,
            start_sort: start,
            release: <span>{formatMoney(release)}</span>,
            release_sort: release,
            estimated: <span>{formatMoney(estimated)}</span>,
            estimated_sort: estimated,
            net: netDisplay,
            net_sort: netValue,
          };
        });

        setData(normalized);
      })
      .catch(err => {
        console.error("Failed to load league GAM data", err)
        setError("Could not load GAM data.")
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-neutral-400 text-sm">Loading...</p>
  if (error) return <p className="text-red-400 text-sm">{error}</p>

  return (
    <div>
      <SortableTable columns={columns} data={data} />
    </div>
  );
}