import { useEffect, useState } from "react";
import SortableTable from "../SortableTable";

export default function GAMTable() {

  const columns = [
    { key: "team", label: "Team" },
    { key: "start", label: "GAM Start of Year" },
    { key: "release", label: "GAM Last Release" },
    { key: "net", label: "Net GAM Spend" },
  ];

  const formatMoney = (value) => {
    if (!value) return "$0";
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/league/gam")
      .then(res => res.json())
      .then(rows => {

        const normalized = rows.map(r => {

          const teamName = r.team;

          let slug = teamName
            .toLowerCase()
            .replace(/\./g, "")
            .replace(/ /g, "-");

          if (slug === "dc-united") slug = "d-c-united";
          if (slug === "st-louis-city-sc") slug = "st-louis-city-sc";

          const teamCell = (
            <a
              href={`/team/${slug}`}
              className="flex items-center gap-2 hover:underline"
            >
              <img
                src={`/logos/${slug}.png`}
                alt={teamName}
                className="w-5 h-5 object-contain"
              />
              <span>{teamName}</span>
            </a>
          );

          const start = r.start ?? r.starting_gam ?? 0;
          const release = r.release ?? r.remaining_gam ?? 0;

          const netValue = start - release;

          let netDisplay;
          if (netValue > 0) {
            // Team spent GAM
            netDisplay = (
              <span className="text-red-400 font-medium">
                -{formatMoney(Math.abs(netValue))}
              </span>
            );
          } else if (netValue < 0) {
            // Team gained GAM
            netDisplay = (
              <span className="text-green-400 font-medium">
                +{formatMoney(Math.abs(netValue))}
              </span>
            );
          } else {
            netDisplay = <span>$0</span>;
          }

          return {
            team: teamCell,
            start: formatMoney(start),
            release: formatMoney(release),
            net: netDisplay,
          };
        });

        setData(normalized);
      })
      .catch(err => console.error("Failed to load league GAM data", err));
  }, []);

  return (
    <div>

      <h2 className="text-xl font-semibold mb-4">
        GAM Usage
      </h2>

      <SortableTable columns={columns} data={data} />

    </div>
  );
}