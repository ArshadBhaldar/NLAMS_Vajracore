"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell, Building2, Camera, Check, ChevronDown, ChevronRight, CircleHelp,
  FileCheck2, FileText, Flag, FolderKanban, Gavel, Globe2, LayoutDashboard,
  LogOut, Map, Menu, Mic, PanelLeft, Plus, Search, ShieldCheck, Upload,
  UserRound, Users, X, Loader2,
  MapPin,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

import { useAuth } from "@/lib/auth-context"
import { api, ApiError } from "@/lib/api"
import {
  ROLE_LABELS, STAGE_LABELS, STAGE_ORDER, TRANSITIONS,
  type UserRole, type ProposalStage,
  type DashboardSummary, type Proposal, type Compensation, type Objection,
  type Parcel, type DocumentRecord, type ScrutinyReport,
} from "@/lib/types"

// ─── Navigation per role ──────────────────────────────────────
const navByRole: Record<UserRole, { label: string; href: string; icon: typeof LayoutDashboard }[]> = {
  STATE_MONITOR: [
    { label: "National Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Project Workbench", href: "/workbench", icon: FolderKanban },
    { label: "Reports & Analytics", href: "/dashboard", icon: FileCheck2 },
  ],
  REQUIRING_BODY: [
    { label: "My Projects", href: "/dashboard", icon: Building2 },
    { label: "Submit Proposal", href: "/submit-proposal", icon: Plus },
    { label: "Documents", href: "/workbench", icon: FileText },
  ],
  CALA: [
    { label: "CALA Workbench", href: "/workbench", icon: FolderKanban },
    { label: "Land Awards", href: "/dashboard", icon: Gavel },
    { label: "Field Verification", href: "/field-survey", icon: Map },
  ],
  FIELD_SURVEYOR: [
    { label: "Survey Queue", href: "/field-survey", icon: Camera },
    { label: "My Assignments", href: "/field-survey", icon: Map },
    { label: "Sync Centre", href: "/field-survey", icon: Globe2 },
  ],
  CITIZEN: [
    { label: "My Land", href: "/my-land", icon: UserRound },
    { label: "Applications", href: "/my-land", icon: FileText },
    { label: "Help & Support", href: "/my-land", icon: CircleHelp },
  ],
}

// ─── Shared components ────────────────────────────────────────
const statusTone: Record<string, string> = {
  Low: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  High: "border-red-200 bg-red-50 text-red-700",
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ASSESSED: "border-amber-200 bg-amber-50 text-amber-700",
  Pending: "border-amber-200 bg-amber-50 text-amber-700",
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  OPEN: "border-amber-200 bg-amber-50 text-amber-700",
  RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  Synced: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Failed: "border-red-200 bg-red-50 text-red-700",
}

function Status({ children }: { children: string }) {
  return (
    <Badge variant="outline" className={statusTone[children] ?? "border-slate-200 bg-slate-50 text-slate-600"}>
      {children}
    </Badge>
  )
}

