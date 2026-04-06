import { useState } from "react";

export default function SortableTable({ columns, data }) {
  const [sortKey, setSortKey] = useState(null);
  const [direction, setDirection] = useState("asc");

  const parseSortableValue = (value) => {
    // React element with data-value prop (e.g. <span data-value={123}>)
    if (value && typeof value === "object" && value.props !== undefined) {
      const dv = value.props["data-value"];
      if (dv !== undefined) return Number(dv);
      // recurse into single child
      if (value.props.children !== undefined) return parseSortableValue(value.props.children);
      return 0;
    }
    if (typeof value === "number") return value;
    if (typeof value !== "string") return 0;
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

  const getSortValue = (row, key) => {
    // Check for a dedicated sort key (e.g. key + "_sort")
    const sortKey_ = key + "_sort";
    if (row[sortKey_] !== undefined) return row[sortKey_];
    return parseSortableValue(row[key]);
  };

  const sortedData = [...(Array.isArray(data) ? data : [])].sort((a, b) => {
    if (!sortKey) return 0;
    const aValue = getSortValue(a, sortKey);
    const bValue = getSortValue(b, sortKey);
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
    <div className="w-full overflow-x-auto rounded-lg border border-neutral-800">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-neutral-900 border-b border-neutral-800">
            {columns.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => handleSort(key)}
                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold text-neutral-400 uppercase tracking-wider select-none hover:text-white transition-colors whitespace-nowrap"
              >
                <span className="flex items-center gap-1.5">
                  {label}
                  <span className="text-neutral-600 w-3">
                    {sortKey === key
                      ? direction === "asc"
                        ? "↑"
                        : "↓"
                      : <span className="opacity-0">↕</span>}
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
              className="border-b border-neutral-800/60 hover:bg-neutral-800/40 transition-colors duration-100"
            >
              {columns.map(({ key }) => (
                <td
                  key={key}
                  className="px-4 py-3 text-sm text-neutral-200 whitespace-nowrap"
                >
                  {row[key]}
                </td>
              ))}
            </tr>
          ))}
          {sortedData.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-neutral-600 text-sm"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}