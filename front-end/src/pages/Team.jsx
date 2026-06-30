import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { createPortal } from "react-dom"
import { toPng } from "html-to-image"
import NavBar from "../components/NavBar"
import Footer from "../components/Footer"
import GMExportCard from "../components/team/GMExportCard"
import headshotManifest from "../data/headshotManifest.json"

const CURRENT_SEASON = 2026
const MLS_SALARY_CAP = 6_425_000
const MLS_TAM_AVAILABLE = 2_125_000
const MAX_BUDGET_CHARGE = 803_125
const U22_BUDGET_CHARGE = 200_000

const ROSTER_MODELS = [
  "Designated Player Model",
  "U22 Initiative Player Model"
]
const INACTIVE_STATUSES = [
  "Unavailable – On Loan",
  "Unavailable – Off Roster",
  "Unavailable – Injured List",
  "Unavailable – SEI",
]
const ROLE_ORDER = {
  "Designated Player": 7,
  "U22 Initiative": 6,
  "TAM Player": 5,
  Senior: 4,
  "Supplemental Roster": 2,
  "Homegrown Player": 1,
}
const ROLE_OPTIONS = [
  "Senior",
  "Designated Player",
  "U22 Initiative",
  "TAM Player",
  "Supplemental Roster",
  "Homegrown Player",
]
const STATUS_OPTIONS = [
  "",
  "Loan Player",
  "Unavailable – On Loan",
  "Unavailable – Off Roster",
  "Unavailable – Injured List",
  "Unavailable – SEI",
]
const POSITION_OPTIONS = ["", "GK", "LB", "RB", "CB", "DM", "CM", "AM", "LM", "RM", "LW", "RW", "ST"]
const DEFAULT_HEADSHOT = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="24" fill="url(#bg)"/>
    <circle cx="48" cy="35" r="17" fill="#cbd5e1"/>
    <path d="M20 84c3-18 17-28 28-28s25 10 28 28" fill="#cbd5e1"/>
  </svg>
`)}`

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") return 0
  const numeric = Number(String(value).replace(/[$,]/g, "").trim())
  return Number.isFinite(numeric) ? numeric : 0
}