function Spinner({ className }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className ?? "size-5 text-teal-700"}`} />
}

// ─── Shell ────────────────────────────────────────────────────
function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7f8]">
        <Spinner className="size-8 text-teal-700" />
      </div>
    )
  }

  if (!user) return null // AuthProvider will redirect to /login

  const role = user.role
  const nav = navByRole[role] || []
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-[#f4f7f8] text-slate-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-slate-200 bg-[#082b3a] text-white transition-all lg:block ${collapsed ? "w-[76px]" : "w-[250px]"}`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div className="grid size-9 place-items-center rounded-lg bg-teal-400 text-[#082b3a]">
            <ShieldCheck />
          </div>
          {!collapsed && (
            <div>
              <p className="font-semibold tracking-wide">
                NLAMS <span className="text-teal-300">2.0</span>
              </p>
              <p className="text-[10px] uppercase tracking-[.18em] text-slate-300">
                Government of India
              </p>
            </div>
          )}
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {nav.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${pathname === href ? "bg-teal-400/15 text-teal-200" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-3 right-3 rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
          {!collapsed && (
            <>
              <p className="font-medium text-white">Secure workspace</p>
              <p className="mt-1">Role: {ROLE_LABELS[role]}</p>
              {user.district && <p className="mt-0.5">District: {user.district}</p>}
            </>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-[margin] ${collapsed ? "lg:ml-[76px]" : "lg:ml-[250px]"}`}>
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-7">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden lg:inline-flex" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
              <PanelLeft />
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu />
            </Button>
            <div className="hidden text-sm text-slate-500 sm:block">
              National Land Acquisition & Management System
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden border-teal-200 bg-teal-50 text-teal-700 sm:inline-flex">
              {ROLE_LABELS[role]}
            </Badge>
            <Button variant="ghost" size="icon" className="relative">
              <Bell />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-amber-500" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" className="gap-2 px-2" />}>
                <span className="grid size-8 place-items-center rounded-full bg-[#dceff0] text-sm font-semibold text-[#0b5664]">
                  {initials}
                </span>
                <ChevronDown className="size-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs font-normal text-slate-500">
                    {user.email}
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile settings</DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 lg:p-7">{children}</main>
      </div>
    </div>
  )
}

// ─── Shared layout pieces ─────────────────────────────────────
function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[.18em] text-teal-700">{eyebrow}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-[#123746] lg:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  )
}

function Kpi({ label, value, note, icon: Icon, children }: { label: string; value: string; note: string; icon: typeof Map; children?: React.ReactNode }) {
  return (
    <Card className="border-slate-200 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#123746]">{value}</p>
          </div>
          <div className="rounded-lg bg-[#e6f2f2] p-2 text-teal-700">
            <Icon className="size-4" />
          </div>
        </div>
        {children ?? <p className="mt-2 text-xs text-slate-500">{note}</p>}
      </CardContent>
    </Card>
  )
}

function MapCard() {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-none">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-base text-[#123746]">Acquisition overview</CardTitle>
          <CardDescription>Live spatial status across active projects</CardDescription>
        </div>
        <Badge variant="outline" className="gap-1 border-teal-200 bg-teal-50 text-teal-700">
          <span className="size-1.5 rounded-full bg-teal-500" /> GIS Map
        </Badge>
      </CardHeader>
      <CardContent>
        <div
          className="relative min-h-[310px] overflow-hidden rounded-lg bg-cover bg-center"
          style={{ backgroundImage: "url('/satellite_map.jpg')" }}
        >
          <svg className="absolute inset-0 size-full" viewBox="0 0 800 400" preserveAspectRatio="none">
            {/* Acquired Parcel */}
            <polygon points="120,100 240,90 280,160 170,190" fill="rgba(16, 185, 129, 0.45)" stroke="#10b981" strokeWidth="2" />
            {/* In Progress Parcel */}
            <polygon points="410,210 550,230 510,310 380,270" fill="rgba(245, 158, 11, 0.45)" stroke="#f59e0b" strokeWidth="2" />
            {/* Disputed Parcel */}
            <polygon points="580,70 710,80 690,150 600,160" fill="rgba(239, 68, 68, 0.45)" stroke="#ef4444" strokeWidth="2" />
            {/* Simulated Restricted Zone overlay (e.g. Forest) */}
            <polygon points="630,40 760,50 740,130 630,110" fill="url(#diagonalHatch)" stroke="#000" strokeWidth="1" opacity="0.3" />
            <defs>
              <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="8" height="8">
                <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#000" strokeWidth="1" />
              </pattern>
            </defs>
          </svg>

          <div className="absolute bottom-3 left-3 rounded-lg border border-white/70 bg-white/95 p-3 text-xs shadow-sm">
            <p className="mb-2 font-medium text-slate-700">Parcel status</p>
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-emerald-500" />Acquired</span>
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-amber-500" />In progress</span>
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-red-500" />Disputed</span>
            </div>
          </div>
          <p className="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-1 text-[10px] text-slate-700 shadow-sm">Realistic Satellite GIS Render</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Utility formatters ───────────────────────────────────────
function fmtHectares(n: number) { return n.toLocaleString("en-IN") + " ha" }
function fmtINR(n: number) {
  if (n >= 1e7) return "₹" + (n / 1e7).toFixed(0) + " Cr"
  if (n >= 1e5) return "₹" + (n / 1e5).toFixed(1) + " L"
  return "₹" + n.toLocaleString("en-IN")
}
function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}
function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return fmtDate(iso)
}
function riskBand(score: number | null): string {
  if (score === null) return "N/A"
  if (score < 30) return "Low"
  if (score < 70) return "Medium"
  return "High"
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD — fetches real KPIs from /api/dashboard/summary
// ═══════════════════════════════════════════════════════════════
function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [filterState, setFilterState] = useState("all")
  const [filterDistrict, setFilterDistrict] = useState("all")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterState !== "all") params.set("state", filterState)
      if (filterDistrict !== "all") params.set("district", filterDistrict)
      const qs = params.toString() ? `?${params}` : ""

      const [s, p] = await Promise.all([
        api.get<DashboardSummary>(`/dashboard/summary${qs}`),
        api.get<Proposal[]>("/proposals"),
      ])
      setSummary(s)
      setProposals(p)
    } catch (err) {
      console.error("Dashboard fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [filterState, filterDistrict])

  useEffect(() => { fetchData() }, [fetchData])

  // Extract unique states/districts for filter dropdowns
  const states = [...new Set(proposals.map((p) => p.state))].sort()
  const districts = [...new Set(proposals.map((p) => p.district))].sort()

  const roleLabel = user ? ROLE_LABELS[user.role] : "Overview"

  if (loading || !summary) {
    return (
      <>
        <PageHeading eyebrow={`${roleLabel} / Overview`} title="National Dashboard" description="Loading..." />
        <div className="flex items-center justify-center py-20"><Spinner className="size-8 text-teal-700" /></div>
      </>
    )
  }

  const compPct = summary.compensation_assessed > 0
    ? Math.round((summary.compensation_paid / summary.compensation_assessed) * 100)
    : 0

  return (
    <>
      <PageHeading
        eyebrow={`${roleLabel} / Overview`}
        title="National Dashboard"
        description="A consolidated view of land acquisition progress and compliance."
        action={<Button className="bg-[#0b5664] hover:bg-[#083f4a]"><FileCheck2 data-icon="inline-start" /> Download report</Button>}
      />

      {/* Filters */}
      <div className="mb-5 grid gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-3">
        <Select value={filterState} onValueChange={(v) => setFilterState(v || "all")}>
          <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterDistrict} onValueChange={(v) => setFilterDistrict(v || "all")}>
          <SelectTrigger><SelectValue placeholder="District" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All districts</SelectItem>
            {districts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger><SelectValue placeholder="Project" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {proposals.map((p) => <SelectItem key={p.id} value={p.id}>{p.project_name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* KPIs + Map */}
      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <MapCard />
        <div className="grid gap-4 sm:grid-cols-2">
          <Kpi label="Area notified" value={fmtHectares(summary.area_notified_hectares)} note={`Across ${summary.total_proposals} active projects`} icon={Map} />
          <Kpi label="Area acquired" value={fmtHectares(summary.area_acquired_hectares)} note={`${summary.area_notified_hectares > 0 ? ((summary.area_acquired_hectares / summary.area_notified_hectares) * 100).toFixed(1) : 0}% of notified area`} icon={Check} />
          <Kpi label="Families displaced" value={summary.families_displaced.toLocaleString("en-IN")} note={`${summary.disputed_count} disputed`} icon={Users} />
          <Kpi label="R&R completion" value={`${summary.rr_completion_pct}%`} note={`${summary.possession_count} in possession`} icon={ShieldCheck} />
          <Kpi label="Proposals in dispute" value={summary.disputed_count.toString()} note="Active dispute cases" icon={Flag} />
          <Kpi label="Compensation paid" value={fmtINR(summary.compensation_paid)} note={`of ${fmtINR(summary.compensation_assessed)} assessed`} icon={Building2}>
            <Progress value={compPct} className="mt-3 h-2" />
            <p className="mt-2 text-xs text-slate-500">{compPct}% released to beneficiaries</p>
          </Kpi>
        </div>
      </div>

      {/* Projects table */}
      <Card className="mt-5 border-slate-200 shadow-none">
        <CardHeader>
          <CardTitle className="text-base text-[#123746]">Active projects</CardTitle>
          <CardDescription>Projects requiring monitoring attention</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>State</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Land area</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-slate-400 py-8">No proposals found</TableCell></TableRow>
              ) : (
                proposals.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-slate-700">{p.project_name}</TableCell>
                    <TableCell>{p.state}</TableCell>
                    <TableCell>{p.district}</TableCell>
                    <TableCell>{fmtHectares(p.area_hectares)}</TableCell>
                    <TableCell><Status>{STAGE_LABELS[p.stage]}</Status></TableCell>
                    <TableCell><Status>{p.litigation_risk_band || riskBand(p.litigation_risk_score)}</Status></TableCell>
                    <TableCell className="text-right text-slate-500">{fmtRelative(p.updated_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// SCRUTINY PANEL — shown inside Workbench when a proposal is expanded
// ═══════════════════════════════════════════════════════════════
function Scrutiny({ proposal, onTransition }: { proposal: Proposal; onTransition: () => void }) {
  const [transitioning, setTransitioning] = useState(false)
  const [error, setError] = useState("")
  const [report, setReport] = useState<ScrutinyReport | null>(null)
  const [loadingReport, setLoadingReport] = useState(true)
  const [triggering, setTriggering] = useState(false)

  const nextStages = TRANSITIONS[proposal.stage] || []

  const fetchReport = useCallback(async () => {
    setLoadingReport(true)
    try {
      const data = await api.get<ScrutinyReport>(`/proposals/${proposal.id}/scrutiny`)
      setReport(data)
    } catch (err: any) {
      if (err.status !== 404) {
        setError("Failed to fetch report")
      }
    } finally {
      setLoadingReport(false)
    }
  }, [proposal.id])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  async function handleTrigger() {
    setTriggering(true)
    setError("")
    try {
      const data = await api.post<ScrutinyReport>(`/proposals/${proposal.id}/scrutinize`)
      setReport(data)
    } catch (err: any) {
      setError(err.message || "Failed to run AI Scrutiny")
    } finally {
      setTriggering(false)
    }
  }

  async function handleTransition(toStage: ProposalStage) {
    setTransitioning(true)
    setError("")
    try {
      await api.patch(`/proposals/${proposal.id}/transition`, { to_stage: toStage })
      onTransition()
    } catch (err: any) {
      setError(err.message || "Transition failed")
    } finally {
      setTransitioning(false)
    }
  }

  return (
    <div className="grid gap-3 border-t border-slate-200 bg-slate-50/70 p-4 lg:grid-cols-3">
      {loadingReport ? (
        <div className="col-span-3 flex justify-center py-6">
          <Spinner />
        </div>
      ) : !report ? (
        <div className="col-span-3 flex flex-col items-center justify-center gap-4 py-6">
          <p className="text-sm text-slate-500">No AI Scrutiny run yet for this proposal.</p>
          <Button onClick={handleTrigger} disabled={triggering} className="bg-[#0b5664] hover:bg-[#083f4a]">
            {triggering ? <Spinner className="mr-2 text-white size-4" /> : <ShieldCheck data-icon="inline-start" />}
            {triggering ? "Running AI Agents..." : "Run AI Scrutiny"}
          </Button>
        </div>
      ) : (
        <>
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><Gavel className="size-4 text-teal-700" /> Legal Scrutinizer</span>
                <Status>{report.legal_result.status}</Status>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600">
              <p className={`mb-2 font-medium ${report.legal_result.status === 'PASS' ? 'text-emerald-700' : 'text-red-700'}`}>
                {report.legal_result.status === 'PASS' ? 'Passed — Verification complete' : 'Flagged — Discrepancies found'}
              </p>
              {report.legal_result.flags && report.legal_result.flags.length > 0 ? (
                <ul className="flex flex-col gap-1 mt-2">
                  {report.legal_result.flags.map((f: string, i: number) => <li key={i}>• {f}</li>)}
                </ul>
              ) : (
                <p>{report.legal_result.details}</p>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><Map className="size-4 text-teal-700" /> Geospatial Analyzer</span>
                <Status>{report.geospatial_result.status}</Status>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600">
              <p className={`mb-2 font-medium ${report.geospatial_result.status === 'PASS' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {report.geospatial_result.reason || report.geospatial_result.summary}
              </p>
              {report.geospatial_result.overlapping_parcels && report.geospatial_result.overlapping_parcels.length > 0 && (
                <ul className="flex flex-col gap-1 mt-2">
                  {report.geospatial_result.overlapping_parcels.map((o: any, i: number) => (
                    <li key={i}>• {o.zone_name} overlap on Parcel {o.parcel_id || 'Unknown'}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><Users className="size-4 text-teal-700" /> R&amp;R Calculator</span>
                <Status>{report.rr_result.status}</Status>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600">
              <p className={`mb-2 font-medium ${report.rr_result.status === 'PASS' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {report.rr_result.policy_notes || report.rr_result.summary}
              </p>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between"><span>Est. Total Compensation</span><b className="text-emerald-700 font-mono">₹{(report.rr_result.total_proposal_compensation || 0).toLocaleString('en-IN')}</b></div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {error && (
        <div className="lg:col-span-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {nextStages.length > 0 && (
        <div className="lg:col-span-3 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3">
            {nextStages.map((stage) => (
              <Button
                key={stage}
                className="bg-[#0b5664] hover:bg-[#083f4a]"
                disabled={transitioning || loadingReport}
                onClick={() => handleTransition(stage)}
              >
                {transitioning ? <Spinner className="mr-2 size-4 text-white" /> : <Check data-icon="inline-start" />}
                {stage === "DISPUTED" ? "Mark as Disputed" : `Advance to ${STAGE_LABELS[stage]}`}
              </Button>
            ))}
          </div>
          {report && (
             <Button variant="outline" size="sm" onClick={handleTrigger} disabled={triggering}>
               {triggering ? <Spinner className="mr-2 size-4" /> : null}
               Re-run Scrutiny
             </Button>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// REQUIRING BODY PANEL — shown inside Workbench for uploading docs
// ═══════════════════════════════════════════════════════════════
function RequiringBodyPanel({ proposal }: { proposal: Proposal }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("")

  const [parcelForm, setParcelForm] = useState({ owner_name: "", claimed_area: "", geojson: "" })
  const [submittingParcel, setSubmittingParcel] = useState(false)
  const [parcelStatus, setParcelStatus] = useState("")

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setUploadStatus("")
    try {
      await api.upload("/documents", file, { proposal_id: proposal.id, doc_type: "TITLE_DEED" })
      setUploadStatus("Title Deed uploaded successfully!")
      setFile(null)
    } catch (err: any) {
      setUploadStatus(err.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  async function handleParcelSubmit() {
    if (!parcelForm.geojson || !parcelForm.owner_name) return
    setSubmittingParcel(true)
    setParcelStatus("")
    try {
      const geojsonObj = JSON.parse(parcelForm.geojson)
      await api.post("/parcels", {
        proposal_id: proposal.id,
        owner_name: parcelForm.owner_name,
        claimed_area_sqm: parcelForm.claimed_area ? parseFloat(parcelForm.claimed_area) : null,
        geojson_polygon: geojsonObj
      })
      setParcelStatus("Parcel boundary submitted successfully!")
      setParcelForm({ owner_name: "", claimed_area: "", geojson: "" })
    } catch (err: any) {
      setParcelStatus(err.message || "Failed to submit parcel. Ensure valid GeoJSON.")
    } finally {
      setSubmittingParcel(false)
    }
  }

  return (
    <div className="grid gap-3 border-t border-slate-200 bg-slate-50/70 p-4 lg:grid-cols-2">
      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm"><FileText className="size-4 text-teal-700" /> Upload Statutory Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-slate-500">Upload the Title Deed for AI Scrutiny.</div>
          <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <Button onClick={handleUpload} disabled={!file || uploading} className="w-full bg-[#0b5664] hover:bg-[#083f4a]">
            {uploading ? <Spinner className="mr-2 size-4 text-white" /> : <Upload className="mr-2 size-4" />} Upload Title Deed
          </Button>
          {uploadStatus && <p className={`text-xs ${uploadStatus.includes('success') ? 'text-emerald-700' : 'text-red-700'}`}>{uploadStatus}</p>}
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm"><MapPin className="size-4 text-teal-700" /> Submit Parcel Boundary (GPS)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Owner Name" value={parcelForm.owner_name} onChange={(e) => setParcelForm({ ...parcelForm, owner_name: e.target.value })} />
            <Input type="number" placeholder="Area (sqm)" value={parcelForm.claimed_area} onChange={(e) => setParcelForm({ ...parcelForm, claimed_area: e.target.value })} />
          </div>
          <Textarea 
            placeholder='Paste GeoJSON Polygon (e.g. { "type": "Polygon", "coordinates": [...] })' 
            className="h-24 font-mono text-xs" 
            value={parcelForm.geojson} 
            onChange={(e) => setParcelForm({ ...parcelForm, geojson: e.target.value })} 
          />
          <Button onClick={handleParcelSubmit} disabled={!parcelForm.geojson || !parcelForm.owner_name || submittingParcel} className="w-full bg-[#0b5664] hover:bg-[#083f4a]">
            {submittingParcel ? <Spinner className="mr-2 size-4 text-white" /> : <MapPin className="mr-2 size-4" />} Submit Parcel
          </Button>
          {parcelStatus && <p className={`text-xs ${parcelStatus.includes('success') ? 'text-emerald-700' : 'text-red-700'}`}>{parcelStatus}</p>}
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// WORKBENCH — CALA's view of proposals needing review
// ═══════════════════════════════════════════════════════════════
function Workbench() {
  const { user } = useAuth()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<string | null>(null)

  const fetchProposals = useCallback(async () => {
    try {
      const data = await api.get<Proposal[]>("/proposals")
      setProposals(data)
    } catch (err) {
      console.error("Failed to fetch proposals:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProposals() }, [fetchProposals])

  const roleLabel = user ? ROLE_LABELS[user.role] : "CALA"

  return (
    <>
      <PageHeading
        eyebrow={roleLabel}
        title={user?.role === 'REQUIRING_BODY' ? "Documents & Parcels" : "CALA Workbench"}
        description={user?.role === 'REQUIRING_BODY' ? "Submit acquisition documents and GPS boundaries." : "Review proposals, scrutiny findings, and statutory compliance before approval."}
        action={<Button variant="outline"><Search data-icon="inline-start" /> Search proposals</Button>}
      />
      <Card className="border-slate-200 shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-[#123746]">Proposals</CardTitle>
              <CardDescription>
                {loading ? "Loading..." : `${proposals.length} proposals in your scope`}
              </CardDescription>
            </div>
            {!loading && <Status>{`${proposals.length} total`}</Status>}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12"><Spinner /></div>
          ) : proposals.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">No proposals found</div>
          ) : (
            proposals.map((p) => (
              <Collapsible key={p.id} open={open === p.id} onOpenChange={(v) => setOpen(v ? p.id : null)}>
                <div className="border-t border-slate-200">
                  <CollapsibleTrigger className="flex w-full items-center gap-3 p-4 text-left hover:bg-slate-50">
                    <span className="grid size-8 place-items-center rounded-lg bg-teal-50 text-teal-700">
                      <FileText className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-800">{p.project_name}</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {p.district}, {p.state} · {fmtHectares(p.area_hectares)}
                      </span>
                    </span>
                    <Status>{STAGE_LABELS[p.stage]}</Status>
                    <span className="hidden text-xs text-slate-500 sm:block">{fmtDate(p.created_at)}</span>
                    {open === p.id ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {user?.role === 'REQUIRING_BODY' ? (
                      <RequiringBodyPanel proposal={p} />
                    ) : (
                      <Scrutiny proposal={p} onTransition={fetchProposals} />
                    )}
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))
          )}
        </CardContent>
      </Card>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// SUBMIT PROPOSAL — form wired to POST /api/proposals
// ═══════════════════════════════════════════════════════════════
function SubmitProposal() {
  const router = useRouter()
  const [form, setForm] = useState({ project_name: "", state: "", district: "", area_hectares: "", justification: "" })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit() {
    setError("")
    if (!form.project_name || !form.state || !form.district || !form.area_hectares) {
      setError("Please fill all required fields.")
      return
    }
    setSubmitting(true)
    try {
      await api.post("/proposals", {
        project_name: form.project_name,
        state: form.state,
        district: form.district,
        area_hectares: parseFloat(form.area_hectares),
        justification: form.justification || null,
      })
      setSuccess(true)
      setTimeout(() => router.push("/workbench"), 1500)
    } catch (err: any) {
      setError(err.message || "Submission failed")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="Requiring Body Portal"
        title="Submit acquisition proposal"
        description="Start a compliant land acquisition request for review by the district authority."
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card className="border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle className="text-base text-[#123746]">Project details</CardTitle>
            <CardDescription>Provide the project information and statutory documents.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}
            {success && (
              <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Proposal submitted successfully! Redirecting to workbench...
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Project name *
                <Input placeholder="e.g. NH-48 Expansion — Package IV" value={form.project_name} onChange={(e) => update("project_name", e.target.value)} />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Land area (hectares) *
                <Input type="number" placeholder="0.00" value={form.area_hectares} onChange={(e) => update("area_hectares", e.target.value)} />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                State *
                <Select value={form.state} onValueChange={(v) => update("state", v || "")}>
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                    <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                    <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                    <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                  </SelectContent>
                </Select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                District *
                <Select value={form.district} onValueChange={(v) => update("district", v || "")}>
                  <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pune">Pune</SelectItem>
                    <SelectItem value="Nagpur">Nagpur</SelectItem>
                    <SelectItem value="Bengaluru Urban">Bengaluru Urban</SelectItem>
                    <SelectItem value="Jaipur">Jaipur</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Project justification
              <Textarea placeholder="Describe the public purpose and need for acquisition..." value={form.justification} onChange={(e) => update("justification", e.target.value)} />
            </label>

            <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-7 text-center">
              <Upload className="mx-auto size-7 text-teal-700" />
              <p className="mt-3 text-sm font-medium text-slate-700">Drop documents and GPS polygon here</p>
              <p className="mt-1 text-xs text-slate-500">PDF, DOCX, KML or GeoJSON · Maximum 25 MB per file</p>
              <Button variant="outline" className="mt-4">Browse files</Button>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" disabled={submitting}>Save as draft</Button>
              <Button className="bg-[#0b5664] hover:bg-[#083f4a]" disabled={submitting} onClick={handleSubmit}>
                {submitting ? <><Spinner className="mr-2 size-4 text-white" /> Submitting...</> : "Submit for scrutiny"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stage stepper sidebar */}
        <Card className="h-fit border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle className="text-base text-[#123746]">Acquisition stages</CardTitle>
            <CardDescription>Track the statutory journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-0">
              {STAGE_ORDER.map((stage, i) => (
                <div key={stage} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`grid size-7 place-items-center rounded-full text-xs font-semibold ${i === 0 ? "bg-teal-700 text-white" : "border border-slate-300 bg-white text-slate-400"}`}>
                      {i + 1}
                    </span>
                    {i < STAGE_ORDER.length - 1 && <span className="h-8 w-px bg-slate-200" />}
                  </div>
                  <div className="pt-1 text-sm text-slate-700">
                    {STAGE_LABELS[stage]}
                    {i === 0 && <span className="ml-2 text-xs text-teal-700">Current</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// FIELD SURVEY — wired to document upload API
// ═══════════════════════════════════════════════════════════════
function FieldSurvey() {
  const [checks, setChecks] = useState([false, false, false])
  const [uploads, setUploads] = useState<{ name: string; status: string }[]>([])
  const [uploading, setUploading] = useState(false)

  async function handleFileCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploads((u) => [...u, { name: file.name, status: "Pending" }])
    try {
      // For the prototype, we need a proposal_id. In a real flow, the surveyor
      // would be assigned to a specific proposal. Using the demo proposal for now.
      await api.upload("/documents", file, {
        proposal_id: "a1111111-1111-1111-1111-111111111111",
        doc_type: "SURVEY_PHOTO",
      })
      setUploads((u) => u.map((f) => f.name === file.name ? { ...f, status: "Synced" } : f))
    } catch {
      setUploads((u) => u.map((f) => f.name === file.name ? { ...f, status: "Failed" } : f))
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="Field Surveyor"
        title="Survey queue"
        description="Capture evidence, verify parcel details, and sync when connectivity is available."
        action={<Status>Offline-ready</Status>}
      />
      <div className="mx-auto max-w-2xl">
        <Card className="border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle className="text-base text-[#123746]">Assigned parcel</CardTitle>
            <CardDescription>NH-48 Expansion · Haveli, Pune</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {/* Camera capture */}
            <label className="cursor-pointer">
              <div className="flex h-32 flex-col items-center justify-center gap-3 rounded-lg bg-[#0b5664] text-base text-white hover:bg-[#083f4a]">
                <Camera className="size-9" />
                {uploading ? "Uploading..." : "Capture site photograph"}
              </div>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileCapture} />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Auto-filled GPS coordinates
              <Input readOnly value="18.5204° N, 73.8567° E" />
            </label>

            {/* Verification checklist */}
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="mb-3 text-sm font-medium text-slate-800">Verification checklist</p>
              <div className="flex flex-col gap-3">
                {["Boundary markers visible", "Occupant identity verified", "Crop / asset details captured"].map((label, i) => (
                  <label key={label} className="flex items-center gap-3 text-sm text-slate-600">
                    <Checkbox checked={checks[i]} onCheckedChange={(v) => setChecks((c) => c.map((x, j) => (j === i ? !!v : x)))} />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Upload queue */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-800">Upload queue</p>
                <Badge variant="secondary">{uploads.length} files</Badge>
              </div>
              <div className="flex flex-col gap-2">
                {uploads.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">No files captured yet</p>
                ) : (
                  uploads.map((f) => (
                    <div key={f.name} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                      <span className="flex items-center gap-2 text-sm text-slate-600">
                        <FileText className="size-4 text-slate-400" />{f.name}
                      </span>
                      <Status>{f.status}</Status>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button variant="outline" className="h-12">
              <Globe2 data-icon="inline-start" />
              Sync pending items
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// MY LAND — Citizen portal: compensation, objections, parcels
// ═══════════════════════════════════════════════════════════════
function MyLand() {
  const { user } = useAuth()
  const [dialog, setDialog] = useState(false)
  const [compensation, setCompensation] = useState<Compensation[]>([])
  const [objections, setObjections] = useState<Objection[]>([])
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [loading, setLoading] = useState(true)
  const [objReason, setObjReason] = useState("")
  const [objSubmitting, setObjSubmitting] = useState(false)
  const [objError, setObjError] = useState("")
  const [objSuccess, setObjSuccess] = useState(false)

  // The demo proposal ID — in production, this would come from the citizen's linked parcels
  const demoProposalId = "a1111111-1111-1111-1111-111111111111"

  const fetchData = useCallback(async () => {
    try {
      const [comp, objs, parcData] = await Promise.all([
        api.get<Compensation[]>(`/compensation/proposal/${demoProposalId}`),
        api.get<Objection[]>("/objections/mine"),
        api.get<Parcel[]>(`/parcels/proposal/${demoProposalId}`),
      ])
      setCompensation(comp)
      setObjections(objs)
      setParcels(parcData)
    } catch (err) {
      console.error("MyLand fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleObjection() {
    setObjError("")
    if (!objReason.trim()) { setObjError("Please provide a reason."); return }
    setObjSubmitting(true)
    try {
      await api.post("/objections", { proposal_id: demoProposalId, reason: objReason })
      setObjSuccess(true)
      setObjReason("")
      setTimeout(() => { setDialog(false); setObjSuccess(false); fetchData() }, 1200)
    } catch (err: any) {
      setObjError(err.message || "Failed to submit")
    } finally {
      setObjSubmitting(false)
    }
  }

  // Compute total compensation
  const totalAssessed = compensation.reduce((s, c) => s + Number(c.assessed_amount), 0)
  const totalPaid = compensation.reduce((s, c) => s + Number(c.paid_amount), 0)
  const compStatus = compensation.length > 0 ? compensation[0].status : "ASSESSED"

  // Determine timeline from proposal stage — fetch proposal to get stage
  const [proposal, setProposal] = useState<Proposal | null>(null)
  useEffect(() => {
    api.get<Proposal>(`/proposals/${demoProposalId}`).then(setProposal).catch(() => {})
  }, [])

  const stageIndex = proposal ? STAGE_ORDER.indexOf(proposal.stage) : -1
  const timelineSteps: [string, string, boolean][] = STAGE_ORDER.map((stage, i) => [
    STAGE_LABELS[stage],
    i <= stageIndex ? fmtDate(proposal?.updated_at || new Date().toISOString()) : "Pending",
    i <= stageIndex,
  ])

  if (loading) {
    return (
      <>
        <PageHeading eyebrow="Citizen Services" title="Your land parcel" description="Loading..." />
        <div className="flex items-center justify-center py-20"><Spinner className="size-8 text-teal-700" /></div>
      </>
    )
  }

  return (
    <>
      <PageHeading eyebrow="Citizen Services" title="Your land parcel" description="Simple, transparent updates about your land acquisition case." />
      <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg text-[#123746]">
              {parcels.length > 0 ? `Parcel ${parcels[0].ulpin || parcels[0].id.slice(0, 8)}` : "Your Parcel"}
            </CardTitle>
            <CardDescription>
              {parcels.length > 0 ? `Owner: ${parcels[0].owner_name || "—"}` : "No parcel data"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Timeline */}
            <div className="flex flex-col gap-0">
              {timelineSteps.map(([title, date, done], i) => (
                <div key={title} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`grid size-8 place-items-center rounded-full ${done ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {done ? <Check className="size-4" /> : <span className="size-2 rounded-full bg-amber-500" />}
                    </span>
                    {i < timelineSteps.length - 1 && <span className="h-10 w-px bg-slate-200" />}
                  </div>
                  <div className="pb-5">
                    <p className="text-sm font-medium text-slate-800">{title}</p>
                    <p className="mt-1 text-xs text-slate-500">{date}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Objection dialog */}
            <Dialog open={dialog} onOpenChange={setDialog}>
              <DialogTrigger render={<Button variant="outline" className="mt-2 w-full" />}>File an objection</DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>File an objection</DialogTitle>
                  <DialogDescription>Tell us what needs to be corrected in your parcel record.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  {objError && <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{objError}</div>}
                  {objSuccess && <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Objection submitted!</div>}
                  <label className="flex flex-col gap-2 text-sm font-medium">
                    Reason for objection *
                    <Textarea placeholder="Describe your concern..." value={objReason} onChange={(e) => setObjReason(e.target.value)} />
                  </label>
                  <Button className="bg-[#0b5664] hover:bg-[#083f4a]" disabled={objSubmitting} onClick={handleObjection}>
                    {objSubmitting ? "Submitting..." : "Submit objection"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Objection history */}
            {objections.length > 0 && (
              <div className="mt-5">
                <p className="mb-3 text-sm font-medium text-slate-800">Your objections</p>
                <div className="flex flex-col gap-2">
                  {objections.map((o) => (
                    <div key={o.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-700">{o.reason}</p>
                        <Status>{o.status}</Status>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">Filed {fmtDate(o.filed_at)}</p>
                      {o.resolution_notes && <p className="mt-1 text-xs text-emerald-700">Resolution: {o.resolution_notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="flex flex-col gap-5">
          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-base text-[#123746]">Compensation amount</CardTitle>
              <CardDescription>As per the latest award</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-[#123746]">{fmtINR(totalAssessed)}</p>
              <div className="mt-3">
                <Status>{compStatus}</Status>
                {totalPaid > 0 && <p className="mt-2 text-xs text-emerald-700">Paid: {fmtINR(totalPaid)}</p>}
                <p className="mt-2 text-xs text-slate-500">Payment will be credited to your registered account.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-[#e8f3f2] shadow-none">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-[#123746]">Need help?</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">Ask questions in your preferred language.</p>
              <Button variant="outline" className="mt-4 w-full border-teal-200 bg-white text-teal-800">
                <CircleHelp data-icon="inline-start" />View help centre
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Voice FAB */}
      <Button size="icon" className="fixed bottom-6 right-6 size-14 rounded-full bg-[#0b5664] shadow-lg hover:bg-[#083f4a]" aria-label="Ask in Hindi Marathi Telugu">
        <Mic className="size-5" />
      </Button>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// ROOT COMPONENT — route → component mapping
// ═══════════════════════════════════════════════════════════════
export default function NlamsApp() {
  const pathname = usePathname()

  let content: React.ReactNode
  switch (pathname) {
    case "/workbench":
      content = <Workbench />
      break
    case "/submit-proposal":
      content = <SubmitProposal />
      break
    case "/field-survey":
      content = <FieldSurvey />
      break
    case "/my-land":
      content = <MyLand />
      break
    default:
      content = <Dashboard />
  }

  return <Shell>{content}</Shell>
}
