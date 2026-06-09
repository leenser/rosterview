import { forwardRef } from "react"

const CURRENT_SEASON = 2026

const ROLE_ORDER = {
  "Designated Player": 7,
  "U22 Initiative": 6,
  "TAM Player": 5,
  Senior: 4,
  "Supplemental Roster": 2,
  "Homegrown Player": 1,
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") return 0
  const numeric = Number(String(value).replace(/[$,]/g, "").trim())
  return Number.isFinite(numeric) ? numeric : 0
}

function formatMoney(value) {
  const amount = normalizeNumber(value)
  return `$${amount.toLocaleString()}`
}

function abbrevRole(role) {
  switch (role) {
    case "Designated Player":
      return "DP"
    case "U22 Initiative":
      return "U22"
    case "TAM Player":
      return "TAM"
    case "Supplemental Roster":
      return "SUP"
    case "Homegrown Player":
      return "HG"
    default:
      return "SR"
  }
}

function sortRoster(players) {
  return [...players].sort((a, b) => {
    const roleDiff = (ROLE_ORDER[b.role] ?? 3) - (ROLE_ORDER[a.role] ?? 3)
    if (roleDiff !== 0) return roleDiff
    return normalizeNumber(b.guaranteed_comp) - normalizeNumber(a.guaranteed_comp)
  })
}

function getRowStyle(role) {
  if (role === "Designated Player") return { backgroundColor: "#fef9c3" }
  if (role === "U22 Initiative") return { backgroundColor: "#dcfce7" }
  if (role === "TAM Player") return { backgroundColor: "#fee2e2" }
  if (role === "Supplemental Roster") return { backgroundColor: "#f3f4f6" }
  return { backgroundColor: "#ffffff" }
}

