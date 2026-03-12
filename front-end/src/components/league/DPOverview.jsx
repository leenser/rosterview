import { useEffect, useState } from "react";

export default function DPOverview() {

  const [dpData, setDpData] = useState([]);
  const [u22Data, setU22Data] = useState([]);

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

    fetch("http://localhost:8000/league/dps")
      .then(res => res.json())
      .then(rows => {
        const rowsArray = Array.isArray(rows) ? rows : rows.teams || rows.data || [];
        setDpData(rowsArray);
      })
      .catch(err => console.error("Failed to load DP overview", err));

    fetch("http://localhost:8000/league/u22")
      .then(res => res.json())
      .then(rows => {
        const rowsArray = Array.isArray(rows) ? rows : rows.teams || rows.data || [];
        setU22Data(rowsArray);
      })
      .catch(err => console.error("Failed to load U22 overview", err));

  }, []);

  const renderTable = (title, rows) => (
    <div className="mb-10">

      <h2 className="text-xl font-semibold mb-4">
        {title}
      </h2>

      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#111827]">

        <table className="w-full border-collapse text-base">

          <thead>
            <tr className="border-b border-gray-800">
              <th className="py-3 px-4 text-left">Team / Player</th>
              <th className="py-3 px-4 text-left">Position</th>
              <th className="py-3 px-4 text-right">Spend</th>
            </tr>
          </thead>

          <tbody>

            {rows.map((team, i) => {

              const slug = getSlug(team.team);

              return (
                <>
                  <tr
                    key={`team-${i}`}
                    className="border-b border-gray-900 bg-gray-800/40"
                  >
                    <td className="py-3 px-4 font-medium">
                      <a
                        href={`/team/${slug}`}
                        className="flex items-center gap-2 hover:underline"
                      >
                        <img
                          src={`/logos/${slug}.png`}
                          alt={team.team}
                          className="w-5 h-5 object-contain"
                        />
                        {team.team}
                      </a>
                    </td>
                    <td></td>
                    <td></td>
                  </tr>

                  {(team.players || []).map((p, j) => (
                    <tr
                      key={`player-${i}-${j}`}
                      className="border-b border-gray-900 hover:bg-gray-800/60"
                    >
                      <td className="py-2 px-8 text-gray-300">
                        {p.name}
                      </td>
                      <td className="py-2 px-4 text-gray-300">
                        {p.position}
                      </td>
                      <td className="py-2 px-4 text-right">
                        {formatMoney(p.spend)}
                      </td>
                    </tr>
                  ))}

                </>
              );

            })}

          </tbody>

        </table>

      </div>

    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      {renderTable("Designated Players", dpData)}

      {renderTable("U22 Initiative Players", u22Data)}

    </div>
  );
}