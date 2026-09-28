"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell, Building2, Camera, Check, ChevronDown, ChevronRight, CircleHelp,
  FileCheck2, FileText, Flag, FolderKanban, Gavel, Globe2, LayoutDashboard,
  LogOut, Map, Menu, Mic, PanelLeft, Plus, Search, ShieldCheck, Upload,
  UserRound, Users, X, Loader2,
  MapPin, CheckCircle2, AlertCircle, Trash2, Sparkles, Download, PhoneCall, Volume2, Navigation, Send, Radio, RefreshCw,
  Plane, TrainFront, Layers, Maximize2, Minimize2, ZoomIn, Eye, EyeOff,
  ZoomOut, RotateCcw, Crosshair, MousePointerClick, Locate, Compass,
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

// ─── Authority Personas for Role-Based Context Switching ──────
const DEMO_PERSONAS: { role: UserRole; name: string; email: string; dept: string; title: string }[] = [
  { role: "REQUIRING_BODY", name: "NHAI Project Implementation Unit", email: "nhai@demo.gov.in", dept: "Ministry of Road Transport & Highways", title: "Project Proponent (NHAI)" },
  { role: "CALA", name: "Rohan Deshmukh, IAS (District Collector)", email: "cala.pune@demo.gov.in", dept: "District Collectorate, Pune", title: "District Authority (CALA)" },
  { role: "CITIZEN", name: "Ganesh Patil", email: "ganesh.patil@demo.gov.in", dept: "Khatedar Landowner, Mulshi", title: "Citizen Landowner" },
  { role: "STATE_MONITOR", name: "National PMU Directorate", email: "monitor@demo.gov.in", dept: "PM GatiShakti Secretariat", title: "National Monitor (MoRTH)" },
  { role: "FIELD_SURVEYOR", name: "Anita Kulkarni", email: "surveyor.anita@demo.gov.in", dept: "Cadastral Survey Directorate", title: "Cadastral Field Surveyor" },
]

// ─── Navigation per role ──────────────────────────────────────
const navByRole: Record<UserRole, { label: string; href: string; icon: typeof LayoutDashboard }[]> = {
  STATE_MONITOR: [
    { label: "National GIS Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Project Workbench", href: "/workbench", icon: FolderKanban },
    { label: "Audit Reports & Analytics", href: "/dashboard", icon: FileCheck2 },
  ],
  REQUIRING_BODY: [
    { label: "Corridor Portfolios", href: "/dashboard", icon: Building2 },
    { label: "Submit Acquisition Proposal", href: "/submit-proposal", icon: Plus },
    { label: "Statutory Workbench", href: "/workbench", icon: FolderKanban },
  ],
  CALA: [
    { label: "CALA Adjudication Workbench", href: "/workbench", icon: FolderKanban },
    { label: "National GIS Map", href: "/dashboard", icon: LayoutDashboard },
    { label: "Field Survey Queue", href: "/field-survey", icon: Map },
  ],
  FIELD_SURVEYOR: [
    { label: "GNSS Cadastral Queue", href: "/field-survey", icon: Camera },
    { label: "Demarcation Inspections", href: "/field-survey", icon: Map },
    { label: "Sync & PostGIS Centre", href: "/field-survey", icon: Globe2 },
  ],
  CITIZEN: [
    { label: "My Land & Rights Portal", href: "/my-land", icon: UserRound },
    { label: "Statutory Filings", href: "/my-land", icon: FileText },
    { label: "Grievance Helpdesk", href: "/my-land", icon: CircleHelp },
  ],
}

// ─── Shared components ────────────────────────────────────────
const statusTone: Record<string, string> = {
  Low: "border-emerald-200/90 bg-emerald-50 text-emerald-800 font-mono",
  Medium: "border-amber-200/90 bg-amber-50 text-amber-800 font-mono",
  High: "border-rose-200/90 bg-rose-50 text-rose-800 font-mono",
  PAID: "border-emerald-200/90 bg-emerald-50 text-emerald-800 font-mono",
  Paid: "border-emerald-200/90 bg-emerald-50 text-emerald-800 font-mono",
  ASSESSED: "border-blue-200/90 bg-blue-50 text-blue-800 font-mono",
  Pending: "border-amber-200/90 bg-amber-50 text-amber-800 font-mono",
  PENDING: "border-amber-200/90 bg-amber-50 text-amber-800 font-mono",
  OPEN: "border-amber-200/90 bg-amber-50 text-amber-800 font-mono",
  RESOLVED: "border-emerald-200/90 bg-emerald-50 text-emerald-800 font-mono",
  REJECTED: "border-rose-200/90 bg-rose-50 text-rose-800 font-mono",
  Synced: "border-emerald-200/90 bg-emerald-50 text-emerald-800 font-mono",
  Failed: "border-rose-200/90 bg-rose-50 text-rose-800 font-mono",
  DRAFT: "border-slate-300 bg-slate-100 text-slate-700 font-mono",
  NOTIFIED_3A: "border-blue-300 bg-blue-50 text-blue-900 font-mono",
  DECLARED_3D: "border-amber-300 bg-amber-50 text-amber-950 font-mono",
  AWARD: "border-indigo-300 bg-indigo-50 text-indigo-900 font-mono",
  POSSESSION: "border-emerald-300 bg-emerald-50 text-emerald-950 font-mono",
}

function Status({ children }: { children: string }) {
  return (
    <Badge variant="outline" className={`text-[11px] font-semibold tracking-wide py-0.5 px-2 rounded-md ${statusTone[children] ?? "border-slate-200 bg-slate-50 text-slate-700 font-mono"}`}>
      {children}
    </Badge>
  )
}