function RosterTable({ title, headerColor, players }) {
  const columns = [
    { key: "name", label: "Name", align: "left" },
    { key: "position", label: "Pos", align: "left" },
    { key: "role", label: "Desig.", align: "left" },
    { key: "transfer_fee", label: "Transfer Fee", align: "right" },
    { key: "amortized_transfer_fee", label: "Amort. $/yr", align: "right" },
    { key: "guaranteed_comp", label: "Total Comp", align: "right" },
    { key: "cap_hit", label: "Cap Hit", align: "right" },
  ]

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          backgroundColor: headerColor,
          color: "#1e293b",
          fontWeight: 700,
          fontSize: 13,
          padding: "6px 10px",
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        }}
      >
        {title}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr style={{ backgroundColor: "#e2e8f0" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: col.align,
                  padding: "5px 8px",
                  fontWeight: 600,
                  borderBottom: "1px solid #cbd5e1",
                  whiteSpace: "nowrap",
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((player, idx) => (
            <tr key={player.local_id ?? `${player.name}-${idx}`} style={getRowStyle(player.role)}>
              <td style={{ padding: "4px 8px", fontWeight: 500 }}>{player.name || "—"}</td>
              <td style={{ padding: "4px 8px" }}>{player.position || "—"}</td>
              <td style={{ padding: "4px 8px" }}>{abbrevRole(player.role)}</td>
              <td style={{ padding: "4px 8px", textAlign: "right" }}>
                {normalizeNumber(player.transfer_fee) > 0 ? formatMoney(player.transfer_fee) : "—"}
              </td>
              <td style={{ padding: "4px 8px", textAlign: "right" }}>
                {normalizeNumber(player.amortized_transfer_fee) > 0
                  ? formatMoney(player.amortized_transfer_fee)
                  : "—"}
              </td>
              <td style={{ padding: "4px 8px", textAlign: "right", fontWeight: 500 }}>
                {formatMoney(player.guaranteed_comp)}
              </td>
              <td style={{ padding: "4px 8px", textAlign: "right", fontWeight: 600 }}>
                {formatMoney(player.cap_hit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SidebarStat({ label, value, highlight }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 10px",
        backgroundColor: highlight ?? "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        fontSize: 11,
      }}
    >
      <span style={{ color: "#475569", fontWeight: 500 }}>{label}</span>
      <span style={{ color: "#0f172a", fontWeight: 700 }}>{value}</span>
    </div>
  )
}

function PlayerList({ title, headerColor, names }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div
        style={{
          backgroundColor: headerColor,
          color: "#1e293b",
          fontWeight: 700,
          fontSize: 12,
          padding: "5px 10px",
          textAlign: "center",
        }}
      >
        {title}
      </div>
      <div style={{ border: "1px solid #e2e8f0", borderTop: "none" }}>
        {names.length === 0 ? (
          <div style={{ padding: "8px 10px", fontSize: 11, color: "#94a3b8", textAlign: "center" }}>None</div>
        ) : (
          names.map((name) => (
            <div
              key={name}
              style={{
                padding: "5px 10px",
                fontSize: 11,
                borderBottom: "1px solid #f1f5f9",
                color: "#1e293b",
              }}
            >
              {name}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

const GMExportCard = forwardRef(function GMExportCard(
  {
    teamName,
    teamSlug,
    rosterModel,
    capBreakdown,
    cap,
    validation,
    counts,
    spendingByLine,
    spendingByMechanism,
    totalLineSpend,
    totalMechanismSpend,
    estimatedGamLeft,
    remainingCapSpace,
    activePlayerCount,
  },
  ref
) {
  const seniorRoster = sortRoster(
    capBreakdown.filter((player) => player.role !== "Supplemental Roster")
  )
  const supplementalRoster = sortRoster(
    capBreakdown.filter((player) => player.role === "Supplemental Roster")
  )

  const dpNames = capBreakdown
    .filter((player) => player.role === "Designated Player")
    .map((player) => player.name)
    .filter(Boolean)

  const u22Names = capBreakdown
    .filter((player) => player.role === "U22 Initiative")
    .map((player) => player.name)
    .filter(Boolean)

  const capRemainingColor =
    normalizeNumber(remainingCapSpace) >= 0 ? "#dcfce7" : "#fee2e2"

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        width: 1100,
        backgroundColor: "#ffffff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#0f172a",
        padding: 20,
        gap: 20,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 12 }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            {CURRENT_SEASON} {teamName} — GM Roster
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#64748b" }}>
            Roster Model: {rosterModel} · Simulated in RosterView GM Mode
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 16,
            padding: "8px 12px",
            backgroundColor: "#f1f5f9",
            borderRadius: 4,
            fontSize: 11,
          }}
        >
          <div>
            <span style={{ color: "#64748b" }}>Total Comp: </span>
            <span style={{ fontWeight: 700 }}>{formatMoney(cap.total_comp)}</span>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>Cap Hit: </span>
            <span style={{ fontWeight: 700 }}>{formatMoney(cap.total_cap_hit)}</span>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>Off-Budget: </span>
            <span style={{ fontWeight: 700 }}>
              {formatMoney(cap.total_comp - cap.total_cap_hit)}
            </span>
          </div>
        </div>

        <RosterTable
          title={`${CURRENT_SEASON} ${teamName} Current Roster`}
          headerColor="#bfdbfe"
          players={seniorRoster}
        />

        {supplementalRoster.length > 0 && (
          <RosterTable
            title="Supplemental Roster"
            headerColor="#d1d5db"
            players={supplementalRoster}
          />
        )}

        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8 }}>
          Generated with RosterView · rosterview.app
        </div>
      </div>

      <div style={{ width: 240, flexShrink: 0 }}>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <img
            src={`/logos/${teamSlug}.png`}
            alt={teamName}
            style={{ width: 72, height: 72, objectFit: "contain" }}
            crossOrigin="anonymous"
          />
        </div>

        <div style={{ border: "1px solid #e2e8f0", borderRadius: 4, overflow: "hidden" }}>
          <SidebarStat label="Total Cap Hit" value={formatMoney(cap.total_cap_hit)} />
          <SidebarStat
            label="Est. Cap Remaining"
            value={formatMoney(remainingCapSpace)}
            highlight={capRemainingColor}
          />
          <SidebarStat label="Remaining GAM" value={formatMoney(estimatedGamLeft)} />
          <SidebarStat
            label="Designated Players"
            value={`${validation?.summary?.dp_count ?? 0} / ${validation?.summary?.dp_limit ?? 3}`}
            highlight="#fef9c3"
          />
          <SidebarStat
            label="U22 Players"
            value={`${validation?.summary?.u22_count ?? 0} / ${validation?.summary?.u22_limit ?? 3}`}
            highlight="#dcfce7"
          />
          <SidebarStat label="TAM Players" value={String(counts?.tam_players ?? 0)} highlight="#fee2e2" />
          <SidebarStat label="Active Players" value={String(activePlayerCount)} />
          <SidebarStat label="Senior Roster" value={`${counts?.senior_players ?? 0}/20`} />
          <SidebarStat label="Supplemental" value={String(counts?.supplemental_players ?? 0)} />
          <SidebarStat
            label="Intl. Spots"
            value={`${validation?.summary?.international_slots_used ?? 0}/${validation?.summary?.international_slots_total ?? 8}`}
          />
        </div>

        <div style={{ marginTop: 12, border: "1px solid #e2e8f0", borderRadius: 4, overflow: "hidden" }}>
          <div
            style={{
              backgroundColor: "#f1f5f9",
              padding: "6px 10px",
              fontSize: 11,
              fontWeight: 700,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            Real Spend by Position
          </div>
          {Object.entries(spendingByLine).map(([label, value]) => {
            const pct = totalLineSpend > 0 ? ((value / totalLineSpend) * 100).toFixed(1) : "0.0"
            return (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 10px",
                  fontSize: 10,
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <span style={{ color: "#475569" }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{pct}%</span>
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 10, border: "1px solid #e2e8f0", borderRadius: 4, overflow: "hidden" }}>
          <div
            style={{
              backgroundColor: "#f1f5f9",
              padding: "6px 10px",
              fontSize: 11,
              fontWeight: 700,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            Real Spend by Mechanism
          </div>
          {Object.entries(spendingByMechanism).map(([label, value]) => {
            const pct = totalMechanismSpend > 0 ? ((value / totalMechanismSpend) * 100).toFixed(1) : "0.0"
            return (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 10px",
                  fontSize: 10,
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <span style={{ color: "#475569" }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{pct}%</span>
              </div>
            )
          })}
        </div>

        <PlayerList title="DPs" headerColor="#bfdbfe" names={dpNames} />
        <PlayerList title="U22 Players" headerColor="#fbcfe8" names={u22Names} />

        {!validation?.is_valid && validation?.issues?.length > 0 && (
          <div
            style={{
              marginTop: 10,
              padding: "8px 10px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 4,
              fontSize: 10,
            }}
          >
            <div style={{ fontWeight: 700, color: "#dc2626", marginBottom: 4 }}>Roster Issues</div>
            {validation.issues.map((issue) => (
              <div key={issue.type} style={{ color: "#b91c1c", marginBottom: 2 }}>
                • {issue.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})

export default GMExportCard
