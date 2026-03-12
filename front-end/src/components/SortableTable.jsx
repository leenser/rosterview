import { useState } from "react";

export default function SortableTable({ columns, data }) {
  const [sortKey, setSortKey] = useState(null);
  const [direction, setDirection] = useState("asc");

  const parseSortableValue = (value) => {
    if (typeof value === "number") return value;
    if (typeof value !== "string") return value;

    const trimmed = value.trim();

    if (trimmed.startsWith("$")) {
      const numeric = parseFloat(trimmed.replace(/[$,]/g, ""));
      if (Number.isNaN(numeric)) return value;

      if (trimmed.endsWith("M")) return numeric * 1000000;
      if (trimmed.endsWith("k")) return numeric * 1000;
      return numeric;
    }

    return trimmed.toLowerCase();
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;

    const aValue = parseSortableValue(a[sortKey]);
    const bValue = parseSortableValue(b[sortKey]);

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;

    return 0;
  });

  const handleSort = (key) => {
    if (key === sortKey) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setDirection("asc");
    }
  };

  return (
    <table className="min-w-full border-collapse border border-gray-800/20 text-base">
      <thead>
        <tr>
          {columns.map(({ key, label }) => (
            <th
              key={key}
              onClick={() => handleSort(key)}
              className="cursor-pointer border border-gray-300 px-4 py-2 text-left"
            >
              <span className="flex items-center gap-1">
                {label}
                <span className="inline-block w-3 text-xs">
                  {sortKey === key ? (direction === "asc" ? "▲" : "▼") : ""}
                </span>
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, idx) => (
          <tr
            key={idx}
            className={idx % 2 === 0 ? "bg-gray" : "bg-gray-800"}
          >
            {columns.map(({ key }) => (
              <td key={key} className="border border-gray-300 px-4 py-4 text-base">
                {row[key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}