function slugifyPlayerName(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function isActivePlayer(player) {
  return !INACTIVE_STATUSES.includes(player.status)
}

function formatMoney(value) {
  const amount = normalizeNumber(value)
  return `$${amount.toLocaleString()}`
}

function getGrossCharge(player) {
  return normalizeNumber(player.guaranteed_comp) + normalizeNumber(player.amortized_transfer_fee)
}

function getGamBuydownUsed(player) {
  if (!isActivePlayer(player) || player.role === "Supplemental Roster") return 0
  if (player.role === "Designated Player" || player.role === "U22 Initiative") return 0

  const grossCharge = getGrossCharge(player)
  if (grossCharge <= MAX_BUDGET_CHARGE) return 0

  return grossCharge - MAX_BUDGET_CHARGE
}

function getCapHit(player) {
  if (!isActivePlayer(player) || player.role === "Supplemental Roster") return 0
  if (player.role === "Designated Player") return MAX_BUDGET_CHARGE
  if (player.role === "U22 Initiative") return U22_BUDGET_CHARGE
  return getGrossCharge(player) - getGamBuydownUsed(player)
}

function hasCapMathChanged(player) {
  if (player.is_new) return true
  return (
    normalizeNumber(player.guaranteed_comp) !== normalizeNumber(player.original_guaranteed_comp) ||
    normalizeNumber(player.amortized_transfer_fee) !== normalizeNumber(player.original_amortized_transfer_fee) ||
    (player.role ?? "") !== (player.original_role ?? "") ||
    (player.status ?? "") !== (player.original_status ?? "")
  )
}

function getSimulatedGamUsed(player) {
  if (!hasCapMathChanged(player)) {
    return normalizeNumber(player.original_gam_used)
  }
  return getGamBuydownUsed(player)
}

function getSimulatedCapHit(player) {
  if (!hasCapMathChanged(player)) {
    return normalizeNumber(player.original_cap_hit)
  }
  return getCapHit(player)
}

function normalizeRosterPlayer(player, index = 0) {
  return {
    local_id: player.local_id ?? `${player.name || "player"}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    name: player.name ?? "",
    position: player.position ?? "",
    role: player.role ?? "Senior",
    base_salary: normalizeNumber(player.base_salary),
    guaranteed_comp: normalizeNumber(player.guaranteed_comp),
    transfer_fee: normalizeNumber(player.transfer_fee),
    amortized_transfer_fee: normalizeNumber(player.amortized_transfer_fee),
    is_international: Boolean(player.is_international),
    salary_estimated: Boolean(player.salary_estimated),
    dp_buydown_eligible: Boolean(player.dp_buydown_eligible),
    status: player.status ?? "",
    contract_through: player.contract_through ?? "",
    option_years: player.option_years ?? "",
    original_role: player.original_role ?? player.role ?? "Senior",
    original_status: player.original_status ?? player.status ?? "",
    original_guaranteed_comp: normalizeNumber(player.original_guaranteed_comp ?? player.guaranteed_comp),
    original_amortized_transfer_fee: normalizeNumber(player.original_amortized_transfer_fee ?? player.amortized_transfer_fee),
    original_cap_hit: normalizeNumber(player.original_cap_hit ?? player.cap_hit),
    original_gam_used: normalizeNumber(player.original_gam_used ?? player.gam_used),
    is_new: Boolean(player.is_new),
  }
}

function buildSimulatedTeamData(baseTeamData, roster, rosterModel) {
  const normalizedRoster = roster.map(normalizeRosterPlayer)
  const activeRoster = normalizedRoster.filter(isActivePlayer)
  const internationalSlotsTotal =
    baseTeamData.validation?.summary?.international_slots_total ??
    baseTeamData.international_slots_total ??
    8

  const effectiveModel = rosterModel ?? baseTeamData.roster_model
  const isU22Model = effectiveModel === "U22 Initiative Player Model"

  // U22 Model grants $1M additional GAM
  const modelGamBonus = isU22Model ? 1_000_000 : 0

  const baseEstimatedGamLeft =
    normalizeNumber(baseTeamData.estimated_gam_left) ||
    (normalizeNumber(baseTeamData.remaining_gam) + normalizeNumber(baseTeamData.gam_balance))
  const baseGamBuydownUsed = (baseTeamData.cap_breakdown ?? []).reduce(
    (sum, player) => sum + normalizeNumber(player.gam_used),
    0
  )

  const capBreakdown = normalizedRoster.map((player) => ({
    ...player,
    cap_hit: getSimulatedCapHit(player),
    gam_used: getSimulatedGamUsed(player),
  }))
  const simulatedGamBuydownUsed = capBreakdown.reduce((sum, player) => sum + normalizeNumber(player.gam_used), 0)
  const gamBuydownDelta = simulatedGamBuydownUsed - baseGamBuydownUsed
  const estimatedGamLeft = baseEstimatedGamLeft + modelGamBonus - gamBuydownDelta

  const totalBaseSalary = normalizedRoster.reduce((sum, player) => sum + normalizeNumber(player.base_salary), 0)
  const totalComp = normalizedRoster.reduce((sum, player) => sum + normalizeNumber(player.guaranteed_comp), 0)
  const totalTransferPayments = normalizedRoster.reduce(
    (sum, player) => sum + normalizeNumber(player.amortized_transfer_fee),
    0
  )
  const totalCapHit = capBreakdown.reduce((sum, player) => sum + player.cap_hit, 0)
  const remainingCapSpace =
    MLS_SALARY_CAP +
    MLS_TAM_AVAILABLE +
    normalizeNumber(baseTeamData.starting_gam) +
    modelGamBonus +
    (normalizeNumber(baseTeamData.gam_balance) - gamBuydownDelta) -
    totalCapHit
  const gamOffset = remainingCapSpace < 0
    ? Math.min(Math.max(estimatedGamLeft, 0), Math.abs(remainingCapSpace))
    : 0
  const adjustedRemainingCapSpace =
    remainingCapSpace < 0
      ? remainingCapSpace + gamOffset
      : remainingCapSpace

  const dpCount = activeRoster.filter((player) => player.role === "Designated Player").length
  const dpLimit = isU22Model ? 2 : 3
  const u22Count = activeRoster.filter((player) => player.role === "U22 Initiative").length
  const u22Limit = isU22Model ? 4 : 3
  const tamPlayers = activeRoster.filter((player) => player.role === "TAM Player").length
  const supplementalPlayers = normalizedRoster.filter((player) => player.role === "Supplemental Roster").length
  const seniorPlayers = activeRoster.filter((player) => player.role !== "Supplemental Roster").length
  const internationalSlotsUsed = activeRoster.filter((player) => player.is_international).length

  const issues = []
  if (dpCount > dpLimit) {
    issues.push({
      type: "DP_LIMIT",
      message: `Too many Designated Players (${dpCount}/${dpLimit})`,
    })
  }
  if (u22Count > u22Limit) {
    issues.push({
      type: "U22_LIMIT",
      message: `Too many U22 Initiative players (${u22Count}/${u22Limit})`,
    })
  }
  if (internationalSlotsUsed > internationalSlotsTotal) {
    issues.push({
      type: "INTERNATIONAL_SLOTS",
      message: `International slots exceeded (${internationalSlotsUsed}/${internationalSlotsTotal})`,
    })
  }
  if (adjustedRemainingCapSpace < 0) {
    issues.push({
      type: "SALARY_CAP",
      message: `Team is over estimated cap space by $${Math.abs(adjustedRemainingCapSpace).toLocaleString()}`,
    })
  }

  return {
    ...baseTeamData,
    roster_model: effectiveModel,
    players: normalizedRoster.length,
    estimated_gam_left: estimatedGamLeft,
    remaining_cap_space: adjustedRemainingCapSpace,
    counts: {
      designated_players: dpCount,
      u22_players: u22Count,
      tam_players: tamPlayers,
      supplemental_players: supplementalPlayers,
      senior_players: seniorPlayers,
    },
    cap: {
      ...baseTeamData.cap,
      total_base_salary: totalBaseSalary,
      total_cap_hit: totalCapHit,
      total_comp: totalComp,
      total_transfer_payments: totalTransferPayments,
      total_spend: totalComp + totalTransferPayments,
    },
    cap_breakdown: capBreakdown,
    validation: {
      is_valid: issues.length === 0,
      issues,
      summary: {
        ...(baseTeamData.validation?.summary ?? {}),
        dp_count: dpCount,
        dp_limit: dpLimit,
        u22_count: u22Count,
        u22_limit: u22Limit,
        international_slots_used: internationalSlotsUsed,
        international_slots_total: internationalSlotsTotal,
        cap_hit: totalCapHit,
        remaining_gam: normalizeNumber(baseTeamData.remaining_gam),
        starting_gam: normalizeNumber(baseTeamData.starting_gam),
        gam_balance: normalizeNumber(baseTeamData.gam_balance),
        estimated_gam_left: estimatedGamLeft,
        gam_buydown_used: simulatedGamBuydownUsed,
      },
    },
  }
}

function createNewPlayer() {
  return {
    name: "",
    position: "",
    role: "Senior",
    guaranteed_comp: "",
    transfer_fee: "",
    amortized_transfer_fee: "",
    is_international: false,
    salary_estimated: false,
    dp_buydown_eligible: false,
    status: "",
    contract_through: "",
    option_years: "",
  }
}

function InfoIcon({ text, align = "center", className = "" }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, arrowLeft: 16 })

  useEffect(() => {
    if (!open || !triggerRef.current) return

    function updatePosition() {
      const rect = triggerRef.current.getBoundingClientRect()
      const tooltipWidth = 288
      const margin = 12
      let left

      if (align === "left") {
        left = rect.left
      } else if (align === "right") {
        left = rect.right - tooltipWidth
      } else {
        left = rect.left + rect.width / 2 - tooltipWidth / 2
      }

      left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin))
      const top = rect.top - 12
      const arrowLeft = Math.max(16, Math.min(rect.left + rect.width / 2 - left, tooltipWidth - 16))

      setTooltipPosition({ top, left, arrowLeft })
    }

    updatePosition()
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("resize", updatePosition)

    return () => {
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("resize", updatePosition)
    }
  }, [align, open])

  return (
    <span
      ref={triggerRef}
      className={`relative inline-flex items-center flex-shrink-0 group ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center w-4 h-4 text-[10px] text-neutral-400 cursor-pointer border border-neutral-600 rounded-full hover:border-neutral-400 hover:text-neutral-200 transition-colors leading-none"
      >
        i
      </span>

      {open && typeof document !== "undefined" && createPortal(
        <span
          className="fixed z-[100] w-72 rounded border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-xs leading-relaxed text-neutral-200 shadow-lg whitespace-normal"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            transform: "translateY(-100%)",
          }}
        >
          {text}
          <span
            className="absolute top-full border-4 border-transparent border-t-neutral-700"
            style={{ left: tooltipPosition.arrowLeft, transform: "translateX(-50%)" }}
          />
        </span>,
        document.body
      )}
    </span>
  )
}