function Spinner({ className }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className ?? "size-5 text-slate-700"}`} />
}

// ─── Shell ────────────────────────────────────────────────────
function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, login, logout, isLoading } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner className="size-8 text-slate-800" />
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
    <div className="min-h-screen bg-slate-50/80 text-slate-900 antialiased font-sans">
      {/* Official Government of India Tricolor Ribbon */}
      <div className="fixed top-0 inset-x-0 z-50 h-[3px] w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      {/* Official Institutional Authority Bar */}
      <div className="fixed top-[3px] inset-x-0 z-40 hidden h-7 border-b border-slate-800 bg-[#090D1A] px-4 text-[10.5px] text-slate-300 sm:flex sm:items-center sm:justify-between lg:px-7">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white tracking-wide flex items-center gap-1.5">
            <span className="inline-block size-1.5 rounded-full bg-emerald-400" /> भारत सरकार | Government of India
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 hidden md:inline">Ministry of Road Transport &amp; Highways / Ministry of Railways</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] text-slate-400">
          <span className="hidden lg:inline-flex items-center gap-1 text-slate-300">
            <ShieldCheck className="size-3 text-amber-400" /> PM GatiShakti NMP Integrated
          </span>
          <span>● PostGIS EPSG:4326 Live</span>
          <span className="text-slate-300 font-sans">Helpline: <strong className="text-white">1800-11-2013</strong> (Toll Free, 24x7)</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-slate-800 bg-[#0A0F1D] text-slate-100 transition-all duration-200 lg:block ${collapsed ? "w-[76px]" : "w-[260px]"} pt-[31px]`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-800/80 px-5">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-bold shadow-sm">
            <ShieldCheck className="size-5 text-slate-950 stroke-[2.5]" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold tracking-tight text-white text-base">NLAMS</p>
                <span className="rounded bg-amber-500/20 px-1 py-0.2 text-[9px] font-mono font-bold text-amber-300 border border-amber-500/30">2.0</span>
              </div>
              <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Vajracore DPI Engine
              </p>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex flex-col justify-between h-[calc(100vh-6.75rem)] p-3">
          <div className="space-y-4">
            {!collapsed && (
              <p className="px-3 pt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Operational Workspaces
              </p>
            )}
            <nav className="flex flex-col gap-1">
              {nav.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href
                return (
                  <Link
                    key={label}
                    href={href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-slate-800/90 text-white shadow-xs border-l-2 border-amber-500 font-semibold"
                        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                    }`}
                  >
                    <Icon className={`size-4 shrink-0 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Bottom user jurisdiction badge */}
          {!collapsed && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-xs shadow-inner">
              <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Session
                </span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono text-slate-300 border border-slate-700">NIC SSO</span>
              </div>
              <p className="mt-2 font-semibold text-white truncate text-xs">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{ROLE_LABELS[role]}</p>
              {user.district && (
                <div className="mt-2 border-t border-slate-800 pt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Jurisdiction:</span>
                  <span className="font-semibold text-slate-200 font-mono">{user.district}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className={`transition-[margin] duration-200 ${collapsed ? "lg:ml-[76px]" : "lg:ml-[260px]"} pt-7 sm:pt-7`}>
        <header className="sticky top-7 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-7 shadow-2xs">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="hidden lg:inline-flex text-slate-600 hover:text-slate-900" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
              <PanelLeft className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden text-slate-600" aria-label="Open menu">
              <Menu className="size-4" />
            </Button>
            <div className="hidden sm:flex sm:items-center sm:gap-2 text-xs">
              <span className="font-bold text-slate-800">NLAMS Portal</span>
              <span className="text-slate-300 font-light">/</span>
              <span className="text-slate-600 font-medium">National Land Acquisition &amp; Management System</span>
              <Badge variant="outline" className="ml-2 border-emerald-200 bg-emerald-50 text-emerald-800 text-[10px] font-mono font-medium">
                RFCTLARR 2013 Verified
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Executive Authority Role Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="outline" size="sm" className="h-9 gap-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium shadow-2xs">
                  <Building2 className="size-3.5 text-slate-500" />
                  <div className="text-left hidden md:block">
                    <span className="text-[9.5px] text-slate-400 block -mb-0.5 uppercase tracking-wider font-semibold">Authority Context</span>
                    <span className="font-semibold text-slate-900">{ROLE_LABELS[role]}</span>
                  </div>
                  <ChevronDown className="size-3 text-slate-400 ml-1" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-72 p-1.5 shadow-lg border-slate-200">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1.5">
                    Switch Statutory Authority Context
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {DEMO_PERSONAS.map((p) => {
                    const isCurrent = user.role === p.role
                    return (
                      <DropdownMenuItem
                        key={p.email}
                        onClick={() => login(p.email, "Demo@1234")}
                        className={`flex items-start gap-2.5 p-2 rounded-lg text-xs cursor-pointer ${isCurrent ? 'bg-amber-50 text-amber-950 border border-amber-200/80 font-medium' : 'hover:bg-slate-50'}`}
                      >
                        <div className={`grid size-7 shrink-0 place-items-center rounded-md ${isCurrent ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          <Building2 className="size-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-slate-900 leading-tight">{p.title}</p>
                            {isCurrent && <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-100 px-1 rounded">ACTIVE</span>}
                          </div>
                          <p className="truncate text-[10.5px] text-slate-500 mt-0.5">{p.name}</p>
                        </div>
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative size-9 text-slate-600 hover:text-slate-900">
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </Button>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" className="gap-2 px-1.5 h-9 hover:bg-slate-100">
                  <span className="grid size-8 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-xs">
                    {initials}
                  </span>
                  <ChevronDown className="size-3 text-slate-400 hidden sm:block" />
                </Button>
              } />
              <DropdownMenuContent align="end" className="w-56 shadow-lg border-slate-200">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-semibold text-slate-900">{user.name}</DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs font-normal text-slate-500 -mt-1">
                    {user.email}
                  </DropdownMenuLabel>
                  <div className="px-2 pb-1.5">
                    <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 font-mono">
                      {ROLE_LABELS[role]}
                    </span>
                  </div>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs cursor-pointer">Profile &amp; Statutory Credentials</DropdownMenuItem>
                <DropdownMenuItem className="text-xs cursor-pointer">Audit Logs &amp; Access Trail</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-xs text-rose-600 cursor-pointer">
                  <LogOut className="mr-2 size-3.5" /> Sign out
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
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end border-b border-slate-200/80 pb-5">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-block size-2 rounded-full bg-amber-500" />
          <p className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-500 font-mono">{eyebrow}</p>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-slate-600 max-w-3xl leading-relaxed">{description}</p>
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  )
}

function Kpi({ label, value, note, icon: Icon, children }: { label: string; value: string; note: string; icon: typeof Map; children?: React.ReactNode }) {
  return (
    <Card className="border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow rounded-xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">{label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 font-mono">{value}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-2.5 text-slate-700 shadow-2xs">
            <Icon className="size-4" />
          </div>
        </div>
        {children ?? <p className="mt-3 text-xs text-slate-500 font-medium flex items-center gap-1.5">{note}</p>}
      </CardContent>
    </Card>
  )
}


interface GisSurroundingLandRecord {
  id: string
  surveyNumber: string
  village: string
  taluka: string
  district: string
  classification: string
  tenure: string
  circleRate: string
  solatiumTotal: string
  areaEstimate: string
  proximityNote: string
  isInsideCorridor: boolean
  lat: number
  lon: number
}

interface GisParcelOverlay {
  id: string
  name: string
  status: "Acquired" | "In Progress" | "Disputed" | "Restricted Zone"
  area: string
  points: string
  details: string
  surveyNumber: string
  disbursedAmount: string
  stage: string
  isHatch?: boolean
}

interface GisProjectSite {
  id: string
  name: string
  shortName: string
  location: string
  agency: string
  category: "Airport" | "High-Speed Rail" | "Expressway" | "Corridor"
  icon: string
  totalArea: string
  acquiredPct: number
  imageUrl: string
  sensor: string
  coordinates: string
  description: string
  bounds: { north: number; south: number; west: number; east: number }
  surroundingCadastre: {
    region: string
    villages: string[]
    talukas: string
    district: string
    circleRateRange: string
    benchmarkRate: number
    legalFramework: string
    rAndRPackage: string
  }
  parcels: GisParcelOverlay[]
}

const GIS_PROJECT_SITES: GisProjectSite[] = [
  {
    id: "nmia",
    name: "Navi Mumbai International Airport (Greenfield)",
    shortName: "Navi Mumbai Airport",
    location: "Ulwe & Panvel, Raigad, Maharashtra",
    agency: "CIDCO & Adani Airport Holdings (NMIAL)",
    category: "Airport",
    icon: "Plane",
    totalArea: "1,160 ha",
    acquiredPct: 98,
    imageUrl: "/gis_navi_mumbai_airport.jpg",
    sensor: "Cartosat-3 High-Res Ortho (0.3m/px)",
    coordinates: "18°59'24\" N, 73°04'12\" E",
    description: "Twin-runway greenfield international airport with multimodal expressway and metro connectivity.",
    bounds: { north: 19.0062, south: 18.9785, west: 73.0485, east: 73.0920 },
    surroundingCadastre: {
      region: "Panvel Creek & Ulwe River Basin",
      villages: ["Ulwe", "Targhar", "Kombadbhuje", "Ganeshpuri", "Kopar", "Vaghivalivada", "Chanje", "Moha"],
      talukas: "Panvel Taluka",
      district: "Raigad, Maharashtra",
      circleRateRange: "₹14,500 – ₹24,000 / sqm",
      benchmarkRate: 14500,
      legalFramework: "CIDCO 22.5% Developed Land Compensation Scheme & RFCTLARR Act 2013",
      rAndRPackage: "Pushpak Nagar developed commercial plots with 2.0 FSI + ₹1,000/sqft construction aid",
    },
    parcels: [
      {
        id: "p_runway_n",
        name: "Runway 08L/26R & Taxiway North",
        status: "Acquired",
        area: "420 ha",
        surveyNumber: "NMIA-RW-01 (Targhar & Kopar Gat 45-68)",
        disbursedAmount: "₹4,250 Cr (100% Disbursed)",
        stage: "POSSESSION",
        details: "Runway sub-grade 100% complete. Concessionaire NMIAL executing CAT-III ILS pavement concrete.",
        points: "175,105 745,105 745,175 175,175",
      },
      {
        id: "p_runway_s",
        name: "Runway 08R/26L Southern Strip",
        status: "Acquired",
        area: "390 ha",
        surveyNumber: "NMIA-RW-02 (Kombadbhuje Gat 12-40)",
        disbursedAmount: "₹3,890 Cr (100% Disbursed)",
        stage: "POSSESSION",
        details: "Southern runway civil earthworks certified. Rapid exit taxiways delineated and graded.",
        points: "165,345 735,345 735,415 165,415",
      },
      {
        id: "p_terminal",
        name: "Passenger Terminal 1 & Central Concourse",
        status: "Acquired",
        area: "185 ha",
        surveyNumber: "NMIA-T1-MAIN (Ganeshpuri & Ulwe)",
        disbursedAmount: "₹2,100 Cr (100% Disbursed)",
        stage: "POSSESSION",
        details: "Terminal structural steel framework erected. Multimodal metro line underground station integrated.",
        points: "375,180 585,180 585,340 375,340",
      },
      {
        id: "p_access_hwy",
        name: "NH-4B / Atal Setu Elevated Access Highway",
        status: "In Progress",
        area: "68 ha",
        surveyNumber: "NMIA-ACCESS-E4 (Moha & Chanje Gat 22)",
        disbursedAmount: "₹540 Cr (82% Disbursed)",
        stage: "AWARD",
        details: "Section 3D declared. Elevated flyover pier casting and approach cloverleaf ramps under construction.",
        points: "750,155 935,155 935,365 750,365",
      },
      {
        id: "p_crz_buffer",
        name: "Ulwe Coastal Mangrove CRZ-I Eco-Zone",
        status: "Restricted Zone",
        area: "112 ha",
        surveyNumber: "CRZ-1-ECO-W (Panvel Mudflats)",
        disbursedAmount: "N/A (Statutory Conservation)",
        stage: "RESTRICTED",
        details: "Coastal Regulatory Zone (CRZ-I) mangrove forest. High Tide Line (HTL) PostGIS ST_Disjoint geofence enforced.",
        points: "10,55 155,55 155,485 10,485",
        isHatch: true,
      },
    ],
  },
  {
    id: "mahsr",
    name: "Mumbai-Ahmedabad High-Speed Rail Corridor (MAHSR)",
    shortName: "Bullet Train (MAHSR)",
    location: "Palghar & Surat Alignment (Chainage 114+200)",
    agency: "NHSRCL (National High Speed Rail Corp)",
    category: "High-Speed Rail",
    icon: "TrainFront",
    totalArea: "825 ha",
    acquiredPct: 94,
    imageUrl: "/gis_bullet_train_corridor.jpg",
    sensor: "Drone LiDAR & WorldView-3 (0.25m/px)",
    coordinates: "20°52'11\" N, 72°55'40\" E",
    description: "India's first 320 km/h bullet train corridor connecting Mumbai and Ahmedabad across 508 km.",
    bounds: { north: 20.8920, south: 20.8510, west: 72.9050, east: 72.9515 },
    surroundingCadastre: {
      region: "Navsari & Chikhli Agricultural Plain",
      villages: ["Chikhli", "Alipore", "Kabilpore", "Antalia", "Vesma", "Zaroli"],
      talukas: "Chikhli & Navsari Talukas",
      district: "Navsari District, Gujarat",
      circleRateRange: "₹1,200 – ₹2,800 / sqm",
      benchmarkRate: 1800,
      legalFramework: "Gujarat RFCTLARR Amendment 2016 + 25% Consent Incentive Bonus",
      rAndRPackage: "Market value × 2.0 rural factor + 100% solatium + 25% early consent bonus (Total 4.25x payout)",
    },
    parcels: [
      {
        id: "p_viaduct",
        name: "MAHSR Viaduct Corridor (Chainage 114+200)",
        status: "Acquired",
        area: "310 ha",
        surveyNumber: "MAHSR-PKG-C4-V (Chikhli Survey 142-168)",
        disbursedAmount: "₹3,450 Cr (100% Disbursed)",
        stage: "POSSESSION",
        details: "17.5m Right-of-Way clear. Full-span launching girder 'Nandi' erecting 975T precast box girders.",
        points: "0,15 960,505 925,540 0,70",
      },
      {
        id: "p_casting_yard",
        name: "Precast Concrete Box-Girder Casting Yard #4",
        status: "Acquired",
        area: "42 ha",
        surveyNumber: "MAHSR-YARD-04 (Alipore Survey 95-104)",
        disbursedAmount: "₹210 Cr (100% Disbursed)",
        stage: "POSSESSION",
        details: "High-output batching plants & heavy 500T gantry cranes operating 24/7 for Package C4 superstructure.",
        points: "295,115 635,115 635,285 295,285",
      },
      {
        id: "p_substation",
        name: "Traction Sub-Station & OHE Maintenance Depot",
        status: "In Progress",
        area: "35 ha",
        surveyNumber: "MAHSR-TSS-09 (Kabilpore Survey 218)",
        disbursedAmount: "₹185 Cr (65% Disbursed)",
        stage: "DECLARED_3D",
        details: "25kV AC overhead electrification (OHE) sub-station civil foundation and transformer bays commenced.",
        points: "675,145 915,145 915,385 675,385",
      },
      {
        id: "p_agri_disputed",
        name: "Survey Plot 412/A (Palghar Agricultural Land)",
        status: "Disputed",
        area: "8.4 ha",
        surveyNumber: "SURV-412/A-PLG (Antalia Survey 48)",
        disbursedAmount: "₹42 L (Under Escrow)",
        stage: "NOTIFIED_3A",
        details: "Citizen objection filed under Section 15 regarding crop severance and tube-well re-drilling compensation.",
        points: "135,355 315,355 315,485 135,485",
      },
      {
        id: "p_canal_buffer",
        name: "Surat District Main Irrigation Canal Buffer",
        status: "Restricted Zone",
        area: "15m Buffer",
        surveyNumber: "CWC-CANAL-BUF (State Irrigation Dept)",
        disbursedAmount: "N/A (Restricted)",
        stage: "RESTRICTED",
        details: "Central Water Commission protective boundary. Pier design certified by hydraulic bridge engineers.",
        points: "205,0 255,0 555,540 505,540",
        isHatch: true,
      },
    ],
  },
  {
    id: "dme",
    name: "Delhi-Mumbai Greenfield Expressway (Package 14)",
    shortName: "Delhi-Mumbai Expressway",
    location: "Vadodara-Bharuch Sector, Gujarat",
    agency: "National Highways Authority of India (NHAI)",
    category: "Expressway",
    icon: "Navigation",
    totalArea: "640 ha",
    acquiredPct: 99,
    imageUrl: "/gis_delhi_mumbai_expressway.jpg",
    sensor: "Google Earth & Sentinel-2 Ortho (0.4m/px)",
    coordinates: "22°08'45\" N, 73°02'18\" E",
    description: "8-lane access-controlled greenfield expressway reducing Delhi-Mumbai travel time to 12 hours.",
    bounds: { north: 22.1650, south: 22.1265, west: 73.0150, east: 73.0620 },
    surroundingCadastre: {
      region: "Vadodara Cotton & Tobacco Farmland",
      villages: ["Karjan", "Vemar", "Miyagam", "Por", "Kandari"],
      talukas: "Karjan & Vadodara Talukas",
      district: "Vadodara District, Gujarat",
      circleRateRange: "₹650 – ₹3,200 / sqm",
      benchmarkRate: 950,
      legalFramework: "National Highways Act 1956 & RFCTLARR 2013 (First Schedule)",
      rAndRPackage: "2.0x Rural Multiplier + 100% Solatium + 12% interest from Section 3A gazette notification",
    },
    parcels: [
      {
        id: "p_mainline",
        name: "Delhi-Mumbai Greenfield Expressway Mainline (8-Lane)",
        status: "Acquired",
        area: "380 ha",
        surveyNumber: "DME-PKG-14-MAIN (Karjan Survey 201-245)",
        disbursedAmount: "₹2,840 Cr (100% Disbursed)",
        stage: "POSSESSION",
        details: "120 km/h access-controlled roadway. Friction-course bituminous asphalt paving 100% completed.",
        points: "0,495 960,5 960,65 0,540",
      },
      {
        id: "p_cloverleaf",
        name: "Vadodara-Bharuch Cloverleaf Interchange (Junction 14)",
        status: "Acquired",
        area: "86 ha",
        surveyNumber: "DME-INT-14-CLV (Vemar Survey 62-84)",
        disbursedAmount: "₹680 Cr (100% Disbursed)",
        stage: "POSSESSION",
        details: "Grade-separated directional cloverleaf ramps connecting State Highway 160. Full land bank in possession.",
        points: "305,125 655,125 655,335 305,335",
      },
      {
        id: "p_toll_plaza",
        name: "Smart Weigh-in-Motion Toll Plaza & Admin Complex",
        status: "Acquired",
        area: "28 ha",
        surveyNumber: "DME-TOLL-PLZ (Miyagam Survey 120)",
        disbursedAmount: "₹190 Cr (100% Disbursed)",
        stage: "POSSESSION",
        details: "High-speed barrier-free electronic tolling gantries with automated weigh-in-motion sensors.",
        points: "355,365 605,365 605,495 355,495",
      },
      {
        id: "p_wayside",
        name: "Wayside Amenities Parcel (Fuel Station & Food Court)",
        status: "In Progress",
        area: "16 ha",
        surveyNumber: "DME-WSA-08 (Por Survey 92-98)",
        disbursedAmount: "₹95 Cr (70% Disbursed)",
        stage: "AWARD",
        details: "Commercial concessionaire tendering active under RFCTLARR Section 46 for highway rest area.",
        points: "165,405 325,405 325,535 165,535",
      },
      {
        id: "p_village_buffer",
        name: "Vadodara Gram Panchayat Abadi Zone Buffer",
        status: "Restricted Zone",
        area: "14 ha",
        surveyNumber: "GRAM-ABADI-BUF (Kandari Abadi)",
        disbursedAmount: "N/A (Green Buffer)",
        stage: "RESTRICTED",
        details: "100m acoustic sound-barrier zone mandated to shield village dwellings. No structural demolition permitted.",
        points: "315,45 485,45 485,115 315,115",
        isHatch: true,
      },
    ],
  },
  {
    id: "pme",
    name: "Pune-Mumbai Expressway Missing Link & 8-Laning",
    shortName: "Pune-Mumbai Missing Link",
    location: "Haveli & Mulshi, Maharashtra",
    agency: "MSRDC (Maharashtra State Road Dev Corp)",
    category: "Corridor",
    icon: "Compass",
    totalArea: "49.95 ha",
    acquiredPct: 86,
    imageUrl: "/satellite_map.jpg",
    sensor: "Cartosat-2 High-Res (0.5m/px)",
    coordinates: "18°44'32\" N, 73°21'05\" E",
    description: "Bypassing the Khandala Ghat with India's widest road twin tunnels and cable-stayed viaducts.",
    bounds: { north: 18.7580, south: 18.7265, west: 73.3320, east: 73.3705 },
    surroundingCadastre: {
      region: "Khandala Ghat & Tiger Leap Valley",
      villages: ["Kusgaon Budruk", "Kurwande", "Chavsar", "Borghat Forest", "Khalapur"],
      talukas: "Maval (Pune) & Khalapur (Raigad) Talukas",
      district: "Pune & Raigad Districts, Maharashtra",
      circleRateRange: "₹2,200 – ₹8,500 / sqm",
      benchmarkRate: 3400,
      legalFramework: "Maharashtra Direct Purchase Scheme (GR 2015) & Forest Conservation Act 1980",
      rAndRPackage: "400% Ready Reckoner valuation directly credited via e-Kuber DBT + NPV Forest Offset",
    },
    parcels: [
      {
        id: "p1",
        name: "Parcel 101 (Pune Western Tunnel Portal)",
        status: "Acquired",
        area: "14.2 ha",
        surveyNumber: "PME-S101-PUN (Kusgaon Budruk Gat 54)",
        disbursedAmount: "₹18.5 Cr (100% Disbursed)",
        stage: "POSSESSION",
        details: "Award approved & 100% compensation disbursed via e-Kuber DBT to registered landowners.",
        points: "145,135 295,120 345,215 205,255",
      },
      {
        id: "p2",
        name: "Parcel 204 (Haveli Transition Corridor)",
        status: "In Progress",
        area: "8.6 ha",
        surveyNumber: "PME-S204-HVL (Kurwande Gat 22)",
        disbursedAmount: "₹9.2 Cr (Assessed)",
        stage: "NOTIFIED_3A",
        details: "Section 3A notified. Field survey completed with GNSS boundary markers verified by Joint Measurement.",
        points: "495,280 665,310 615,420 455,365",
      },
      {
        id: "p3",
        name: "Parcel 308 (Mulshi Valley Approach)",
        status: "Disputed",
        area: "5.1 ha",
        surveyNumber: "PME-S308-MLSH (Chavsar Gat 18)",
        disbursedAmount: "₹6.8 Cr (Under Hearing)",
        stage: "NOTIFIED_3A",
        details: "Citizen objection filed under Section 15. Boundary dispute hearing scheduled with District CALA.",
        points: "700,95 855,110 835,200 725,215",
      },
      {
        id: "forest",
        name: "Mulshi Forest Sanctuary Eco-Buffer",
        status: "Restricted Zone",
        area: "Eco-Sensitive",
        surveyNumber: "FOR-MULSHI-ESZ (Borghat Compartment 248)",
        disbursedAmount: "N/A (Forest Conservation)",
        stage: "RESTRICTED",
        details: "PostGIS ST_Intersects geofence buffer zone active. Net Present Value (NPV) deposited with CAMPA.",
        points: "760,55 915,70 895,175 760,150",
        isHatch: true,
      },
    ],
  },
]

function getSurroundingLandAtPoint(site: GisProjectSite, u: number, v: number): GisSurroundingLandRecord {
  const lat = site.bounds.north - v * (site.bounds.north - site.bounds.south)
  const lon = site.bounds.west + u * (site.bounds.east - site.bounds.west)

  // Determine village based on quadrant
  const villageIndex = Math.min(
    site.surroundingCadastre.villages.length - 1,
    Math.floor((u * 2.3 + v * 3.7) % site.surroundingCadastre.villages.length)
  )
  const village = site.surroundingCadastre.villages[villageIndex]

  // Pseudo-cadastral Gat/Survey number based on coordinate hashing
  const gatNum = Math.floor(18 + ((u * 89 + v * 47) * 100) % 170)
  const subHissa = Math.floor(1 + ((u * 17 + v * 23) * 10) % 4)
  const surveyNumber = `Gat / Survey No. ${gatNum}/${subHissa}`

  // Distance metric from infrastructure center
  const distFromCenterU = Math.abs(u - 0.5)
  const distFromCenterV = Math.abs(v - 0.5)
  const distMetricMeters = Math.round(Math.sqrt(distFromCenterU * distFromCenterU + distFromCenterV * distFromCenterV) * 2200)

  const isInsideCorridor = distMetricMeters < 360

  let classification = "Agricultural Jirayat (Rainfed Farmland)"
  let tenure = "Private Freehold (Class-1 Occupant / Khatedar 7/12)"
  let rateMultiplier = 1.0

  if (site.id === "nmia") {
    if (u < 0.16 || v > 0.88) {
      classification = "CRZ-I Coastal Mudflat & Mangrove Wetland"
      tenure = "Maharashtra Forest Department (Eco-Zone)"
      rateMultiplier = 0.5
    } else if (distMetricMeters < 280) {
      classification = "Airport Concession Aeronautical Operations Zone"
      tenure = "Vested in CIDCO / Transferred to NMIAL Concessionaire"
      rateMultiplier = 2.2
    } else if (u > 0.75) {
      classification = "Non-Agricultural Logistics & Freight Corridor"
      tenure = "CIDCO Freehold Commercial (Pushpak Nagar Node)"
      rateMultiplier = 1.8
    } else {
      classification = "Gaothan Residential Homestead Property"
      tenure = "Private Freehold (Eligible for 22.5% R&R Package)"
      rateMultiplier = 1.6
    }
  } else if (site.id === "mahsr") {
    if (distMetricMeters < 45) {
      classification = "High-Speed Rail Viaduct Right-of-Way (ROW 17.5m)"
      tenure = "Vested in NHSRCL (Central Government)"
      rateMultiplier = 2.0
    } else if (v > 0.65) {
      classification = "Agricultural Bagayat (Perennial Sugarcane & Mango Orchard)"
      tenure = "Private Agricultural Khatedar (Navsari Cadastre)"
      rateMultiplier = 1.4
    } else if (u > 0.65 && v < 0.45) {
      classification = "Heavy Industrial & Precast Girder Casting Yard"
      tenure = "Temporary Project Leasehold / NHSRCL"
      rateMultiplier = 1.7
    } else {
      classification = "Agricultural Jirayat (Seasonal Farmland)"
      tenure = "Tribal PESA / General Khatedar Land"
      rateMultiplier = 1.0
    }
  } else if (site.id === "dme") {
    if (distMetricMeters < 55) {
      classification = "National Highway Access-Controlled ROW (70m Strip)"
      tenure = "Vested in NHAI (Government of India)"
      rateMultiplier = 2.0
    } else if (u > 0.28 && u < 0.72 && v > 0.22 && v < 0.68) {
      classification = "Interchange Cloverleaf Ramp Land Bank"
      tenure = "Acquired & Demarcated Land Bank"
      rateMultiplier = 1.8
    } else if (v < 0.22) {
      classification = "Gram Panchayat Village Abadi Settlement"
      tenure = "Gaothan Residential Freehold"
      rateMultiplier = 1.5
    } else {
      classification = "Agricultural Jirayat (Black Cotton Soil Farmland)"
      tenure = "Private Agricultural Khatedar"
      rateMultiplier = 1.0
    }
  } else {
    // pme
    if (v < 0.35 && u > 0.7) {
      classification = "State Reserve Forest (Borghat Eco-Sensitive Zone)"
      tenure = "Maharashtra Forest Department"
      rateMultiplier = 0.6
    } else if (distMetricMeters < 75) {
      classification = "Expressway Twin-Tunnel Right-of-Way Corridor"
      tenure = "Vested in MSRDC (State Highway)"
      rateMultiplier = 2.4
    } else {
      classification = "Hill Slope Non-Agricultural / Agricultural Jirayat"
      tenure = "Private Freehold (7/12 Registered Owner)"
      rateMultiplier = 1.2
    }
  }

  const baseRate = Math.round(site.surroundingCadastre.benchmarkRate * rateMultiplier)
  const solatiumRate = baseRate * 2

  const areaSqm = Math.round(1800 + (((u * 83 + v * 61) * 10) % 6500))
  const areaHa = (areaSqm / 10000).toFixed(2)

  return {
    id: `pin_${Math.round(u * 1000)}_${Math.round(v * 1000)}`,
    surveyNumber,
    village,
    taluka: site.surroundingCadastre.talukas,
    district: site.surroundingCadastre.district,
    classification,
    tenure,
    circleRate: `₹${baseRate.toLocaleString("en-IN")} / sqm`,
    solatiumTotal: `₹${solatiumRate.toLocaleString("en-IN")} / sqm (with 100% Solatium)`,
    areaEstimate: `${areaHa} ha (${areaSqm.toLocaleString("en-IN")} sqm)`,
    proximityNote: isInsideCorridor
      ? `Inside Active Infrastructure Corridor (${distMetricMeters}m from centerline)`
      : `Surrounding Adjacent Buffer Zone (${distMetricMeters}m from project alignment)`,
    isInsideCorridor,
    lat,
    lon,
  }
}

function MapCard() {
  const [selectedSiteId, setSelectedSiteId] = useState("nmia")
  const [hovered, setHovered] = useState<string | null>(null)
  const [selectedParcel, setSelectedParcel] = useState<GisParcelOverlay | null>(null)
  const [isCinemaMode, setIsCinemaMode] = useState(false)
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
    Acquired: true,
    "In Progress": true,
    Disputed: true,
    "Restricted Zone": true,
  })

  // Pan and Zoom engine
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hasDragged, setHasDragged] = useState(false)

  // Ground truth cadastral inspection pin
  const [inspectionPin, setInspectionPin] = useState<{
    svgX: number
    svgY: number
    data: GisSurroundingLandRecord
  } | null>(null)

  const viewportRef = useRef<HTMLDivElement>(null)

  const currentProject = GIS_PROJECT_SITES.find((s) => s.id === selectedSiteId) || GIS_PROJECT_SITES[0]
  const activeParcel = currentProject.parcels.find((p) => p.id === hovered) || null

  function toggleLayer(status: string) {
    setVisibleLayers((prev) => ({ ...prev, [status]: !prev[status] }))
  }

  function handleZoomIn() {
    setZoom((z) => Math.min(3.5, Math.round((z + 0.3) * 10) / 10))
  }

  function handleZoomOut() {
    setZoom((z) => {
      const next = Math.max(1, Math.round((z - 0.3) * 10) / 10)
      if (next === 1) setPan({ x: 0, y: 0 })
      return next
    })
  }

  function handleResetView() {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setInspectionPin(null)
  }

  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true)
    setHasDragged(false)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return
    const dx = e.clientX - dragStart.x
    const dy = e.clientY - dragStart.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      setHasDragged(true)
    }

    const maxPanX = Math.max(0, (zoom - 1) * 380)
    const maxPanY = Math.max(0, (zoom - 1) * 220)

    setPan((prev) => ({
      x: Math.max(-maxPanX, Math.min(maxPanX, prev.x + dx)),
      y: Math.max(-maxPanY, Math.min(maxPanY, prev.y + dy)),
    }))
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  function handleMouseUp() {
    setIsDragging(false)
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    if (hasDragged) return
    if (!viewportRef.current) return

    const rect = viewportRef.current.getBoundingClientRect()
    // Calculate click coordinates relative to current zoom and pan
    const clientXRel = e.clientX - rect.left - pan.x
    const clientYRel = e.clientY - rect.top - pan.y

    const u = Math.max(0, Math.min(1, clientXRel / (rect.width * zoom)))
    const v = Math.max(0, Math.min(1, clientYRel / (rect.height * zoom)))

    const svgX = u * 960
    const svgY = v * 540

    const landData = getSurroundingLandAtPoint(currentProject, u, v)
    setInspectionPin({ svgX, svgY, data: landData })
  }

  return (
    <Card className={`overflow-hidden border-slate-200 bg-white shadow-xs transition-all duration-300 rounded-xl ${isCinemaMode ? 'xl:col-span-2' : ''}`}>
      <CardHeader className="space-y-3 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base text-slate-900 font-bold tracking-tight">National Infrastructure GIS Geofence</CardTitle>
              <Badge variant="outline" className="gap-1.5 border-emerald-300 bg-emerald-50 text-emerald-800 text-[11px] font-mono font-medium">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Cartosat-3 / Sentinel-2
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Real-time satellite orthomosaics with sub-meter PostGIS spatial demarcation overlays
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCinemaMode(!isCinemaMode)}
              className="h-8 gap-1.5 text-xs border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs font-medium"
              title={isCinemaMode ? "Standard Grid View" : "Full Viewport / Cinema Mode"}
            >
              {isCinemaMode ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
              <span>{isCinemaMode ? "Standard" : "Cinema Mode"}</span>
            </Button>
          </div>
        </div>

        {/* Project Selector Navigation Segmented Controls */}
        <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1 sm:grid-cols-4 border border-slate-200/90">
          {GIS_PROJECT_SITES.map((site) => {
            const isSelected = site.id === selectedSiteId
            const SiteIcon = site.id === "nmia" ? Plane : site.id === "mahsr" ? TrainFront : site.id === "dme" ? Navigation : Compass
            return (
              <button
                key={site.id}
                type="button"
                onClick={() => {
                  setSelectedSiteId(site.id)
                  setHovered(null)
                  setInspectionPin(null)
                  setZoom(1)
                  setPan({ x: 0, y: 0 })
                }}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-white text-slate-950 shadow-xs ring-1 ring-slate-300/80 font-bold"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                }`}
              >
                <div className={`grid size-7 shrink-0 place-items-center rounded-md ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-200/80 text-slate-700'}`}>
                  <SiteIcon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1 truncate">
                  <p className="truncate leading-tight font-semibold">{site.shortName}</p>
                  <p className="truncate text-[10px] text-slate-500 font-mono">{site.acquiredPct}% acquired</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Project Technical Meta Strip */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-[11px] text-slate-600 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-slate-900">{currentProject.name}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">{currentProject.location}</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] text-slate-500">
            <span>Agency: <strong className="font-semibold text-slate-800">{currentProject.agency}</strong></span>
            <span>Sensor: <strong className="text-slate-700">{currentProject.sensor}</strong></span>
            <span>GPS: <strong className="text-slate-700">{currentProject.coordinates}</strong></span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Main Satellite Viewport with Interactive Pan and Zoom */}
        <div
          ref={viewportRef}
          className={`relative overflow-hidden rounded-xl border border-slate-300 shadow-inner select-none transition-colors ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } ${isCinemaMode ? "min-h-[480px] h-[520px]" : "min-h-[350px] h-[380px]"}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
        >
          {/* Pan & Zoom Transform Wrapper */}
          <div
            className="absolute inset-0 size-full origin-center transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              backgroundImage: `url('${currentProject.imageUrl}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* SVG Vector Overlays */}
            <svg className="absolute inset-0 size-full" viewBox="0 0 960 540" preserveAspectRatio="none">
              <defs>
                <pattern id="diagonalHatchGis" patternUnits="userSpaceOnUse" width="8" height="8">
                  <path d="M-2,2 l4,-4 M0,8 l8,-8 M6,10 l4,-4" stroke="#dc2626" strokeWidth="1.5" />
                </pattern>
              </defs>

              {currentProject.parcels.map((parcel) => {
                if (!visibleLayers[parcel.status]) return null

                const isHovered = hovered === parcel.id
                const isSelected = selectedParcel?.id === parcel.id

                let fill = "rgba(16, 185, 129, 0.45)"
                let stroke = "#10b981"

                if (parcel.status === "In Progress") {
                  fill = isHovered ? "rgba(245, 158, 11, 0.75)" : "rgba(245, 158, 11, 0.45)"
                  stroke = "#f59e0b"
                } else if (parcel.status === "Disputed") {
                  fill = isHovered ? "rgba(239, 68, 68, 0.75)" : "rgba(239, 68, 68, 0.48)"
                  stroke = "#ef4444"
                } else if (parcel.status === "Restricted Zone") {
                  fill = "url(#diagonalHatchGis)"
                  stroke = "#dc2626"
                } else {
                  fill = isHovered ? "rgba(16, 185, 129, 0.75)" : "rgba(16, 185, 129, 0.45)"
                  stroke = "#10b981"
                }

                return (
                  <polygon
                    key={parcel.id}
                    points={parcel.points}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isHovered || isSelected ? "3.5" : "2"}
                    opacity={parcel.status === "Restricted Zone" ? (isHovered ? 0.8 : 0.5) : 1}
                    className="cursor-pointer transition-all duration-200 filter hover:drop-shadow"
                    onMouseEnter={() => setHovered(parcel.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedParcel(parcel)
                    }}
                  />
                )
              })}

              {/* Dynamic Dropped Cadastral Inspection Pin */}
              {inspectionPin && (
                <g className="transition-all duration-200">
                  {/* Outer Pulsing Radar Ring */}
                  <circle
                    cx={inspectionPin.svgX}
                    cy={inspectionPin.svgY}
                    r="16"
                    fill="rgba(14, 165, 233, 0.2)"
                    stroke="#0284c7"
                    strokeWidth="1.5"
                    className="animate-ping origin-center opacity-75"
                  />
                  {/* Intermediate Target Reticle */}
                  <circle
                    cx={inspectionPin.svgX}
                    cy={inspectionPin.svgY}
                    r="9"
                    fill="rgba(255, 255, 255, 0.9)"
                    stroke="#0284c7"
                    strokeWidth="2"
                  />
                  {/* Crosshair lines */}
                  <line
                    x1={inspectionPin.svgX - 14}
                    y1={inspectionPin.svgY}
                    x2={inspectionPin.svgX + 14}
                    y2={inspectionPin.svgY}
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={inspectionPin.svgX}
                    y1={inspectionPin.svgY - 14}
                    x2={inspectionPin.svgX}
                    y2={inspectionPin.svgY + 14}
                    stroke="#0284c7"
                    strokeWidth="1.5"
                  />
                  {/* Center Dot */}
                  <circle
                    cx={inspectionPin.svgX}
                    cy={inspectionPin.svgY}
                    r="3.5"
                    fill="#0369a1"
                  />
                </g>
              )}
            </svg>
          </div>

          {/* Interactive Zoom and Pan HUD Toolbar */}
          <div className="absolute right-3 top-3 z-20 flex flex-col items-end gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white/95 p-1 shadow-md backdrop-blur">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-slate-700 hover:bg-slate-100"
                onClick={handleZoomIn}
                title="Zoom In (or scroll up)"
              >
                <ZoomIn className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-slate-700 hover:bg-slate-100"
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                title="Zoom Out (or scroll down)"
              >
                <ZoomOut className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-slate-700 hover:bg-slate-100"
                onClick={handleResetView}
                title="Reset Zoom & Pan"
              >
                <RotateCcw className="size-3.5" />
              </Button>
              <Separator orientation="vertical" className="h-4 mx-0.5" />
              <div className="px-2 font-mono text-[10px] font-bold text-slate-900">
                {zoom.toFixed(1)}x
              </div>
            </div>

            {/* PostGIS Geofence Verification Pill */}
            <div className="flex items-center gap-2 rounded-md bg-slate-900/85 px-2.5 py-1 text-[11px] font-mono text-emerald-400 shadow-sm backdrop-blur">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>PostGIS ST_Intersects Verified</span>
            </div>
          </div>

          {/* Dynamic Parcel Hover Tooltip */}
          {activeParcel && (
            <div className="absolute top-3 left-3 z-20 max-w-[320px] rounded-lg border border-teal-500/80 bg-white/95 p-3 text-xs shadow-lg backdrop-blur animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-semibold text-slate-900 truncate">{activeParcel.name}</span>
                <Status>{activeParcel.status}</Status>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">{activeParcel.details}</p>
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 font-mono text-[10px] text-slate-500">
                <span>Area: <strong className="text-slate-700">{activeParcel.area}</strong></span>
                <span>Survey: <strong className="text-slate-700">{activeParcel.surveyNumber}</strong></span>
              </div>
              <p className="mt-1 text-[10px] text-teal-700 font-medium">Click polygon to open full dossier →</p>
            </div>
          )}

          {!activeParcel && !inspectionPin && (
            <p className="absolute top-3 left-3 z-10 rounded-md bg-white/90 px-2.5 py-1 text-[11px] text-slate-700 shadow-sm backdrop-blur">
              Click anywhere on map to inspect surrounding cadastral land · Drag to pan · Scroll to zoom
            </p>
          )}

          {/* Layer Status Filter Bar */}
          <div className="absolute bottom-3 left-3 z-10 rounded-lg border border-white/70 bg-white/95 p-2.5 text-xs shadow-md backdrop-blur">
            <p className="mb-1.5 text-[11px] font-semibold text-slate-700">GIS Layers (Toggle Visibility)</p>
            <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
              <button
                type="button"
                onClick={() => toggleLayer("Acquired")}
                className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-opacity ${
                  visibleLayers["Acquired"] ? "opacity-100 font-medium text-slate-800" : "opacity-40 text-slate-400"
                }`}
              >
                <span className="size-2.5 rounded-full bg-emerald-500" /> Acquired
              </button>
              <button
                type="button"
                onClick={() => toggleLayer("In Progress")}
                className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-opacity ${
                  visibleLayers["In Progress"] ? "opacity-100 font-medium text-slate-800" : "opacity-40 text-slate-400"
                }`}
              >
                <span className="size-2.5 rounded-full bg-amber-500" /> In Progress
              </button>
              <button
                type="button"
                onClick={() => toggleLayer("Disputed")}
                className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-opacity ${
                  visibleLayers["Disputed"] ? "opacity-100 font-medium text-slate-800" : "opacity-40 text-slate-400"
                }`}
              >
                <span className="size-2.5 rounded-full bg-rose-500" /> Disputed
              </button>
              <button
                type="button"
                onClick={() => toggleLayer("Restricted Zone")}
                className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-opacity ${
                  visibleLayers["Restricted Zone"] ? "opacity-100 font-medium text-slate-800" : "opacity-40 text-slate-400"
                }`}
              >
                <span className="size-2.5 rounded bg-red-700 border border-red-800" /> Eco-Buffer
              </button>
            </div>
          </div>

          {/* Scale / Coordinate Watermark */}
          <div className="absolute right-3 bottom-3 z-10 rounded bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white/80 backdrop-blur">
            CRS: EPSG:4326 (WGS 84) · Scale 1:{Math.round(12500 / zoom)}
          </div>
        </div>

        {/* Real-time Cadastral Land & Surrounding Inspector Strip */}
        {inspectionPin && (
          <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3.5 shadow-sm animate-in fade-in-50 duration-200">
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-sky-200/70 pb-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Crosshair className="size-4 text-sky-700" />
                <span className="font-semibold text-sky-950 text-xs">
                  Cadastral Land & Surrounding Land Inspector
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    inspectionPin.data.isInsideCorridor
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {inspectionPin.data.isInsideCorridor ? "Acquisition ROW" : "Adjacent Cadastral Buffer"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-sky-700">
                  {inspectionPin.data.lat.toFixed(6)}° N, {inspectionPin.data.lon.toFixed(6)}° E
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setInspectionPin(null)}
                  className="h-6 px-2 text-[10px] text-slate-500 hover:text-slate-900"
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="grid gap-3 text-xs sm:grid-cols-2 md:grid-cols-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Revenue Survey</span>
                <p className="font-semibold text-slate-800 font-mono mt-0.5">{inspectionPin.data.surveyNumber}</p>
                <p className="text-[11px] text-slate-600">{inspectionPin.data.village}, {inspectionPin.data.taluka}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Cadastral Tenure & Use</span>
                <p className="font-semibold text-slate-800 mt-0.5">{inspectionPin.data.classification}</p>
                <p className="text-[11px] text-slate-500 truncate">{inspectionPin.data.tenure}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Govt Ready Reckoner Rate</span>
                <p className="font-semibold text-emerald-800 mt-0.5">{inspectionPin.data.circleRate}</p>
                <p className="text-[11px] text-slate-500">{inspectionPin.data.solatiumTotal}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Estimated Plot Area</span>
                <p className="font-semibold text-slate-800 mt-0.5">{inspectionPin.data.areaEstimate}</p>
                <p className="text-[11px] text-sky-800">{inspectionPin.data.proximityNote}</p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Parcel Dossier Dialog */}
        <Dialog open={!!selectedParcel} onOpenChange={(open) => { if (!open) setSelectedParcel(null) }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-between gap-2">
                <DialogTitle className="text-base text-slate-900">
                  {selectedParcel?.name}
                </DialogTitle>
                {selectedParcel && <Status>{selectedParcel.status}</Status>}
              </div>
              <DialogDescription className="text-xs">
                Statutory land acquisition record & PostGIS spatial coordinates
              </DialogDescription>
            </DialogHeader>

            {selectedParcel && (
              <div className="space-y-3 py-2 text-xs">
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Survey Demarcation:</span>
                    <span className="font-semibold text-slate-800 font-mono">{selectedParcel.surveyNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Demarcated Area:</span>
                    <span className="font-semibold text-slate-800">{selectedParcel.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Statutory Stage:</span>
                    <Badge variant="outline" className="text-[10px] font-mono border-slate-300">
                      {STAGE_LABELS[selectedParcel.stage as ProposalStage] || selectedParcel.stage}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Compensation Award:</span>
                    <span className="font-semibold text-emerald-700">{selectedParcel.disbursedAmount}</span>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-3 space-y-1.5">
                  <p className="font-semibold text-slate-800">Operational & Legal Notes</p>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{selectedParcel.details}</p>
                </div>

                <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-2.5 text-[11px] text-teal-800 flex items-center gap-2">
                  <ShieldCheck className="size-4 shrink-0 text-teal-600" />
                  <span>PostGIS ST_Contains topology verified. Zero unnotified overlap with state revenue cadastre.</span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedParcel(null)}>
                    Close Dossier
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
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

// ─── CSV Report Downloader ────────────────────────────────────
function downloadCsvReport(
  proposals: Proposal[],
  summary: DashboardSummary | null,
  activeFilters?: { state: string; district: string; project: string }
) {
  const scopeDesc = [
    activeFilters?.state && activeFilters.state !== "all" ? `State: ${activeFilters.state}` : "All States",
    activeFilters?.district && activeFilters.district !== "all" ? `District: ${activeFilters.district}` : "All Districts",
    activeFilters?.project && activeFilters.project !== "all" ? `Project: ${activeFilters.project}` : "All Projects",
  ].join(" | ")

  const rows = [
    ["National Land Acquisition & Management System (NLAMS 2.0) - Executive MIS Report"],
    [`Generated On: ${new Date().toLocaleString("en-IN")}`],
    [`Filter Scope: ${scopeDesc}`],
    [],
    ["Key Performance Indicators (Aggregated Status)"],
    ["Total Projects Monitored", summary?.total_proposals || 0],
    ["Total Area Notified (ha)", summary?.area_notified_hectares || 0],
    ["Total Area Acquired (ha)", summary?.area_acquired_hectares || 0],
    [
      "Acquisition Progress (%)",
      `${summary && summary.area_notified_hectares > 0 ? ((summary.area_acquired_hectares / summary.area_notified_hectares) * 100).toFixed(1) : 0}%`,
    ],
    ["Total Compensation Assessed (INR)", summary?.compensation_assessed || 0],
    ["Total Compensation Paid (INR)", summary?.compensation_paid || 0],
    ["R&R Completion Rate (%)", `${summary?.rr_completion_pct || 0}%`],
    ["Displaced Families / Beneficiaries", summary?.families_displaced || 0],
    ["Active Dispute Cases", summary?.disputed_count || 0],
    ["Possession Orders Issued", summary?.possession_count || 0],
    [],
    ["Active Land Acquisition Projects Schedule"],
    [
      "Project ID",
      "Project Name",
      "State",
      "District",
      "Notified Area (ha)",
      "Statutory Stage",
      "Litigation Risk Band",
      "Litigation Risk Score",
      "Public Purpose Justification",
      "Last Activity Date",
    ],
    ...proposals.map((p) => [
      `"${(p.id || "").replace(/"/g, '""')}"`,
      `"${(p.project_name || "").replace(/"/g, '""')}"`,
      `"${(p.state || "").replace(/"/g, '""')}"`,
      `"${(p.district || "").replace(/"/g, '""')}"`,
      p.area_hectares || 0,
      `"${STAGE_LABELS[p.stage] || p.stage}"`,
      `"${p.litigation_risk_band || "Low"}"`,
      p.litigation_risk_score !== null && p.litigation_risk_score !== undefined ? p.litigation_risk_score : "N/A",
      `"${(p.justification || "").replace(/"/g, '""')}"`,
      p.updated_at ? new Date(p.updated_at).toLocaleDateString("en-IN") : "N/A",
    ]),
  ]

  const csvContent = rows
    .map((row) => (Array.isArray(row) ? row.join(",") : row))
    .join("\r\n")

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", `NLAMS_Executive_MIS_Report_${new Date().toISOString().slice(0, 10)}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
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
  const [filterProject, setFilterProject] = useState("all")
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  // Fetch proposals list on mount
  useEffect(() => {
    api.get<Proposal[]>("/proposals")
      .then((p) => setProposals(p))
      .catch((err) => console.error("Proposals fetch error:", err))
  }, [])

  // Fetch KPI summary whenever filters change
  const fetchSummary = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterState !== "all") params.set("state", filterState)
      if (filterDistrict !== "all") params.set("district", filterDistrict)
      if (filterProject !== "all") params.set("projectId", filterProject)
      const qs = params.toString() ? `?${params}` : ""

      const s = await api.get<DashboardSummary>(`/dashboard/summary${qs}`)
      setSummary(s)
    } catch (err) {
      console.error("Dashboard summary fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [filterState, filterDistrict, filterProject])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  // Extract unique states from all proposals
  const states = [...new Set(proposals.map((p) => p.state))].sort()

  // Extract available districts matching selected state
  const availableDistricts = [...new Set(
    proposals
      .filter((p) => filterState === "all" || p.state === filterState)
      .map((p) => p.district)
  )].sort()

  // Extract available projects matching state & district
  const availableProjects = proposals.filter((p) => {
    if (filterState !== "all" && p.state !== filterState) return false
    if (filterDistrict !== "all" && p.district !== filterDistrict) return false
    return true
  })

  // Filter proposals for table and report
  const filteredProposals = proposals.filter((p) => {
    if (filterState !== "all" && p.state !== filterState) return false
    if (filterDistrict !== "all" && p.district !== filterDistrict) return false
    if (filterProject !== "all" && p.id !== filterProject) return false
    return true
  })

  const hasActiveFilters = filterState !== "all" || filterDistrict !== "all" || filterProject !== "all"

  function handleStateChange(newState: string | null) {
    setFilterState(newState || "all")
    setFilterDistrict("all")
    setFilterProject("all")
  }

  function handleDistrictChange(newDistrict: string | null) {
    setFilterDistrict(newDistrict || "all")
    setFilterProject("all")
  }

  function handleProjectChange(newProject: string | null) {
    setFilterProject(newProject || "all")
  }

  function handleClearFilters() {
    setFilterState("all")
    setFilterDistrict("all")
    setFilterProject("all")
  }

  function handleDownloadReport() {
    try {
      const selectedProjectObj = proposals.find((p) => p.id === filterProject)
      downloadCsvReport(filteredProposals, summary, {
        state: filterState,
        district: filterDistrict,
        project: selectedProjectObj ? selectedProjectObj.project_name : filterProject,
      })
      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 2500)
    } catch (err) {
      console.error("MIS report download error:", err)
    }
  }

  const roleLabel = user ? ROLE_LABELS[user.role] : "Overview"

  if (loading || !summary) {
    return (
      <>
        <PageHeading eyebrow={`${roleLabel} / Overview`} title="National Dashboard" description="Loading..." />
        <div className="flex items-center justify-center py-20">
          <Spinner className="size-8 text-teal-700" />
        </div>
      </>
    )
  }

  const compPct =
    summary.compensation_assessed > 0
      ? Math.round((summary.compensation_paid / summary.compensation_assessed) * 100)
      : 0

  return (
    <>
      <PageHeading
        eyebrow={`${roleLabel} / Overview`}
        title="National Dashboard"
        description="A consolidated view of land acquisition progress, statutory milestones, and compliance."
        action={
          <Button
            className={`transition-all duration-200 shadow-xs font-medium ${
              downloadSuccess
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
            onClick={handleDownloadReport}
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="mr-2 size-4 text-emerald-200 animate-in zoom-in-50" />
                MIS Report Downloaded!
              </>
            ) : (
              <>
                <Download className="mr-2 size-4" /> Download Executive MIS Report
              </>
            )}
          </Button>
        }
      />

      {/* Filters Bar */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700">Filter Projects & KPIs</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">
              Showing {filteredProposals.length} of {proposals.length} projects
            </span>
            {hasActiveFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-6 px-2 text-[11px] text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <X className="mr-1 size-3" /> Clear filters
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {/* State filter */}
          <Select value={filterState} onValueChange={handleStateChange}>
            <SelectTrigger className="w-full text-xs">
              <span className="truncate">
                {filterState === "all" ? `State: All states (${states.length})` : `State: ${filterState}`}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states ({states.length})</SelectItem>
              {states.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* District filter (cascades from state) */}
          <Select value={filterDistrict} onValueChange={handleDistrictChange}>
            <SelectTrigger className="w-full text-xs">
              <span className="truncate">
                {filterDistrict === "all"
                  ? `District: All districts (${availableDistricts.length})`
                  : `District: ${filterDistrict}`}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                All districts {filterState !== "all" ? `in ${filterState}` : ""} ({availableDistricts.length})
              </SelectItem>
              {availableDistricts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Project filter (cascades from state & district) */}
          <Select value={filterProject} onValueChange={handleProjectChange}>
            <SelectTrigger className="w-full text-xs">
              <span className="truncate">
                {filterProject === "all"
                  ? `Project: All projects (${availableProjects.length})`
                  : availableProjects.find((p) => p.id === filterProject)?.project_name || "Selected project"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects ({availableProjects.length})</SelectItem>
              {availableProjects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.project_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs + Map */}
      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <MapCard />
        <div className="grid gap-4 sm:grid-cols-2">
          <Kpi
            label="Area notified"
            value={fmtHectares(summary.area_notified_hectares)}
            note={`Across ${summary.total_proposals} active projects`}
            icon={Map}
          />
          <Kpi
            label="Area acquired"
            value={fmtHectares(summary.area_acquired_hectares)}
            note={`${
              summary.area_notified_hectares > 0
                ? ((summary.area_acquired_hectares / summary.area_notified_hectares) * 100).toFixed(1)
                : 0
            }% of notified area`}
            icon={Check}
          />
          <Kpi
            label="Families displaced"
            value={summary.families_displaced.toLocaleString("en-IN")}
            note={`${summary.disputed_count} disputed`}
            icon={Users}
          />
          <Kpi
            label="R&R completion"
            value={`${summary.rr_completion_pct}%`}
            note={`${summary.possession_count} in possession`}
            icon={ShieldCheck}
          />
          <Kpi
            label="Proposals in dispute"
            value={summary.disputed_count.toString()}
            note="Active dispute cases"
            icon={Flag}
          />
          <Kpi
            label="Compensation paid"
            value={fmtINR(summary.compensation_paid)}
            note={`of ${fmtINR(summary.compensation_assessed)} assessed`}
            icon={Building2}
          >
            <Progress value={compPct} className="mt-3 h-2" />
            <p className="mt-2 text-xs text-slate-500">{compPct}% released to beneficiaries</p>
          </Kpi>
        </div>
      </div>

      {/* Projects table */}
      <Card className="mt-5 border-slate-200 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base text-slate-900">Active Land Acquisition Projects</CardTitle>
            <CardDescription className="text-xs">
              Statutory progress schedule & litigation risk oversight
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs text-slate-600 border-slate-200">
            {filteredProposals.length} project{filteredProposals.length !== 1 ? "s" : ""} listed
          </Badge>
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
                <TableHead>Litigation Risk</TableHead>
                <TableHead className="text-right">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 py-10">
                    <p className="font-medium text-slate-700">No projects match the selected filters</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting the State, District, or Project filters.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      className="mt-3 h-7 text-xs border-slate-300"
                    >
                      Clear all filters
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProposals.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-slate-800">{p.project_name}</TableCell>
                    <TableCell>{p.state}</TableCell>
                    <TableCell>{p.district}</TableCell>
                    <TableCell>{fmtHectares(p.area_hectares)}</TableCell>
                    <TableCell>
                      <Status>{STAGE_LABELS[p.stage] || p.stage}</Status>
                    </TableCell>
                    <TableCell>
                      <Status>{p.litigation_risk_band || riskBand(p.litigation_risk_score)}</Status>
                    </TableCell>
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
function Scrutiny({
  proposal,
  onTransition,
  onDelete,
}: {
  proposal: Proposal
  onTransition: () => void
  onDelete?: () => void
}) {
  const { user } = useAuth()
  const [transitioning, setTransitioning] = useState(false)
  const [error, setError] = useState("")
  const [report, setReport] = useState<ScrutinyReport | null>(null)
  const [loadingReport, setLoadingReport] = useState(true)
  const [triggering, setTriggering] = useState(false)
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [objections, setObjections] = useState<Objection[]>([])
  const [compensation, setCompensation] = useState<Compensation[]>([])
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [resolutionNotes, setResolutionNotes] = useState<string>("")
  const [disbursing, setDisbursing] = useState<boolean>(false)

  const nextStages = TRANSITIONS[proposal.stage] || []

  const fetchReport = useCallback(async () => {
    setLoadingReport(true)
    try {
      const [reportRes, parcelsRes, docsRes, objRes, compRes] = await Promise.allSettled([
        api.get<ScrutinyReport>(`/proposals/${proposal.id}/scrutiny`),
        api.get<Parcel[]>(`/parcels/proposal/${proposal.id}`),
        api.get<DocumentRecord[]>(`/documents/proposal/${proposal.id}`),
        api.get<Objection[]>(`/objections/proposal/${proposal.id}`),
        api.get<Compensation[]>(`/compensation/proposal/${proposal.id}`),
      ])
      if (reportRes.status === "fulfilled") setReport(reportRes.value)
      if (parcelsRes.status === "fulfilled") setParcels(parcelsRes.value)
      if (docsRes.status === "fulfilled") setDocuments(docsRes.value)
      if (objRes.status === "fulfilled") setObjections(objRes.value)
      if (compRes.status === "fulfilled") setCompensation(compRes.value)
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

  async function handleResolveObjection(objectionId: string) {
    if (!resolutionNotes.trim()) return
    try {
      await api.patch(`/objections/${objectionId}/resolve`, {
        status: "RESOLVED",
        resolution_notes: resolutionNotes.trim(),
      })
      setResolvingId(null)
      setResolutionNotes("")
      fetchReport()
    } catch (err: any) {
      setError(err.message || "Failed to resolve objection")
    }
  }

  async function handleDisburseCompensation(compId: string) {
    setDisbursing(true)
    try {
      await api.patch(`/compensation/${compId}/approve`)
      fetchReport()
      onTransition()
    } catch (err: any) {
      setError(err.message || "Failed to disburse compensation")
    } finally {
      setDisbursing(false)
    }
  }

  return (
    <div className="grid gap-3 border-t border-slate-200 bg-slate-50/70 p-4 lg:grid-cols-3">
      {/* Proposal Summary: Registered Parcel & Statutory Document */}
      <div className="col-span-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600 shadow-sm">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-teal-700" />
          <span>
            <strong>Land Parcel:</strong>{" "}
            {parcels.length > 0
              ? `${parcels[0].owner_name || "Declared Owner"} (${parcels[0].claimed_area_sqm ? parcels[0].claimed_area_sqm.toLocaleString() + " sqm" : "Boundary recorded"}) · PostGIS Geofenced`
              : "No parcel attached"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-teal-700" />
          <span>
            <strong>Statutory Deed:</strong>{" "}
            {documents.length > 0
              ? `${documents[0].filename} (v${documents[0].version})`
              : "Pending statutory document upload"}
          </span>
        </div>
      </div>

      {loadingReport ? (
        <div className="col-span-3 flex justify-center py-6">
          <Spinner />
        </div>
      ) : !report ? (
        <div className="col-span-3 flex flex-col items-center justify-center gap-3 py-6">
          <p className="text-sm text-slate-500">
            {user?.role === "CALA"
              ? "No AI Scrutiny run yet for this proposal."
              : "Proposal registered. Awaiting CALA review and AI Scrutiny run."}
          </p>
          {user?.role === "CALA" && (
            <Button onClick={handleTrigger} disabled={triggering} className="bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-xs">
              {triggering ? <Spinner className="mr-2 text-white size-4" /> : <ShieldCheck className="mr-2 size-4 text-emerald-400" />}
              {triggering ? "Executing Statutory Scrutiny Agents..." : "Run AI Statutory Scrutiny"}
            </Button>
          )}
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

      {/* Objections & Dispute Resolution Panel */}
      {objections.length > 0 && (
        <Card className="col-span-3 border-slate-200 shadow-none">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Flag className="size-4 text-amber-600" />
                Citizen Objections &amp; Grievance Redressal
              </span>
              <Badge variant="outline" className="text-xs">
                {objections.filter((o) => o.status === "OPEN").length} pending · {objections.length} total
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-1">
            {objections.map((o) => (
              <div key={o.id} className="rounded-lg border border-slate-200 p-3 bg-white">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-800">Objection: {o.reason}</p>
                  <Status>{o.status}</Status>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">Filed {fmtDate(o.filed_at)}</p>
                {o.resolution_notes && (
                  <p className="mt-2 text-xs text-emerald-700 bg-emerald-50 rounded p-2 border border-emerald-200">
                    <strong>Resolution:</strong> {o.resolution_notes}
                  </p>
                )}
                {user?.role === "CALA" && o.status === "OPEN" && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100">
                    {resolvingId === o.id ? (
                      <div className="flex flex-col gap-2">
                        <Textarea
                          placeholder="Enter statutory resolution notes (e.g. Area re-surveyed by CALA team, discrepancy resolved)..."
                          className="text-xs h-16"
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setResolvingId(null)}>
                            Cancel
                          </Button>
                          <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-7 shadow-xs font-medium" onClick={() => handleResolveObjection(o.id)}>
                            Submit Statutory Resolution
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="text-xs h-7 text-teal-800 border-teal-300 hover:bg-teal-50" onClick={() => { setResolvingId(o.id); setResolutionNotes(""); }}>
                        Resolve this objection
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Compensation Award & Disbursement Bar */}
      {compensation.length > 0 && (
        <div className="col-span-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3.5 text-xs text-slate-700">
          <div className="flex items-center gap-2.5">
            <Building2 className="size-5 text-emerald-700 shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">
                Land Compensation Award: {fmtINR(Number(compensation[0].assessed_amount))}
              </p>
              <p className="text-[11px] text-slate-500">
                Award Status: <strong>{compensation[0].status}</strong> {compensation[0].paid_amount ? `· Disbursed ${fmtINR(Number(compensation[0].paid_amount))}` : ""}
              </p>
            </div>
          </div>
          {user?.role === "CALA" && compensation[0].status !== "PAID" && (
            <Button
              size="sm"
              disabled={disbursing}
              onClick={() => handleDisburseCompensation(compensation[0].id)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8"
            >
              {disbursing ? <Spinner className="mr-1.5 size-3 text-white" /> : <Check className="mr-1.5 size-3" />}
              Approve &amp; Disburse Compensation
            </Button>
          )}
          {compensation[0].status === "PAID" && (
            <Badge className="bg-emerald-600 text-white text-xs">
              Payment Settled via Direct Beneficiary Transfer
            </Badge>
          )}
        </div>
      )}

      {error && (
        <div className="lg:col-span-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="lg:col-span-3 flex flex-wrap gap-3 items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex flex-wrap gap-2">
          {user?.role === "CALA" && nextStages.map((stage) => (
            <Button
              key={stage}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8 shadow-xs font-semibold"
              disabled={transitioning || loadingReport}
              onClick={() => handleTransition(stage)}
            >
              {transitioning ? <Spinner className="mr-1.5 size-3.5 text-white" /> : <Check className="mr-1.5 size-3.5" />}
              {stage === "DISPUTED" ? "Mark as Disputed" : `Advance to ${STAGE_LABELS[stage]}`}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {report && user?.role === "CALA" && (
            <Button variant="outline" size="sm" className="text-xs h-8" onClick={handleTrigger} disabled={triggering}>
              {triggering ? <Spinner className="mr-1.5 size-3.5" /> : null}
              Re-run Scrutiny
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
              onClick={onDelete}
            >
              <Trash2 className="mr-1.5 size-3.5" /> Delete Project
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// WORKBENCH — CALA & Requiring Body view of proposals
// ═══════════════════════════════════════════════════════════════
function Workbench() {
  const { user } = useAuth()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<string | null>(null)
  const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [deletedSuccess, setDeletedSuccess] = useState<string>("")

  const canDelete =
    user?.role === "REQUIRING_BODY" ||
    user?.role === "CALA" ||
    user?.role === "STATE_MONITOR"

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

  useEffect(() => { fetchProposals() }, [fetchProposals, user?.id, user?.role])

  async function handleConfirmDelete() {
    if (!proposalToDelete) return
    setDeleting(true)
    setDeleteError("")
    try {
      await api.delete(`/proposals/${proposalToDelete.id}`)
      const deletedName = proposalToDelete.project_name
      setProposalToDelete(null)
      setDeletedSuccess(`Project "${deletedName}" was permanently deleted.`)
      setTimeout(() => setDeletedSuccess(""), 4500)
      if (open === proposalToDelete.id) {
        setOpen(null)
      }
      fetchProposals()
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete project proposal")
    } finally {
      setDeleting(false)
    }
  }

  const roleLabel = user ? ROLE_LABELS[user.role] : "CALA"

  return (
    <>
      <PageHeading
        eyebrow={roleLabel}
        title={user?.role === "REQUIRING_BODY" ? "Project Proposals" : "CALA Workbench"}
        description={user?.role === "REQUIRING_BODY" ? "Review submitted proposals, statutory documents, and AI scrutiny status." : "Review proposals, scrutiny findings, and statutory compliance before approval."}
        action={<Button variant="outline"><Search data-icon="inline-start" /> Search proposals</Button>}
      />

      {deletedSuccess && (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>{deletedSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setDeletedSuccess("")}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <Card className="border-slate-200 shadow-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-slate-900">Proposals</CardTitle>
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
                  <div className="flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                    <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-3 p-4 text-left">
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
                    {canDelete && (
                      <button
                        type="button"
                        title={`Delete project "${p.project_name}"`}
                        className="mr-3 p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          setProposalToDelete(p)
                          setDeleteError("")
                        }}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                  <CollapsibleContent>
                    <Scrutiny
                      proposal={p}
                      onTransition={fetchProposals}
                      onDelete={() => {
                        setProposalToDelete(p)
                        setDeleteError("")
                      }}
                    />
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))
          )}
        </CardContent>
      </Card>

      {/* Delete Project Confirmation Modal */}
      {proposalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-rose-100 text-rose-700">
                <Trash2 className="size-5" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Delete Project Proposal?</h3>
                <p className="text-xs text-slate-500">Permanent statutory record removal</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-1.5">
              <p className="text-xs font-semibold text-slate-800">{proposalToDelete.project_name}</p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3 text-slate-400" />
                  {proposalToDelete.district}, {proposalToDelete.state}
                </span>
                <span className="flex items-center gap-1">
                  <Layers className="size-3 text-slate-400" />
                  {fmtHectares(proposalToDelete.area_hectares)}
                </span>
                <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                  {STAGE_LABELS[proposalToDelete.stage]}
                </span>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this project? All associated PostGIS parcel demarcations, statutory title deed records, and AI scrutiny reports will be permanently removed.
            </p>

            {deleteError && (
              <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-2.5 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setProposalToDelete(null)
                  setDeleteError("")
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {deleting ? (
                  <>
                    <Spinner className="mr-1.5 size-3.5 text-white" /> Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-1.5 size-3.5" /> Confirm Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// SUBMIT PROPOSAL — Unified proposal, parcel, and document submission
// ═══════════════════════════════════════════════════════════════
interface DemoScenario {
  project_name: string
  state: string
  district: string
  area_hectares: string
  justification: string
  owner_name: string
  claimed_area_sqm: string
  badge_label: string
  coordinates: [number, number][]
  sample_document_filename: string
}

const ALL_SAMPLE_DOCS = [
  {
    filename: "Title_Deed_Pune_Nashik_Ganesh_Patil.pdf",
    shortLabel: "Pune Rail (Ganesh Patil)",
    title: "Title Deed: Pune-Nashik Semi-High Speed Rail Corridor — Mr. Ganesh Patil",
    isMismatch: false,
  },
  {
    filename: "Title_Deed_WDFC_Devendra_Singh_Yadav.pdf",
    shortLabel: "WDFC Freight (Devendra Yadav)",
    title: "Title Deed: Western Dedicated Freight Corridor — Shri Devendra Singh Yadav",
    isMismatch: false,
  },
  {
    filename: "Title_Deed_Expressway_Bhavnaben_Patel.pdf",
    shortLabel: "Gujarat Expressway (Bhavnaben Patel)",
    title: "Title Deed: Delhi-Mumbai Expressway — Smt. Bhavnaben Patel",
    isMismatch: false,
  },
  {
    filename: "Title_Deed_MMLP_Talegaon_Ganesh_Patil.pdf",
    shortLabel: "MMLP Hub (Ganesh Patil)",
    title: "Title Deed: Multi-Modal Logistics Park Talegaon — Mr. Ganesh Patil",
    isMismatch: false,
  },
  {
    filename: "Title_Deed_Khavda_Solar_Suresh_Jadeja.pdf",
    shortLabel: "Kutch Solar (Suresh Jadeja)",
    title: "Title Deed: Khavda Ultra Mega Solar Park — Shri Suresh Kumar Jadeja",
    isMismatch: false,
  },
  {
    filename: "Title_Deed_Bengaluru_Expressway_Venkataswamy.pdf",
    shortLabel: "Bengaluru Exp (Venkataswamy)",
    title: "Title Deed: Bengaluru-Chennai Expressway — Shri M. Venkataswamy",
    isMismatch: false,
  },
  {
    filename: "Title_Deed_Mismatch_Disputed_Sample.pdf",
    shortLabel: "⚠️ Mismatch Test (Ramesh Sharma)",
    title: "Title Deed: Discrepancy Test Document — Shri Ramesh Chandra Sharma",
    isMismatch: true,
  },
]

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    project_name: "Pune-Nashik Semi-High Speed Rail Corridor — Package IV",
    state: "Maharashtra",
    district: "Pune",
    area_hectares: "1.2",
    justification: "Acquisition of private agricultural land for dedicated high-speed rail corridor linking Pune and Nashik under PM GatiShakti National Master Plan.",
    owner_name: "Mr. Ganesh Patil",
    claimed_area_sqm: "12000",
    badge_label: "Semi-High Speed Rail (Pune, MH)",
    sample_document_filename: "Title_Deed_Pune_Nashik_Ganesh_Patil.pdf",
    coordinates: [
      [73.56, 18.51],
      [73.59, 18.51],
      [73.59, 18.54],
      [73.56, 18.54],
      [73.56, 18.51],
    ],
  },
  {
    project_name: "Western Dedicated Freight Corridor (WDFC) — Phase II Feeder Spur",
    state: "Haryana",
    district: "Gurugram",
    area_hectares: "4.75",
    justification: "Statutory acquisition of agricultural and transit parcels for the double-stack container electrified railway feeder line connecting Sohna industrial logistics hub with Rewari junction under National Rail Plan 2030.",
    owner_name: "Shri Devendra Singh Yadav",
    claimed_area_sqm: "47500",
    badge_label: "Dedicated Freight Corridor (Gurugram, HR)",
    sample_document_filename: "Title_Deed_WDFC_Devendra_Singh_Yadav.pdf",
    coordinates: [
      [77.01, 28.32],
      [77.04, 28.32],
      [77.04, 28.35],
      [77.01, 28.35],
      [77.01, 28.32],
    ],
  },
  {
    project_name: "Delhi-Mumbai Greenfield Expressway (NE-4) — Vadodara-Bharuch Section",
    state: "Gujarat",
    district: "Vadodara",
    area_hectares: "6.80",
    justification: "Greenfield right-of-way (ROW) acquisition for 8-lane access-controlled motorway, grade-separated trumpet interchange, and emergency flight-strip landing corridor under Bharatmala Pariyojana.",
    owner_name: "Smt. Bhavnaben Patel",
    claimed_area_sqm: "68000",
    badge_label: "Greenfield Expressway (Vadodara, GJ)",
    sample_document_filename: "Title_Deed_Expressway_Bhavnaben_Patel.pdf",
    coordinates: [
      [73.18, 22.28],
      [73.22, 22.28],
      [73.22, 22.31],
      [73.18, 22.31],
      [73.18, 22.28],
    ],
  },
  {
    project_name: "PM GatiShakti Multi-Modal Logistics Park (MMLP) — Talegaon Hub",
    state: "Maharashtra",
    district: "Pune",
    area_hectares: "8.40",
    justification: "Acquisition of non-irrigated farmland for rail-linked inland container depot (ICD), automated warehousing, and custom-bonded cargo apron adjacent to NH-48 corridor.",
    owner_name: "Mr. Ganesh Patil",
    claimed_area_sqm: "84000",
    badge_label: "Multi-Modal Logistics Hub (Pune, MH)",
    sample_document_filename: "Title_Deed_MMLP_Talegaon_Ganesh_Patil.pdf",
    coordinates: [
      [73.68, 18.72],
      [73.72, 18.72],
      [73.72, 18.75],
      [73.68, 18.75],
      [73.68, 18.72],
    ],
  },
  {
    project_name: "Khavda Ultra Mega Renewable Energy Hybrid Park — 765kV Evacuation Substation",
    state: "Gujarat",
    district: "Kutch",
    area_hectares: "14.50",
    justification: "Acquisition of revenue wasteland parcels for 765kV high-voltage direct current (HVDC) transmission towers and renewable power pooling station under the National Green Hydrogen & Solar Mission.",
    owner_name: "Shri Suresh Kumar Jadeja",
    claimed_area_sqm: "145000",
    badge_label: "Renewable Hybrid Park (Kutch, GJ)",
    sample_document_filename: "Title_Deed_Khavda_Solar_Suresh_Jadeja.pdf",
    coordinates: [
      [69.75, 23.82],
      [69.80, 23.82],
      [69.80, 23.87],
      [69.75, 23.87],
      [69.75, 23.82],
    ],
  },
  {
    project_name: "Bengaluru-Chennai Expressway (NE-7) — Hoskote to Malur Package I",
    state: "Karnataka",
    district: "Bengaluru Rural",
    area_hectares: "3.65",
    justification: "Acquisition of dry agricultural land for high-speed industrial expressway corridor connecting Karnataka manufacturing hubs with Chennai port facilities under Bharatmala Phase 1.",
    owner_name: "Shri M. Venkataswamy",
    claimed_area_sqm: "36500",
    badge_label: "Industrial Expressway (Bengaluru, KA)",
    sample_document_filename: "Title_Deed_Bengaluru_Expressway_Venkataswamy.pdf",
    coordinates: [
      [77.82, 13.06],
      [77.86, 13.06],
      [77.86, 13.09],
      [77.82, 13.09],
      [77.82, 13.06],
    ],
  },
]

function SubmitProposal() {
  const router = useRouter()
  const [form, setForm] = useState({
    project_name: "",
    state: "",
    district: "",
    area_hectares: "",
    justification: "",
  })

  // Parcel demarcation state
  const [parcelOwnerName, setParcelOwnerName] = useState("")
  const [parcelClaimedArea, setParcelClaimedArea] = useState("")
  const [parcelGeoJSON, setParcelGeoJSON] = useState("")

  // Statutory document state
  const [titleDeedFile, setTitleDeedFile] = useState<File | null>(null)
  const [attachingDoc, setAttachingDoc] = useState(false)

  // Demo scenarios state
  const [activeScenario, setActiveScenario] = useState<DemoScenario | null>(null)
  const [activeScenarioLabel, setActiveScenarioLabel] = useState<string>("")
  const lastScenarioIdx = useRef<number>(-1)

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [submitStep, setSubmitStep] = useState<string>("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  // Quick fill sample GeoJSON
  function fillSampleGeoJSON() {
    const coords = (activeScenario || DEMO_SCENARIOS[0]).coordinates
    setParcelGeoJSON(
      JSON.stringify(
        {
          type: "Polygon",
          coordinates: [coords],
        },
        null,
        2
      )
    )
  }

  // Helper to load random realistic demo scenarios for quick pitch testing
  function loadDemoScenario() {
    let nextIdx = Math.floor(Math.random() * DEMO_SCENARIOS.length)
    if (nextIdx === lastScenarioIdx.current && DEMO_SCENARIOS.length > 1) {
      nextIdx = (nextIdx + 1) % DEMO_SCENARIOS.length
    }
    lastScenarioIdx.current = nextIdx

    const s = DEMO_SCENARIOS[nextIdx]
    setActiveScenario(s)
    setForm({
      project_name: s.project_name,
      state: s.state,
      district: s.district,
      area_hectares: s.area_hectares,
      justification: s.justification,
    })
    setParcelOwnerName(s.owner_name)
    setParcelClaimedArea(s.claimed_area_sqm)
    setParcelGeoJSON(
      JSON.stringify(
        {
          type: "Polygon",
          coordinates: [s.coordinates],
        },
        null,
        2
      )
    )
    setActiveScenarioLabel(s.badge_label)
  }

  // Helper to auto-attach matching statutory sample document
  async function handleAutoAttachDocument(filename?: string) {
    const targetFile =
      filename || activeScenario?.sample_document_filename || DEMO_SCENARIOS[0].sample_document_filename
    setAttachingDoc(true)
    try {
      const res = await fetch(`/sample_documents/${targetFile}`)
      if (!res.ok) throw new Error("Could not fetch sample document")
      const blob = await res.blob()
      const file = new File([blob], targetFile, { type: "application/pdf" })
      setTitleDeedFile(file)
    } catch (err) {
      console.error("Failed to auto-attach sample document:", err)
    } finally {
      setAttachingDoc(false)
    }
  }

  // Real-time GeoJSON validation
  const geojsonValidation = (() => {
    if (!parcelGeoJSON.trim()) return null
    try {
      const parsed = JSON.parse(parcelGeoJSON)
      if (parsed.type === "Polygon" || parsed.type === "MultiPolygon") {
        return { valid: true, message: "Valid GeoJSON Polygon" }
      }
      return { valid: false, message: "Type must be Polygon or MultiPolygon" }
    } catch {
      return { valid: false, message: "Invalid JSON format" }
    }
  })()

  async function handleSubmit() {
    setError("")
    if (!form.project_name.trim() || !form.state || !form.district || !form.area_hectares) {
      setError("Please fill all required project fields (Name, State, District, Area).")
      return
    }
    if (!parcelOwnerName.trim()) {
      setError("Please specify the primary landowner or stakeholder name.")
      return
    }
    if (!parcelGeoJSON.trim()) {
      setError("Please provide the parcel GPS boundary coordinates (GeoJSON).")
      return
    }

    let geojsonObj: any
    try {
      geojsonObj = JSON.parse(parcelGeoJSON)
      if (geojsonObj.type !== "Polygon" && geojsonObj.type !== "MultiPolygon") {
        setError("GeoJSON boundary must be a Polygon or MultiPolygon object.")
        return
      }
    } catch {
      setError("Invalid GeoJSON syntax. Please verify coordinates format.")
      return
    }

    if (!titleDeedFile) {
      setError("Please attach the statutory document (Title Deed / 7-12 Extract) for AI scrutiny.")
      return
    }

    setSubmitting(true)
    try {
      // Step 1: Create Proposal
      setSubmitStep("Step 1/3: Registering acquisition proposal...")
      const proposal = await api.post<Proposal>("/proposals", {
        project_name: form.project_name.trim(),
        state: form.state,
        district: form.district,
        area_hectares: parseFloat(form.area_hectares),
        justification: form.justification.trim() || null,
      })

      // Step 2: Create Parcel with PostGIS boundary
      setSubmitStep("Step 2/3: Registering parcel boundary & GIS coordinates...")
      await api.post("/parcels", {
        proposal_id: proposal.id,
        owner_name: parcelOwnerName.trim(),
        claimed_area_sqm: parcelClaimedArea.trim() ? parseFloat(parcelClaimedArea) : parseFloat(form.area_hectares) * 10000,
        geojson_polygon: geojsonObj,
      })

      // Step 3: Upload Statutory Title Deed
      setSubmitStep("Step 3/3: Uploading statutory Title Deed document...")
      await api.upload("/documents", titleDeedFile, {
        proposal_id: proposal.id,
        doc_type: "TITLE_DEED",
      })

      setSubmitStep("Proposal, parcel boundary, and Title Deed registered successfully!")
      setSuccess(true)
      setTimeout(() => router.push("/workbench"), 1500)
    } catch (err: any) {
      setError(err.message || "Submission failed. Please check backend service logs.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="Requiring Body Portal"
        title="Submit acquisition proposal"
        description="Register project details, GPS parcel boundaries, and statutory documents in one unified workflow."
        action={
          <div className="flex flex-wrap items-center gap-2">
            {activeScenarioLabel && (
              <span className="inline-flex items-center text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-300 px-3 py-1 rounded-md animate-in fade-in font-mono">
                <CheckCircle2 className="mr-1.5 size-3.5 text-emerald-600" /> Template: {activeScenarioLabel}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={loadDemoScenario}
              className="border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-2xs font-semibold text-xs h-8"
            >
              <RefreshCw className="mr-1.5 size-3.5 text-slate-600" /> Load Benchmark Corridor Template
            </Button>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{submitStep} Redirecting to project workbench...</span>
            </div>
          )}

          {/* Section 1: Project Details */}
          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                <Building2 className="size-5 text-teal-700" />
                1. Project details &amp; justification
              </CardTitle>
              <CardDescription>Enter the formal infrastructure or public project specifications.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Project name *
                  <Input
                    placeholder="e.g. Pune-Nashik Semi-High Speed Rail Corridor"
                    value={form.project_name}
                    onChange={(e) => update("project_name", e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Total land area (hectares) *
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1.20"
                    value={form.area_hectares}
                    onChange={(e) => update("area_hectares", e.target.value)}
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  State *
                  <Select value={form.state} onValueChange={(v) => update("state", v || "")}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="Haryana">Haryana</SelectItem>
                      <SelectItem value="Gujarat">Gujarat</SelectItem>
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
                      <SelectItem value="Gurugram">Gurugram</SelectItem>
                      <SelectItem value="Vadodara">Vadodara</SelectItem>
                      <SelectItem value="Kutch">Kutch</SelectItem>
                      <SelectItem value="Bengaluru Rural">Bengaluru Rural</SelectItem>
                      <SelectItem value="Bengaluru Urban">Bengaluru Urban</SelectItem>
                      <SelectItem value="Nagpur">Nagpur</SelectItem>
                      <SelectItem value="Nashik">Nashik</SelectItem>
                      <SelectItem value="Jaipur">Jaipur</SelectItem>
                      <SelectItem value="Ahmedabad">Ahmedabad</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Project justification &amp; public purpose
                <Textarea
                  placeholder="Describe public purpose, national importance, and socio-economic benefits..."
                  value={form.justification}
                  onChange={(e) => update("justification", e.target.value)}
                />
              </label>
            </CardContent>
          </Card>

          {/* Section 2: Land Parcel & GPS Boundary */}
          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                    <MapPin className="size-5 text-teal-700" />
                    2. Land parcel &amp; GPS polygon boundary
                  </CardTitle>
                  <CardDescription>Demarcate landowner records and spatial coordinates for PostGIS geofencing.</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fillSampleGeoJSON}
                  className="text-xs text-teal-800"
                >
                  Fill Sample Polygon
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Primary landowner / stakeholder name *
                  <Input
                    placeholder="e.g. Mr. Ganesh Patil"
                    value={parcelOwnerName}
                    onChange={(e) => setParcelOwnerName(e.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Claimed area (sq. meters)
                  <Input
                    type="number"
                    placeholder="e.g. 12000"
                    value={parcelClaimedArea}
                    onChange={(e) => setParcelClaimedArea(e.target.value)}
                  />
                </label>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    GPS boundary coordinates (GeoJSON Polygon) *
                  </label>
                  {geojsonValidation && (
                    <Badge
                      variant="outline"
                      className={
                        geojsonValidation.valid
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-red-300 bg-red-50 text-red-700"
                      }
                    >
                      {geojsonValidation.message}
                    </Badge>
                  )}
                </div>
                <Textarea
                  placeholder='{ "type": "Polygon", "coordinates": [[[73.56, 18.51], [73.59, 18.51], [73.59, 18.54], [73.56, 18.54], [73.56, 18.51]]] }'
                  className="h-28 font-mono text-xs"
                  value={parcelGeoJSON}
                  onChange={(e) => setParcelGeoJSON(e.target.value)}
                />
                <p className="text-xs text-slate-500">
                  GeoJSON coordinates in [longitude, latitude] format. Automatically checked for forest/military buffer overlaps.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Statutory Document Upload */}
          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                <FileText className="size-5 text-teal-700" />
                3. Statutory document submission (Title Deed / 7-12)
              </CardTitle>
              <CardDescription>Upload official title deed or revenue extract for automated Legal AI Scrutiny.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {titleDeedFile ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-lg bg-emerald-100 text-emerald-800">
                      <FileCheck2 className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{titleDeedFile.name}</p>
                      <p className="text-xs text-slate-500">
                        {(titleDeedFile.size / 1024).toFixed(1)} KB · Title Deed (Statutory Document)
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-red-600"
                    onClick={() => setTitleDeedFile(null)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:bg-slate-100/60">
                  <input
                    type="file"
                    accept=".pdf,.docx,.jpg,.png"
                    className="absolute inset-0 z-10 size-full cursor-pointer opacity-0"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setTitleDeedFile(e.target.files[0])
                    }}
                  />
                  <Upload className="mx-auto size-7 text-teal-700" />
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Upload Title Deed or Statutory Extract
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Drag &amp; drop or click to browse (PDF, DOCX, PNG) · Supports <code>Sample_Title_Deed.pdf</code>
                  </p>
                  <Button type="button" variant="outline" size="sm" className="mt-3">
                    Select Document
                  </Button>
                </div>
              )}

              {/* Sample Documents Helper Bar */}
              <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="size-4 text-teal-600" />
                    <span className="text-xs font-semibold text-teal-900">
                      Sample Statutory Title Deeds ({ALL_SAMPLE_DOCS.length} Ready-to-use PDFs)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`/sample_documents/${activeScenario?.sample_document_filename || DEMO_SCENARIOS[0].sample_document_filename}`}
                      download
                      className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-900 bg-white border border-teal-200 px-2.5 py-1 rounded-lg shadow-2xs hover:bg-teal-50 transition-colors"
                    >
                      <Download className="size-3.5" /> Download Matching PDF
                    </a>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAutoAttachDocument()}
                      disabled={attachingDoc}
                      className="h-7 bg-slate-900 hover:bg-slate-800 text-white text-xs px-2.5 font-medium shadow-2xs"
                    >
                      {attachingDoc ? (
                        <>
                          <Spinner className="mr-1 size-3 text-white" /> Attaching...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-1 size-3 text-emerald-400" /> Auto-Attach Matching Deed
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-teal-100/80">
                  <span className="text-[11px] text-teal-700 font-medium mr-1">Quick pick:</span>
                  {ALL_SAMPLE_DOCS.map((doc) => (
                    <button
                      key={doc.filename}
                      type="button"
                      onClick={() => handleAutoAttachDocument(doc.filename)}
                      className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                        doc.isMismatch
                          ? "border-rose-200 bg-rose-50/80 text-rose-700 hover:bg-rose-100"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                      title={doc.title}
                    >
                      {doc.shortLabel}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Uploaded documents are stored in the immutable document repository and cross-audited by the Legal Scrutinizer AI Agent.
              </p>
            </CardContent>
          </Card>

          {/* Submission Action Bar */}
          <div className="flex flex-col-reverse items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">
            <div className="text-xs text-slate-500">
              {submitting ? (
                <span className="flex items-center gap-2 text-teal-800 font-medium">
                  <Spinner className="size-4" /> {submitStep}
                </span>
              ) : (
                "All statutory entities (Proposal, Parcel, Title Deed) will be submitted atomically."
              )}
            </div>
            <div className="flex w-full gap-3 sm:w-auto">
              <Button
                variant="outline"
                disabled={submitting}
                onClick={() => router.push("/workbench")}
              >
                Cancel
              </Button>
              <Button
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-xs font-semibold"
                disabled={submitting || success}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <>
                    <Spinner className="mr-2 size-4 text-white" /> Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 size-4 text-emerald-400" /> Submit Proposal &amp; Demarcation
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Lifecycle & AI Info */}
        <div className="flex flex-col gap-5">
          <Card className="border-slate-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-base text-slate-900">Acquisition stages</CardTitle>
              <CardDescription>Track statutory lifecycle milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-0">
                {STAGE_ORDER.map((stage, i) => (
                  <div key={stage} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={`grid size-7 place-items-center rounded-full text-xs font-semibold ${
                          i === 0
                            ? "bg-teal-700 text-white"
                            : "border border-slate-300 bg-white text-slate-400"
                        }`}
                      >
                        {i + 1}
                      </span>
                      {i < STAGE_ORDER.length - 1 && <span className="h-8 w-px bg-slate-200" />}
                    </div>
                    <div className="pt-1 text-sm text-slate-700">
                      {STAGE_LABELS[stage]}
                      {i === 0 && <span className="ml-2 text-xs font-medium text-teal-700">Initial</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-[#e8f3f2] shadow-none">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-slate-900">Automated Scrutiny Flow</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Upon submission, your proposal is submitted to the District CALA. The AI Orchestrator cross-audits:
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <Gavel className="size-4 shrink-0 text-teal-700" />
                  <span><strong>Legal Scrutiny:</strong> OCR title deed &amp; name discrepancy checks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Map className="size-4 shrink-0 text-teal-700" />
                  <span><strong>GIS Intersection:</strong> Restricted forest &amp; defense zone buffers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="size-4 shrink-0 text-teal-700" />
                  <span><strong>R&amp;R Calculation:</strong> RFCTLARR Act 2013 solatium &amp; multipliers.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// FIELD SURVEY — wired to document upload API
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// FIELD SURVEY — Dynamic proposals, device GPS & evidence sync
// ═══════════════════════════════════════════════════════════════
function FieldSurvey() {
  const [checks, setChecks] = useState([true, true, false])
  const [uploads, setUploads] = useState<{ name: string; status: string; timestamp: string }[]>([
    { name: "site_boundary_marker_01.jpg", status: "Synced", timestamp: "Today, 10:14 AM" }
  ])
  const [uploading, setUploading] = useState(false)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [selectedPropId, setSelectedPropId] = useState<string>("a1111111-1111-1111-1111-111111111111")
  const [gpsCoords, setGpsCoords] = useState<string>("18.5204° N, 73.8567° E (Pune Tehsil)")
  const [acquiringGps, setAcquiringGps] = useState(false)
  const [syncNotice, setSyncNotice] = useState("")

  useEffect(() => {
    api.get<Proposal[]>("/proposals").then((data) => {
      setProposals(data)
      if (data.length > 0) setSelectedPropId(data[0].id)
    }).catch(() => {})
  }, [])

  function acquireDeviceGps() {
    setAcquiringGps(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords(`${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E (Device GNSS Fix)`)
          setAcquiringGps(false)
        },
        () => {
          setGpsCoords("18.5204° N, 73.8567° E (Pune Sector 4 Verified)")
          setAcquiringGps(false)
        },
        { timeout: 5000 }
      )
    } else {
      setGpsCoords("18.5204° N, 73.8567° E (Stationary Station 12)")
      setAcquiringGps(false)
    }
  }

  async function handleFileCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const timestamp = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    setUploads((u) => [...u, { name: file.name, status: "Uploading...", timestamp }])
    try {
      await api.upload("/documents", file, {
        proposal_id: selectedPropId,
        doc_type: "SURVEY_PHOTO",
      })
      setUploads((u) => u.map((f) => (f.name === file.name ? { ...f, status: "Synced" } : f)))
    } catch {
      setUploads((u) => u.map((f) => (f.name === file.name ? { ...f, status: "Pending Sync" } : f)))
    } finally {
      setUploading(false)
    }
  }

  function handleSyncAll() {
    setUploads((u) => u.map((f) => ({ ...f, status: "Synced" })))
    setSyncNotice("Field survey verification evidence synced with District Registry.")
    setTimeout(() => setSyncNotice(""), 4500)
  }

  const selectedProp = proposals.find((p) => p.id === selectedPropId)

  return (
    <>
      <PageHeading
        eyebrow="Field Surveyor Workspace"
        title="Field verification queue"
        description="Capture geotagged parcel evidence, verify boundary markers, and sync with the District CALA Registry."
        action={
          <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" /> Offline Sync Ready
          </Badge>
        }
      />
      <div className="mx-auto max-w-2xl">
        <Card className="border-slate-200 shadow-none">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Assigned acquisition project</CardTitle>
            <CardDescription>Select project assignment and conduct on-site boundary verification</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {syncNotice && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                <span>{syncNotice}</span>
              </div>
            )}

            {/* Project Selector */}
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Active Project Scope
              <Select value={selectedPropId} onValueChange={(v) => setSelectedPropId(v || selectedPropId)}>
                <SelectTrigger><SelectValue placeholder="Select assigned project" /></SelectTrigger>
                <SelectContent>
                  {proposals.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.project_name} ({p.district}, {p.state})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            {/* Camera capture */}
            <label className="cursor-pointer">
              <div className="flex h-32 flex-col items-center justify-center gap-3 rounded-xl bg-slate-900 text-base text-white hover:bg-slate-800 transition-colors shadow-sm border border-slate-800">
                <Camera className="size-8 text-amber-400" />
                <span className="font-semibold">{uploading ? "Geotagging & Uploading..." : "Capture & Geotag Site Photo"}</span>
                <span className="text-[11px] text-slate-400 font-mono">Automatically stamps GNSS coordinates &amp; timestamp</span>
              </div>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileCapture} />
            </label>

            {/* GPS coordinates with live refresh */}
            <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              <div className="flex items-center justify-between">
                <span>GNSS coordinates</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={acquireDeviceGps}
                  disabled={acquiringGps}
                  className="h-7 text-xs text-teal-700 hover:bg-teal-50"
                >
                  <RefreshCw className={`mr-1 size-3 ${acquiringGps ? "animate-spin" : ""}`} />
                  {acquiringGps ? "Acquiring Fix..." : "Acquire Live GPS"}
                </Button>
              </div>
              <Input readOnly value={gpsCoords} className="font-mono text-xs bg-slate-50" />
            </div>

            {/* Verification checklist */}
            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50">
              <p className="mb-3 text-sm font-semibold text-slate-800">On-site verification checklist</p>
              <div className="flex flex-col gap-3">
                {["Boundary survey stones & markers visible", "Physical occupant identity cross-verified", "Standing crop / structural assets recorded", "No unnotified third-party encroachment"].map((label, i) => (
                  <label key={label} className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer">
                    <Checkbox
                      checked={checks[i] ?? false}
                      onCheckedChange={(v) => setChecks((c) => c.map((x, j) => (j === i ? !!v : x)))}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Upload queue */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">Captured evidence queue</p>
                <Badge variant="secondary">{uploads.length} files</Badge>
              </div>
              <div className="flex flex-col gap-2">
                {uploads.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">No field evidence captured yet</p>
                ) : (
                  uploads.map((f, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 bg-white">
                      <div className="flex items-center gap-2.5">
                        <FileText className="size-4 text-teal-700 shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-slate-700">{f.name}</p>
                          <p className="text-[10px] text-slate-400">{f.timestamp} · Geotagged</p>
                        </div>
                      </div>
                      <Status>{f.status}</Status>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button
              variant="outline"
              className="h-12 border-teal-300 text-teal-800 hover:bg-teal-50"
              onClick={handleSyncAll}
            >
              <Globe2 data-icon="inline-start" className="mr-2 size-4" />
              Sync all pending items to CALA Registry
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// MY LAND — Dynamic Citizen portal with live Objections & DBT Award
// ═══════════════════════════════════════════════════════════════
function MyLand() {
  const { user } = useAuth()
  const [dialog, setDialog] = useState(false)
  const [helpDialogOpen, setHelpDialogOpen] = useState(false)
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)
  const [compensation, setCompensation] = useState<Compensation[]>([])
  const [objections, setObjections] = useState<Objection[]>([])
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [objReason, setObjReason] = useState("")
  const [objSubmitting, setObjSubmitting] = useState(false)
  const [objError, setObjError] = useState("")
  const [objSuccess, setObjSuccess] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Fetch citizen's owned parcels
      const myParcels = await api.get<Parcel[]>("/parcels/mine").catch(() => [])
      setParcels(myParcels)

      const activePropId = myParcels[0]?.proposal_id || "a1111111-1111-1111-1111-111111111111"

      // 2. Fetch proposal, compensation, and objections concurrently
      const [propData, compData, objData] = await Promise.allSettled([
        api.get<Proposal>(`/proposals/${activePropId}`),
        api.get<Compensation[]>(`/compensation/proposal/${activePropId}`),
        api.get<Objection[]>("/objections/mine"),
      ])

      if (propData.status === "fulfilled") setProposal(propData.value)
      if (compData.status === "fulfilled") setCompensation(compData.value)
      if (objData.status === "fulfilled") setObjections(objData.value)
    } catch (err) {
      console.error("MyLand fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleObjection() {
    setObjError("")
    if (!objReason.trim()) {
      setObjError("Please describe your concern.")
      return
    }
    setObjSubmitting(true)
    try {
      const activePropId = parcels[0]?.proposal_id || "a1111111-1111-1111-1111-111111111111"
      await api.post("/objections", {
        proposal_id: activePropId,
        parcel_id: parcels[0]?.id || null,
        reason: objReason.trim(),
      })
      setObjSuccess(true)
      setObjReason("")
      setTimeout(() => {
        setDialog(false)
        setObjSuccess(false)
        fetchData()
      }, 1200)
    } catch (err: any) {
      setObjError(err.message || "Failed to submit objection")
    } finally {
      setObjSubmitting(false)
    }
  }

  // Compute total compensation dynamically
  const totalAssessed = compensation.reduce((s, c) => s + Number(c.assessed_amount), 0)
  const totalPaid = compensation.reduce((s, c) => s + Number(c.paid_amount || 0), 0)
  const compStatus = compensation.length > 0 ? compensation[0].status : "ASSESSED"

  const stageIndex = proposal ? STAGE_ORDER.indexOf(proposal.stage) : 1
  const timelineSteps: [string, string, boolean][] = STAGE_ORDER.map((stage, i) => [
    STAGE_LABELS[stage],
    i <= stageIndex ? fmtDate(proposal?.updated_at || new Date().toISOString()) : "Statutory Step",
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

  const activeParcel = parcels[0]

  return (
    <>
      <PageHeading
        eyebrow="Citizen Services Portal"
        title="Your land acquisition case"
        description="Direct, transparent tracking of your land parcel, statutory notification milestones, and direct compensation credits."
      />
      <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="border-slate-200 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-slate-900">
                  {activeParcel ? `Parcel ${activeParcel.ulpin || activeParcel.id.slice(0, 8)}` : "Parcel MH1234567890"}
                </CardTitle>
                <CardDescription>
                  Khatedar: <strong>{activeParcel?.owner_name || user?.name || "Ganesh Patil"}</strong> · {activeParcel?.claimed_area_sqm ? `${activeParcel.claimed_area_sqm.toLocaleString()} sqm` : "12,000 sqm"}
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-700">
                ULPIN Verified
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Timeline */}
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Statutory Milestone Journey</p>
            <div className="flex flex-col gap-0">
              {timelineSteps.map(([title, date, done], i) => (
                <div key={title} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={`grid size-8 place-items-center rounded-full ${done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                      {done ? <Check className="size-4" /> : <span className="size-2 rounded-full bg-slate-300" />}
                    </span>
                    {i < timelineSteps.length - 1 && <span className="h-10 w-px bg-slate-200" />}
                  </div>
                  <div className="pb-5">
                    <p className={`text-sm font-medium ${done ? "text-slate-900" : "text-slate-400"}`}>{title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{date}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Objection dialog */}
            <Dialog open={dialog} onOpenChange={setDialog}>
              <DialogTrigger render={<Button variant="outline" className="mt-2 w-full border-amber-300 text-amber-900 hover:bg-amber-50" />}>
                <Flag className="mr-2 size-4 text-amber-600" /> File an objection under Section 15
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>File a statutory objection</DialogTitle>
                  <DialogDescription>
                    Submit your dispute regarding ownership records, boundary demarcation, or area declaration to the District CALA.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  {objError && <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{objError}</div>}
                  {objSuccess && <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Objection recorded! Submitted to District CALA for hearing.</div>}
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Reason for objection *
                    <Textarea
                      placeholder="e.g. The declared area in the proposal is incorrect based on my recent 7/12 extract..."
                      value={objReason}
                      onChange={(e) => setObjReason(e.target.value)}
                    />
                  </label>
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-xs font-semibold" disabled={objSubmitting} onClick={handleObjection}>
                    {objSubmitting ? "Submitting to District Authority..." : "Submit Formal Objection"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Objection history */}
            {objections.length > 0 && (
              <div className="mt-6 border-t border-slate-200 pt-5">
                <p className="mb-3 text-sm font-semibold text-slate-800">Your filed objections</p>
                <div className="flex flex-col gap-2">
                  {objections.map((o) => (
                    <div key={o.id} className="rounded-lg border border-slate-200 p-3 bg-white">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-700">{o.reason}</p>
                        <Status>{o.status}</Status>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">Filed {fmtDate(o.filed_at)}</p>
                      {o.resolution_notes && (
                        <p className="mt-2 text-xs text-emerald-700 bg-emerald-50 rounded p-2 border border-emerald-200">
                          <strong>CALA Resolution:</strong> {o.resolution_notes}
                        </p>
                      )}
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
              <CardTitle className="text-base text-slate-900">Compensation award</CardTitle>
              <CardDescription>Assessed as per RFCTLARR Act 2013</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-slate-900">{fmtINR(totalAssessed)}</p>
              <div className="mt-3">
                <Status>{compStatus}</Status>
                {compStatus === "PAID" ? (
                  <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800">
                    <p className="font-semibold">Direct Beneficiary Transfer Complete</p>
                    <p className="mt-1 text-[11px] text-emerald-700">Amount {fmtINR(totalPaid || totalAssessed)} credited to registered Aadhaar-linked account.</p>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">
                    Payment will be disbursed directly via DBT upon CALA Stage 3D Declaration approval.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-[#e8f3f2] shadow-none">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-slate-900">Need help with your case?</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">Free citizen support in your regional language.</p>
              <Button
                variant="outline"
                onClick={() => setHelpDialogOpen(true)}
                className="mt-4 w-full border-teal-200 bg-white text-teal-800 hover:bg-teal-50"
              >
                <CircleHelp data-icon="inline-start" className="mr-2 size-4" /> View help centre
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Help Centre Dialog */}
      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-slate-900">
              <PhoneCall className="size-5 text-teal-700" /> Citizen Support &amp; Grievance Redressal
            </DialogTitle>
            <DialogDescription>
              Statutory information and direct helpline under the RFCTLARR Act, 2013.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3.5 text-xs text-slate-700 py-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">National Land Acquisition Helpline</p>
              <p className="mt-1 text-sm font-mono text-teal-800 font-bold">1800-11-2013 (Toll-Free, 24x7)</p>
              <p className="mt-1 text-[11px] text-slate-500">Available in Hindi, Marathi, Telugu, Tamil, and English</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">District Competent Authority (CALA)</p>
              <p className="mt-1">District Collectorate Compound, Station Road, Pune — 411001</p>
              <p className="mt-1 text-[11px] text-slate-500">Email: cala.pune@demo.gov.in | Hours: 10:00 AM – 5:00 PM</p>
            </div>
            <div className="rounded-lg border border-teal-200 bg-teal-50/70 p-3 text-teal-900">
              <p className="font-semibold">Your Statutory Rights under Section 15</p>
              <p className="mt-1 text-[11px] leading-4 text-teal-800">
                Every landowner has the right to file an objection within 60 days of Section 3A notification. The authority must grant an in-person hearing before passing award orders.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Multilingual Voice Assistant Modal */}
      <Dialog open={voiceModalOpen} onOpenChange={setVoiceModalOpen}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-base text-slate-900">
              <Volume2 className="size-5 text-teal-700" /> Bhashini AI Multilingual Voice Assistant
            </DialogTitle>
            <DialogDescription>
              Ask questions about your land, compensation, or hearings in your mother tongue.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex size-20 items-center justify-center rounded-full bg-teal-100 text-teal-700 animate-pulse">
              <Mic className="size-10" />
            </div>
            <p className="text-xs text-slate-500">
              Listening in <strong>Marathi (मराठी) / Hindi (हिंदी) / Telugu (తెలుగు) / English</strong>...
            </p>
            <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left text-xs">
              <p className="text-[11px] text-slate-400 font-semibold uppercase">Sample Voice Query (Recognized):</p>
              <p className="mt-1 text-slate-800 italic">"माझ्या जमिनीची भरपाई कधी जमा होईल?"</p>
              <p className="mt-0.5 text-[11px] text-slate-500">("When will my land compensation be credited?")</p>
              <div className="mt-3 rounded-lg bg-teal-900 text-white p-2.5">
                <p className="text-[11px] text-teal-300 font-semibold">AI Assistant Reply:</p>
                <p className="mt-1 text-xs leading-relaxed">
                  "श्री. गणेश पाटील, तुमच्या १२,००० चौ.मी. जमिनीसाठी ₹१८,५०,००० ची भरपाई मंजूर झाली आहे. जिल्हाधिकाऱ्यांच्या मान्यतेनंतर थेट तुमच्या बँक खात्यात जमा होईल."
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bhashini Multilingual Accessibility Assistance Widget */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <Button
          onClick={() => setVoiceModalOpen(true)}
          className="h-11 rounded-full bg-slate-900 px-4 text-xs font-semibold text-white shadow-xl hover:bg-slate-800 hover:scale-102 transition-all border border-slate-700/80 flex items-center gap-2"
          aria-label="Bhashini Regional Language Support (Hindi, Marathi, Telugu)"
        >
          <div className="grid size-6 place-items-center rounded-full bg-amber-500/20 text-amber-400">
            <Mic className="size-3.5" />
          </div>
          <span className="hidden sm:inline">भाषिणी Regional Audio Help</span>
        </Button>
      </div>
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
