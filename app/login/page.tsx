"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { ShieldCheck, Building2, Scale, UserCheck, BarChart3, Camera, Lock, Mail, ArrowRight, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message || "Authentication failed. Check statutory credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-[#0A0F1D] text-slate-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Statutory Tricolor Ribbon */}
      <div className="h-[3.5px] w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] shadow-sm" />

      {/* Institutional Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 px-6 py-2.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-7 items-center justify-center rounded-md border border-slate-700 bg-slate-800">
              <ShieldCheck className="size-4 text-amber-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                भारत सरकार | Government of India
              </p>
              <p className="text-[10px] text-slate-400">
                Digital Public Infrastructure for Land Governance (RFCTLARR 2013)
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            NIC SSO 2.0 Identity Gateway Active
          </div>
        </div>
      </header>

      {/* Main Login Workspace */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          {/* Official Emblem & Portal Title */}
          <div className="text-center">
            <div className="mx-auto mb-3.5 flex size-14 items-center justify-center rounded-2xl border border-slate-700/80 bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl shadow-black/40">
              <ShieldCheck className="size-7 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              NLAMS <span className="font-semibold text-amber-400">Vajracore</span>
            </h1>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
              National Land Acquisition &amp; Management System
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Statutory Multi-Authority Single Sign-On Portal
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/80 p-7 shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-semibold tracking-wide text-white">
                Officer Authentication
              </h2>
              <span className="text-[11px] font-mono text-slate-400">Secured via NIC-eGov</span>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-300">
                  Official Email ID / NIC UID
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail className="size-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. cala.pune@demo.gov.in"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Passphrase / Token
                  </label>
                  <span className="text-[10px] text-slate-400">Default: Demo@1234</span>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="size-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-lg border border-slate-700/80 bg-slate-800/70 pl-9 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-900 transition-all hover:bg-white hover:shadow-md disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Authorize Statutory Session"}
                <ArrowRight className="size-3.5" />
              </button>
            </form>

            {/* Statutory Benchmark Fast-Access Accounts */}
            <div className="mt-6 border-t border-slate-800/80 pt-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400/90">
                  Pre-Configured Authority Contexts
                </p>
                <span className="text-[10px] font-mono text-slate-400">1-Click Verification</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    role: "Competent Authority (CALA)",
                    agency: "District Revenue Collector / SLAO",
                    email: "cala.pune@demo.gov.in",
                    icon: Scale,
                  },
                  {
                    role: "Project Proponent (NHAI)",
                    agency: "National Highways & Infrastructure",
                    email: "nhai@demo.gov.in",
                    icon: Building2,
                  },
                  {
                    role: "Citizen Landowner",
                    agency: "Direct Benefit Beneficiary (DBT)",
                    email: "ganesh.patil@demo.gov.in",
                    icon: UserCheck,
                  },
                  {
                    role: "National Oversight (MoRTH)",
                    agency: "Central Monitoring & Apex Scrutiny",
                    email: "monitor@demo.gov.in",
                    icon: BarChart3,
                  },
                  {
                    role: "Field Cadastral Surveyor",
                    agency: "On-Ground PostGIS Verification Officer",
                    email: "surveyor.anita@demo.gov.in",
                    icon: Camera,
                  },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.email}
                      type="button"
                      disabled={loading}
                      onClick={async () => {
                        setEmail(item.email)
                        setPassword("Demo@1234")
                        setError("")
                        setLoading(true)
                        try {
                          await login(item.email, "Demo@1234")
                        } catch (err: any) {
                          setError(err.message || "Login failed")
                        } finally {
                          setLoading(false)
                        }
                      }}
                      className="group flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/40 px-3 py-2 text-left transition hover:border-slate-600 hover:bg-slate-800/80"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-300 group-hover:text-amber-400">
                          <Icon className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-slate-200 group-hover:text-white">
                            {item.role}
                          </p>
                          <p className="truncate text-[10px] text-slate-400">
                            {item.agency}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] font-mono text-slate-500 group-hover:text-slate-300">
                        Login →
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Legal / Statutory Footer */}
          <div className="text-center text-[11px] text-slate-400 space-y-1">
            <p>Empowered under Right to Fair Compensation and Transparency in Land Acquisition (RFCTLARR 2013)</p>
            <p className="text-[10px] text-slate-400">NIC National Data Centre &bull; MoRTH &bull; PM GatiShakti National Master Plan</p>
          </div>
        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-3 text-center text-[10px] text-slate-400">
        &copy; 2026 National Land Acquisition &amp; Management System (NLAMS 2.0). All Rights Reserved.
      </footer>
    </div>
  )
}