function SpendBreakdownBar({ title, data, total, isGMMode }) {
  return (
    <div className={`${isGMMode ? "bg-neutral-800 border-neutral-700" : "bg-neutral-900 border-neutral-800"} border p-3 rounded`}>
      <h3 className="text-sm font-semibold mb-2">{title}</h3>

      <div className={`w-full h-3 rounded-full overflow-hidden ${isGMMode ? "bg-neutral-700" : "bg-neutral-800"} mb-3 flex`}>
        {Object.entries(data).map(([label, value]) => {
          const widthPercent = total > 0 ? (value / total) * 100 : 0
          const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0"

          let color = "bg-neutral-400"
          if (label === "Attack") color = "bg-red-400"
          if (label === "Midfield") color = "bg-blue-400"
          if (label === "Defense") color = "bg-green-400"
          if (label === "Goalkeeper") color = "bg-yellow-400"
          if (label === "Designated Players") color = "bg-yellow-400"
          if (label === "U22 Players") color = "bg-green-400"
          if (label === "TAM Players") color = "bg-blue-400"

          return (
            <div
              key={label}
              className={color}
              style={{ width: `${widthPercent}%` }}
              title={`${label}: ${percent}%`}
            />
          )
        })}
      </div>

      <div className="space-y-1.5">
        {Object.entries(data).map(([label, value]) => {
          const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0"
          return (
            <div key={label} className="flex justify-between text-xs">
              <span className="text-neutral-300">{label}</span>
              <span className="text-neutral-400">{percent}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TransferBadge({ label, value, isGMMode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs border rounded px-2 py-0.5 whitespace-nowrap ${
        isGMMode ? "bg-neutral-700 border-neutral-600" : "bg-neutral-800 border-neutral-700"
      }`}
    >
      <span className="text-neutral-400">{label}:</span>
      <span className="text-white font-semibold">{formatMoney(value)}</span>
    </span>
  )
}

function SalaryEstimateMark() {
  return (
    <span className="inline-flex items-center gap-1 text-amber-200">
      <span aria-hidden="true">*</span>
    </span>
  )
}

function DPBuydownBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-red-300/40 bg-red-300/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-normal text-red-100">
      ↓
      <InfoIcon
        text="MLS roster profiles mark this Designated Player as eligible to be bought down with allocation money."
        align="right"
        className="ml-0"
      />
    </span>
  )
}

function StatusBadge({ status }) {
  if (status === "Unavailable – Injured List") {
    return <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">Injured</span>
  }
  if (status === "Unavailable – SEI") {
    return <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">SEI</span>
  }
  if (status === "Unavailable – On Loan") {
    return <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">Loaned Out</span>
  }
  if (status === "Loan Player") {
    return <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">Loaned In</span>
  }
  if (status === "Unavailable – Off Roster") {
    return <span className="text-xs px-2 py-0.5 rounded bg-neutral-500/20 text-red-300 border border-red-500/30">Off Roster</span>
  }
  return null
}

function InternationalBadge() {
  const [open, setOpen] = useState(false)

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] leading-none cursor-help"
        aria-label="Occupies an international roster spot"
        onClick={() => setOpen((prev) => !prev)}
      >
        ✈︎
      </span>

      <span
        className={`absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs leading-relaxed text-neutral-200 shadow-lg transition-opacity duration-150 whitespace-normal ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        Occupies an international roster spot.
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-700" />
      </span>
    </span>
  )
}

function ContractYearsCell({ through, options }) {
  const optionValues = Array.isArray(options)
    ? options.filter(Boolean)
    : options && options !== 0
      ? [options]
      : []

  if (!through && optionValues.length === 0) {
    return <span className="text-neutral-500">-</span>
  }

  return (
    <div className="flex min-w-[11rem] items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-neutral-100">{through || "N/A"}</span>
      {optionValues.map((value) => (
        <span
          key={value}
          className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-300"
        >
          {value}
        </span>
      ))}
    </div>
  )
}

function PlayerHeadshot({ teamSlug, name }) {
  const [hasError, setHasError] = useState(false)
  const playerSlug = slugifyPlayerName(name)
  const manifestSrc = headshotManifest?.[teamSlug]?.[playerSlug]
  const resolvedSrc = !hasError && manifestSrc
    ? manifestSrc
    : !hasError && teamSlug && playerSlug
      ? `/headshots/${teamSlug}/${playerSlug}.jpg`
      : DEFAULT_HEADSHOT

  useEffect(() => {
    setHasError(false)
  }, [manifestSrc, teamSlug, name])

  return (
    <div className="h-14 w-12 sm:h-14 sm:w-14 rounded-2xl ring-1 ring-white/10 bg-neutral-800 flex-shrink-0 overflow-hidden">
      <img
        src={resolvedSrc}
        alt={name ? `${name} headshot` : "Player headshot placeholder"}
        className="h-full w-full object-cover scale-[1.7] -translate-y-[-15px]"
        style={{ objectPosition: "center center" }}
        onError={() => setHasError(true)}
      />
    </div>
  )
}

function GMNumberInput({ value, onChange, placeholder = "0", min = 0, align = "left" }) {
  return (
    <input
      type="number"
      min={min}
      step="1"
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className={`w-full rounded border border-neutral-600 bg-neutral-800 px-2 py-1 text-xs text-neutral-100 focus:border-neutral-400 focus:outline-none ${
        align === "right" ? "text-right" : ""
      }`}
    />
  )
}

function Team() {
  const { slug } = useParams()

  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sortKey, setSortKey] = useState("role")
  const [sortDir, setSortDir] = useState("desc")
  const [isGMMode, setIsGMMode] = useState(false)
  const [gmRoster, setGmRoster] = useState([])
  const [gmRosterModel, setGmRosterModel] = useState(null)
  const [newPlayer, setNewPlayer] = useState(createNewPlayer())
  const [exporting, setExporting] = useState(false)
  const exportRef = useRef(null)

  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true)
        setError("")
        setIsGMMode(false)
        setGmRoster([])
        setNewPlayer(createNewPlayer())
        const res = await fetch(`https://rosterview.onrender.com/team/${slug}`)
        //const res = await fetch(`http://127.0.0.1:8000/team/${slug}`)
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        const data = await res.json()
        setTeamData(data)
      } catch (err) {
        console.error(err)
        setError("Could not load team data.")
      } finally {
        setLoading(false)
      }
    }
    loadTeam()
  }, [slug])

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']")
    if (!link) return
    link.href = "/rosterview_logo.png"
  }, [])

  function toggleGMMode() {
    if (!teamData) return

    if (isGMMode) {
      setIsGMMode(false)
      setGmRoster([])
      setGmRosterModel(null)
      setNewPlayer(createNewPlayer())
      return
    }

    setGmRoster(teamData.cap_breakdown.map((player, index) => normalizeRosterPlayer(player, index)))
    setGmRosterModel(teamData.roster_model)
    setNewPlayer(createNewPlayer())
    setIsGMMode(true)
  }

  function updatePlayer(localId, field, value) {
    setGmRoster((current) =>
      current.map((player) =>
        player.local_id === localId
          ? {
              ...player,
              [field]:
                field === "is_international"
                  || field === "salary_estimated"
                  || field === "dp_buydown_eligible"
                  ? Boolean(value)
                  : ["guaranteed_comp", "base_salary", "transfer_fee", "amortized_transfer_fee"].includes(field)
                    ? value
                    : value,
            }
          : player
      )
    )
  }

  function removePlayer(localId) {
    setGmRoster((current) => current.filter((player) => player.local_id !== localId))
  }

  async function exportGMRoster() {
    if (!exportRef.current || exporting) return

    setExporting(true)
    try {
      await new Promise((resolve) => requestAnimationFrame(resolve))

      const logo = exportRef.current.querySelector("img")
      if (logo && !logo.complete) {
        await new Promise((resolve) => {
          logo.onload = resolve
          logo.onerror = resolve
        })
      }

      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      })

      const link = document.createElement("a")
      link.download = `${slug}-gm-roster-${CURRENT_SEASON}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setExporting(false)
    }
  }

  function addPlayer() {
    if (!newPlayer.name.trim()) return

    setGmRoster((current) => [
      ...current,
      normalizeRosterPlayer(
        {
          ...newPlayer,
          local_id: `new-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          base_salary: normalizeNumber(newPlayer.guaranteed_comp),
          is_new: true,
        },
        current.length
      ),
    ])
    setNewPlayer(createNewPlayer())
  }

  const activeTeamData = isGMMode && teamData ? buildSimulatedTeamData(teamData, gmRoster, gmRosterModel) : teamData

  const sortedRoster =
    activeTeamData?.cap_breakdown
      ? [...activeTeamData.cap_breakdown].sort((a, b) => {
          let valA
          let valB

          if (sortKey === "position") {
            valA = ROLE_ORDER[a.role || "Senior"] || 3
            valB = ROLE_ORDER[b.role || "Senior"] || 3
          } else if (sortKey === "role") {
            valA = ROLE_ORDER[a.role || "Senior"] || 3
            valB = ROLE_ORDER[b.role || "Senior"] || 3
          } else {
            valA = normalizeNumber(a.guaranteed_comp)
            valB = normalizeNumber(b.guaranteed_comp)
          }

          return sortDir === "desc" ? valB - valA : valA - valB
        })
      : []

  const spendingByLine = { Attack: 0, Midfield: 0, Defense: 0, Goalkeeper: 0 }
  const spendingByMechanism = {
    "Designated Players": 0,
    "U22 Players": 0,
    "TAM Players": 0,
    "Senior Players": 0,
  }

  if (activeTeamData?.cap_breakdown) {
    activeTeamData.cap_breakdown.forEach((player) => {
      const salary = normalizeNumber(player.guaranteed_comp)
      const pos = player.position ?? ""

      if (["ST", "LW", "RW"].includes(pos)) spendingByLine.Attack += salary
      else if (["DM", "CM", "AM", "RM", "LM"].includes(pos)) spendingByLine.Midfield += salary
      else if (["LB", "RB", "CB"].includes(pos)) spendingByLine.Defense += salary
      else if (pos === "GK") spendingByLine.Goalkeeper += salary

      if (player.role === "Designated Player") spendingByMechanism["Designated Players"] += salary
      else if (player.role === "U22 Initiative") spendingByMechanism["U22 Players"] += salary
      else if (player.role === "TAM Player") spendingByMechanism["TAM Players"] += salary
      else spendingByMechanism["Senior Players"] += salary
    })
  }

  const totalLineSpend = Object.values(spendingByLine).reduce((sum, value) => sum + value, 0)
  const totalMechanismSpend = Object.values(spendingByMechanism).reduce((sum, value) => sum + value, 0)
  const estimatedGamLeft =
    activeTeamData
      ? (activeTeamData.estimated_gam_left ?? (normalizeNumber(activeTeamData.remaining_gam) + normalizeNumber(activeTeamData.gam_balance)))
      : 0

  if (loading) {
    return <div className="min-h-screen px-4 sm:px-6 py-3 text-neutral-300">Loading team...</div>
  }

  if (error || !activeTeamData) {
    return <div className="min-h-screen px-4 sm:px-6 py-3 text-red-400">{error || "Could not load team data."}</div>
  }

  const pageClass = isGMMode ? "bg-neutral-800 text-neutral-100" : ""
  const panelClass = isGMMode ? "bg-neutral-800 border-neutral-700" : "bg-neutral-900 border-neutral-800"
  const subtlePanelClass = isGMMode ? "bg-neutral-750 border-neutral-700" : "bg-neutral-900 border-neutral-800"

  return (
    <div className={`min-h-screen ${pageClass}`}>
      <NavBar page={activeTeamData.team ?? "Team"} />
      <div className="px-4 sm:px-6 py-3">
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 flex-shrink-0">
                <img
                  src={`/logos/${slug}.png`}
                  alt={activeTeamData.team}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-semibold leading-tight">{activeTeamData.team}</h1>
                <p className="text-xs text-neutral-400">
                  {isGMMode && (
                    <div className="text-neutral-400  text-sm text-neutral-200">
                      <span className="mr-1">Roster Model:</span>
                      <select
                        value={gmRosterModel ?? activeTeamData.roster_model}
                        onChange={(event) => setGmRosterModel(event.target.value)}
                        className="border border-neutral-600 bg-neutral-900 px-1 py-1 text-sm text-white focus:border-neutral-400 focus:outline-none rounded"
                      >
                        {ROSTER_MODELS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <InfoIcon text="Teams choose between two models: the DP Model (up to 3 DPs, 3 U22 slots) or the U22 Model (up to 4 U22 slots, 2 DP slots, and $1M extra GAM)." className="ml-1" />
                    </div>
                  )}
                 {!isGMMode && (
                    <div className="text-neutral-400  text-sm text-neutral-200">
                      Roster Model: {activeTeamData.roster_model}
                      <InfoIcon text="Teams choose between two models: the DP Model (up to 3 DPs, 3 U22 slots) or the U22 Model (up to 4 U22 slots, 2 DP slots, and $1M extra GAM)." className="ml-1" />

                    </div>
                  )}
                  </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isGMMode && (
                <button
                  type="button"
                  onClick={exportGMRoster}
                  disabled={exporting}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-500 bg-neutral-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-600 disabled:cursor-wait disabled:opacity-60"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 1 0-1.09-1.03l-2.955 3.129V2.75Z" />
                    <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                  </svg>
                  <span>{exporting ? "Exporting…" : "Export Image"}</span>
                </button>
              )}

              <button
                type="button"
                onClick={toggleGMMode}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                  isGMMode
                    ? "border-neutral-500 bg-neutral-700 text-white hover:bg-neutral-600"
                    : "border-blue-400/30 bg-blue-400/10 text-blue-100 hover:bg-blue-400/15"
                }`}
              >
                <span>{isGMMode ? "GM Mode On" : "GM Mode"}</span>
              </button>
            </div>
          </div>

          {isGMMode && (
            <div className="rounded-xl border border-neutral-600 bg-neutral-700/80 px-4 py-3 text-sm text-neutral-200">
              GM Mode is local only. Changes are temporary and disappear when you turn it off. Use Export Image to save your roster scenario as a PNG.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-3">
            <div className={`mb-4 border p-2.5 sm:p-3 rounded ${panelClass}`}>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm text-neutral-300 font-semibold flex items-center">
                  Roster Spending
                  <InfoIcon text="The total a team pays its players compared with what counts against the salary cap." />
                </p>
                <p className="text-sm text-neutral-400">Total: {formatMoney(activeTeamData.cap.total_comp)}</p>
              </div>
              <div className={`w-full h-3 rounded overflow-hidden flex mb-3 ${isGMMode ? "bg-neutral-700" : "bg-neutral-800"}`}>
                <div
                  className="bg-blue-400 h-full"
                  style={{
                    width: activeTeamData.cap.total_comp > 0
                      ? `${(activeTeamData.cap.total_spend / activeTeamData.cap.total_comp) * 100}%`
                      : "0%",
                  }}
                />
                <div
                  className="bg-neutral-500 h-full"
                  style={{
                    width: activeTeamData.cap.total_comp > 0
                      ? `${((activeTeamData.cap.total_spend - activeTeamData.cap.total_cap_hit) / activeTeamData.cap.total_comp) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <div className="flex items-center gap-2 text-neutral-300">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Cap Hit: {formatMoney(activeTeamData.cap.total_cap_hit)}
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-neutral-500"></span>
                  Off-Budget: {formatMoney(activeTeamData.cap.total_comp - activeTeamData.cap.total_cap_hit)}
                </div>
              </div>
            </div>

            {isGMMode && (
              <div className="mb-4 rounded-xl border border-neutral-700 bg-neutral-800 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-white">Add Player</h2>
                  <button
                    type="button"
                    onClick={addPlayer}
                    className="rounded-full border border-neutral-500 bg-neutral-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-600"
                  >
                    Add To Roster
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={newPlayer.name}
                    onChange={(event) => setNewPlayer((current) => ({ ...current, name: event.target.value }))}
                    placeholder="Player name"
                    className="rounded border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-neutral-400 focus:outline-none"
                  />
                  <select
                    value={newPlayer.position}
                    onChange={(event) => setNewPlayer((current) => ({ ...current, position: event.target.value }))}
                    className="rounded border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-neutral-400 focus:outline-none"
                  >
                    {POSITION_OPTIONS.map((option) => (
                      <option key={option || "blank"} value={option}>
                        {option || "Position"}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newPlayer.role}
                    onChange={(event) => setNewPlayer((current) => ({ ...current, role: event.target.value }))}
                    className="rounded border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-neutral-400 focus:outline-none"
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <select
                    value={newPlayer.status}
                    onChange={(event) => setNewPlayer((current) => ({ ...current, status: event.target.value }))}
                    className="rounded border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-neutral-400 focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option || "active"} value={option}>
                        {option || "Active"}
                      </option>
                    ))}
                  </select>
                  <GMNumberInput
                    value={newPlayer.guaranteed_comp}
                    onChange={(value) => setNewPlayer((current) => ({ ...current, guaranteed_comp: value }))}
                    placeholder="Guaranteed comp"
                  />
                  <GMNumberInput
                    value={newPlayer.transfer_fee}
                    onChange={(value) => setNewPlayer((current) => ({ ...current, transfer_fee: value }))}
                    placeholder="Transfer fee"
                  />
                  <GMNumberInput
                    value={newPlayer.amortized_transfer_fee}
                    onChange={(value) => setNewPlayer((current) => ({ ...current, amortized_transfer_fee: value }))}
                    placeholder="Transfer per year"
                  />
                  <input
                    type="text"
                    value={newPlayer.contract_through}
                    onChange={(event) => setNewPlayer((current) => ({ ...current, contract_through: event.target.value }))}
                    placeholder="Contract through"
                    className="rounded border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-neutral-400 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={newPlayer.option_years}
                    onChange={(event) => setNewPlayer((current) => ({ ...current, option_years: event.target.value }))}
                    placeholder="Option years"
                    className="rounded border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-neutral-400 focus:outline-none md:col-span-2"
                  />
                  <label className="inline-flex items-center gap-2 rounded border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm text-neutral-200">
                    <input
                      type="checkbox"
                      checked={newPlayer.is_international}
                      onChange={(event) => setNewPlayer((current) => ({ ...current, is_international: event.target.checked }))}
                    />
                    International
                  </label>
                  <label className="inline-flex items-center gap-2 rounded border border-neutral-600 bg-neutral-900 px-3 py-2 text-sm text-neutral-200">
                    <input
                      type="checkbox"
                      checked={newPlayer.salary_estimated}
                      onChange={(event) => setNewPlayer((current) => ({ ...current, salary_estimated: event.target.checked }))}
                    />
                    Estimated salary
                  </label>
                </div>
              </div>
            )}

            <h2 className="text-sm font-semibold mb-2">Roster</h2>

            <div className="overflow-x-auto">
              <table className={`min-w-full border rounded text-sm ${panelClass}`}>
                <thead>
                  <tr className={`border-b text-neutral-200 text-xs sm:text-sm ${isGMMode ? "border-neutral-700" : "border-neutral-800"}`}>
                    {isGMMode && <th className="text-left px-3 py-2">GM</th>}
                    <th className="text-left px-3 py-2">Player</th>
                    <th
                      className="text-left px-3 py-2 cursor-pointer select-none"
                      onClick={() => {
                        setSortKey("position")
                        setSortDir((current) => (current === "asc" ? "desc" : "asc"))
                      }}
                    >
                      Position {sortKey === "position" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      className="text-left px-3 py-2 cursor-pointer select-none"
                      onClick={() => {
                        setSortKey("role")
                        setSortDir((current) => (current === "asc" ? "desc" : "asc"))
                      }}
                    >
                      Roster Role {sortKey === "role" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      className="text-right px-3 py-2 cursor-pointer select-none"
                      onClick={() => {
                        setSortKey("salary")
                        setSortDir((current) => (current === "asc" ? "desc" : "asc"))
                      }}
                    >
                      Total Salary {sortKey === "salary" ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th className="text-right px-3 py-2">Cap Hit</th>
                    <th className="text-left px-3 py-2">Contract / Options</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedRoster.map((player, idx) => {
                    const hasTransfer = normalizeNumber(player.transfer_fee) > 0 || normalizeNumber(player.amortized_transfer_fee) > 0

                    let rowClass = isGMMode ? "border-b border-neutral-700/70 last:border-b-0" : "border-b border-neutral-700/50 last:border-b-0"
                    if (player.role === "Designated Player") rowClass += " bg-yellow-500/10"
                    else if (player.role === "U22 Initiative") rowClass += " bg-green-500/10"
                    else if (player.role === "TAM Player") rowClass += " bg-red-500/10"
                    else if (player.role === "Supplemental Roster") rowClass += isGMMode ? " bg-neutral-700/40" : " bg-neutral-800/40"

                    return (
                      <tr key={player.local_id ?? `${player.name}-${idx}`} className={rowClass}>
                        {isGMMode && (
                          <td className="px-3 py-1.5 align-top">
                            <button
                              type="button"
                              onClick={() => removePlayer(player.local_id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                            >
                              ×
                            </button>
                          </td>
                        )}

                        <td className="px-3 py-2.5 align-top min-w-[18rem]">
                          <div className="flex items-start gap-3">
                            {isGMMode ? (
                              <>
                                <PlayerHeadshot teamSlug={slug} name={player.name} />
                                <div className="flex min-w-0 flex-1 flex-col gap-2">
                                  <input
                                    type="text"
                                    value={player.name}
                                    onChange={(event) => updatePlayer(player.local_id, "name", event.target.value)}
                                    className="rounded border border-neutral-600 bg-neutral-800 px-2.5 py-1.5 text-sm text-white focus:border-neutral-400 focus:outline-none"
                                  />
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <label className="inline-flex items-center gap-1.5 text-xs text-neutral-300">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(player.is_international)}
                                        onChange={(event) => updatePlayer(player.local_id, "is_international", event.target.checked)}
                                      />
                                      International
                                    </label>
                                    <label className="inline-flex items-center gap-1.5 text-xs text-neutral-300">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(player.salary_estimated)}
                                        onChange={(event) => updatePlayer(player.local_id, "salary_estimated", event.target.checked)}
                                      />
                                      Estimated salary
                                    </label>
                                    <select
                                      value={player.status ?? ""}
                                      onChange={(event) => updatePlayer(player.local_id, "status", event.target.value)}
                                      className="rounded border border-neutral-600 bg-neutral-800 px-2 py-1 text-xs text-neutral-100 focus:border-neutral-400 focus:outline-none"
                                    >
                                      {STATUS_OPTIONS.map((option) => (
                                        <option key={option || "active"} value={option}>
                                          {option || "Active"}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <GMNumberInput
                                      value={player.transfer_fee}
                                      onChange={(value) => updatePlayer(player.local_id, "transfer_fee", value)}
                                      placeholder="Transfer fee"
                                    />
                                    <GMNumberInput
                                      value={player.amortized_transfer_fee}
                                      onChange={(value) => updatePlayer(player.local_id, "amortized_transfer_fee", value)}
                                      placeholder="Per year"
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <PlayerHeadshot teamSlug={slug} name={player.name} />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-white text-base sm:text-lg leading-tight">{player.name}</span>
                                    {player.is_international && <InternationalBadge />}
                                    <StatusBadge status={player.status} />
                                  </div>
                                  {hasTransfer && (
                                    <div className="mt-2 flex flex-nowrap items-center gap-1.5 overflow-x-auto no-scrollbar">
                                      {normalizeNumber(player.transfer_fee) > 0 && (
                                        <TransferBadge label="Transfer Fee" value={player.transfer_fee} isGMMode={false} />
                                      )}
                                      {normalizeNumber(player.amortized_transfer_fee) > 0 && (
                                        <TransferBadge label="Per year" value={player.amortized_transfer_fee} isGMMode={false} />
                                      )}
                                      <InfoIcon
                                        text="The transfer fee is what the club paid to acquire this player. The per-year value spreads that cost evenly across the contract length."
                                        align="left"
                                        className="ml-0"
                                      />
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-1.5 text-neutral-300 text-sm align-top">
                          {isGMMode ? (
                            <select
                              value={player.position ?? ""}
                              onChange={(event) => updatePlayer(player.local_id, "position", event.target.value)}
                              className="w-full rounded border border-neutral-600 bg-neutral-800 px-2 py-1 text-xs text-neutral-100 focus:border-neutral-400 focus:outline-none"
                            >
                              {POSITION_OPTIONS.map((option) => (
                                <option key={option || "blank"} value={option}>
                                  {option || "Position"}
                                </option>
                              ))}
                            </select>
                          ) : (
                            player.position
                          )}
                        </td>

                        <td className="px-3 py-1.5 text-neutral-300 text-sm align-top whitespace-nowrap">
                          {isGMMode ? (
                            <select
                              value={player.role ?? "Senior"}
                              onChange={(event) => updatePlayer(player.local_id, "role", event.target.value)}
                              className="w-full rounded border border-neutral-600 bg-neutral-800 px-2 py-1 text-xs text-neutral-100 focus:border-neutral-400 focus:outline-none whitespace-nowrap"
                            >
                              {ROLE_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="inline-flex items-center gap-1.5">
                              <span>{player.role ?? "Senior"}</span>
                              {player.role === "Designated Player" && player.dp_buydown_eligible && <DPBuydownBadge />}
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-1.5 text-right text-sm align-top">
                          {isGMMode ? (
                            <GMNumberInput
                              value={player.guaranteed_comp}
                              onChange={(value) => updatePlayer(player.local_id, "guaranteed_comp", value)}
                              placeholder="0"
                              align="right"
                            />
                          ) : (
                            <span className="inline-flex items-center justify-end gap-1.5">
                              <span>{formatMoney(player.guaranteed_comp)}</span>
                              {player.salary_estimated && <SalaryEstimateMark /> && <InfoIcon
        text="This salary is an estimate because no current public salary source is available for this player."
        align="right"
        className="ml-0"
      />}
                            </span>
                          )}
                        </td>

                        <td className="px-3 py-1.5 text-right text-sm align-top">{formatMoney(player.cap_hit)}</td>

                        <td className="px-3 py-1.5 text-neutral-300 text-sm align-top">
                          {isGMMode ? (
                            <div className="flex min-w-[11rem] flex-col gap-2">
                              <input
                                type="text"
                                value={player.contract_through ?? ""}
                                onChange={(event) => updatePlayer(player.local_id, "contract_through", event.target.value)}
                                placeholder="Contract through"
                                className="rounded border border-neutral-600 bg-neutral-800 px-2 py-1 text-xs text-white focus:border-neutral-400 focus:outline-none"
                              />
                              <input
                                type="text"
                                value={player.option_years ?? ""}
                                onChange={(event) => updatePlayer(player.local_id, "option_years", event.target.value)}
                                placeholder="Option years"
                                className="rounded border border-neutral-600 bg-neutral-800 px-2 py-1 text-xs text-white focus:border-neutral-400 focus:outline-none"
                              />
                            </div>
                          ) : (
                            <ContractYearsCell through={player.contract_through} options={player.option_years} />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-3 mt-4 lg:mt-0">
            <div className={`border p-2.5 sm:p-3 rounded bg-yellow-500/20 ${isGMMode ? "border-neutral-700" : "border-neutral-800"}`}>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-neutral-300 font-semibold flex items-center">
                  Designated Players
                  <InfoIcon text="Star players paid above the normal cap limit with a lowered cap hit of $803,125." />
                </p>
                <p className="text-sm font-semibold">
                  {activeTeamData.validation?.summary?.dp_count ?? 0} / {activeTeamData.validation?.summary?.dp_limit ?? 3}
                </p>
              </div>
              <div className={`w-full h-2 rounded overflow-hidden ${isGMMode ? "bg-neutral-700" : "bg-neutral-800"}`}>
                <div
                  className="h-full bg-yellow-400"
                  style={{
                    width: `${((activeTeamData.validation?.summary?.dp_count ?? 0) / (activeTeamData.validation?.summary?.dp_limit ?? 3)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className={`border p-2.5 sm:p-3 rounded bg-green-500/20 ${isGMMode ? "border-neutral-700" : "border-neutral-800"}`}>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-neutral-300 font-semibold flex items-center">
                  U22 Players
                  <InfoIcon text="A special rule that allows teams to sign players under 22 with a lowered cap hit of $200,000." />
                </p>
                <p className="text-sm font-semibold">
                  {activeTeamData.validation?.summary?.u22_count ?? 0} / {activeTeamData.validation?.summary?.u22_limit ?? 3}
                </p>
              </div>
              <div className={`w-full h-2 rounded overflow-hidden ${isGMMode ? "bg-neutral-700" : "bg-neutral-800"}`}>
                <div
                  className="h-full bg-green-400"
                  style={{
                    width: `${((activeTeamData.validation?.summary?.u22_count ?? 0) / (activeTeamData.validation?.summary?.u22_limit ?? 3)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className={`border p-2.5 sm:p-3 rounded flex justify-between items-center bg-red-500/20 ${isGMMode ? "border-neutral-700" : "border-neutral-800"}`}>
              <p className="text-sm text-neutral-300 font-semibold flex items-center">
                TAM Players
                <InfoIcon text="Players whose cap hit is lowered using Targeted Allocation Money (TAM). Each team is given $2,125,000 in TAM every season." />
              </p>
              <p className="text-sm font-semibold">{activeTeamData.counts?.tam_players ?? 0}</p>
            </div>

            <SpendBreakdownBar title="Real Spend by Position" data={spendingByLine} total={totalLineSpend} isGMMode={isGMMode} />
            <SpendBreakdownBar title="Real Spend by Mechanism" data={spendingByMechanism} total={totalMechanismSpend} isGMMode={isGMMode} />

            <div className={`border p-2.5 sm:p-3 rounded flex justify-between items-center ${subtlePanelClass}`}>
              <p className="text-sm text-neutral-300 font-semibold flex items-center">
                Total Players
                <InfoIcon text="Players currently available to play, not including unavailable players." />
              </p>
              <p className="text-sm font-semibold text-right">
                {activeTeamData.cap_breakdown
                  ? activeTeamData.cap_breakdown.filter((player) => isActivePlayer(player)).length
                  : 0}
              </p>
            </div>

            <div className={`border p-2.5 sm:p-3 rounded flex justify-between items-center ${subtlePanelClass}`}>
              <p className="text-sm text-neutral-300 font-semibold flex items-center">
                Senior Roster
                <InfoIcon text="Players occupying roster slots 1-20 whose salaries count towards the salary budget." />
              </p>
              <p className="text-sm font-semibold text-right">{activeTeamData.counts?.senior_players ?? 0}/20</p>
            </div>

            <div className={`border p-2.5 sm:p-3 rounded flex justify-between items-center ${subtlePanelClass}`}>
              <p className="text-sm text-neutral-300 font-semibold flex items-center">
                Supplemental Roster
                <InfoIcon text="Players in roster spots 21-30 whose salaries do not count against the cap." />
              </p>
              <p className="text-sm font-semibold text-right">{activeTeamData.counts?.supplemental_players ?? 0}</p>
            </div>

            <div className={`border p-2.5 sm:p-3 rounded flex justify-between items-center ${subtlePanelClass}`}>
              <p className="text-sm text-neutral-300 font-semibold">
                International Spots Used
                <InfoIcon text="Teams have a tradable pool of international slots. GM Mode recalculates usage from active internationals only." />
              </p>
              <p className="text-sm font-semibold text-right">
                {(activeTeamData.validation?.summary?.international_slots_used ?? 0)}/{(activeTeamData.validation?.summary?.international_slots_total ?? activeTeamData.international_slots_total ?? 8)}
              </p>
            </div>

            <div className={`border p-2.5 sm:p-3 rounded flex justify-between items-center ${subtlePanelClass}`}>
              <p className="text-sm text-neutral-300 font-semibold flex items-center">
                Remaining GAM
                <InfoIcon text="Extra league funds teams can use to lower cap hits or make trades. Numbers are estimated as of April 2026." />
              </p>
              <p className="text-sm font-semibold text-right">{formatMoney(estimatedGamLeft)}</p>
            </div>

            <div className={`border p-2.5 sm:p-3 rounded flex justify-between items-center ${subtlePanelClass}`}>
              <p className="text-sm text-neutral-300 font-semibold flex items-center">
                Estimated Cap Remaining
                <InfoIcon text="An estimate of how much salary cap room the team still has left." />
              </p>
              <p className="text-sm font-semibold text-right">{formatMoney(activeTeamData.remaining_cap_space ?? 0)}</p>
            </div>

            {!activeTeamData.validation?.is_valid && (
              <div className="bg-red-500/10 border border-red-500/40 p-4 rounded">
                <p className="text-sm font-semibold text-red-400 mb-2">Roster Issues</p>
                <ul className="text-sm text-red-300 list-disc list-inside space-y-1">
                  {activeTeamData.validation?.issues?.map((issue) => (
                    <li key={issue.type}>{issue.message}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      {isGMMode && (
        <div className="pointer-events-none fixed left-[-10000px] top-0" aria-hidden="true">
          <GMExportCard
            ref={exportRef}
            teamName={activeTeamData.team}
            teamSlug={slug}
            rosterModel={activeTeamData.roster_model}
            capBreakdown={(activeTeamData.cap_breakdown ?? []).map((player) =>
              player.role === "Homegrown Player"
                ? { ...player, role: "Supplemental Roster" }
                : player
            )}
            cap={activeTeamData.cap}
            validation={activeTeamData.validation}
            counts={activeTeamData.counts}
            spendingByLine={spendingByLine}
            spendingByMechanism={spendingByMechanism}
            totalLineSpend={totalLineSpend}
            totalMechanismSpend={totalMechanismSpend}
            estimatedGamLeft={estimatedGamLeft}
            remainingCapSpace={activeTeamData.remaining_cap_space ?? 0}
            activePlayerCount={
              activeTeamData.cap_breakdown
                ? activeTeamData.cap_breakdown.filter((player) => isActivePlayer(player)).length
                : 0
            }
          />
        </div>
      )}

      <Footer />
    </div>
  )
}

export default Team
