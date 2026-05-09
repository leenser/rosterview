import { useState } from "react";

export default function SortableTable({ columns, data, compact = false }) {
  const [sortKey, setSortKey] = useState(null);
  const [direction, setDirection] = useState("asc");
  const rowCount = Array.isArray(data) ? data.length : 0;
  const tableSizeClasses = compact
    ? {
        shell: "rounded-2xl",
        headerWrap: "px-3.5 py-3 sm:px-4.5",
        countPill: "px-2.5 py-1 text-sm",
        table: "text-base",
        th: "px-2.5 py-2.5 text-xs tracking-[0.16em] first:pl-4 last:pr-4",
        td: "px-2.5 py-3 text-base first:pl-4 last:pr-4",
      }
    : {
        shell: "rounded-3xl",
        headerWrap: "px-4 py-3 sm:px-5",
        countPill: "px-3 py-1 text-sm",
        table: "text-base",
        th: "px-4 py-3.5 text-xs tracking-[0.2em] first:pl-5 last:pr-5",
        td: "px-4 py-4 text-base first:pl-5 last:pr-5",
      };

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
    <div className={`overflow-hidden border border-white/10 bg-neutral-950/70 shadow-[0_24px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/5 backdrop-blur-xl ${tableSizeClasses.shell}`}>
      <div className={`flex items-center justify-between border-b border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] ${tableSizeClasses.headerWrap}`}>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
            League Table
          </p>
          <p className={`${compact ? "mt-0.5 text-sm" : "mt-1 text-base"} text-neutral-300`}>
            Click any header to sort the table.
          </p>
        </div>
        <div className={`rounded-full border border-white/10 bg-white/5 font-medium text-neutral-300 ${tableSizeClasses.countPill}`}>
          {rowCount} clubs
        </div>
      </div>

      <div className="w-full overflow-x-auto">
      <table className={`min-w-full border-separate border-spacing-0 ${tableSizeClasses.table}`}>
        <thead>
          <tr className="bg-neutral-900/95">
            {columns.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => handleSort(key)}
                className={`sticky top-0 z-10 cursor-pointer border-b border-white/8 bg-neutral-950/90 text-left font-semibold uppercase text-neutral-500 select-none backdrop-blur-md transition-colors hover:text-white whitespace-nowrap ${tableSizeClasses.th}`}
              >
                <span className="flex items-center gap-1.5">
                  {label}
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/6 bg-white/4 text-neutral-400">
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
              className={`transition-all duration-150 hover:-translate-y-px hover:bg-white/[0.06] ${
                idx % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
              }`}
            >
              {columns.map(({ key }) => (
                <td
                  key={key}
                  className={`border-b border-white/6 text-neutral-200 whitespace-nowrap ${tableSizeClasses.td}`}
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
                className="px-4 py-14 text-center text-base text-neutral-500"
              >
                No data available yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
