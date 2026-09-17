"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { ShieldCheck } from "lucide-react"

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
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#082b3a]">
      <div className="w-full max-w-md space-y-8 p-8">
        {/* Branding */}
        <div className="text-center">
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-teal-400 text-[#082b3a]">
            <ShieldCheck className="size-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            NLAMS <span className="text-teal-300">2.0</span>
          </h1>
          <p className="mt-1 text-xs uppercase tracking-[.2em] text-slate-400">
            Government of India
          </p>
          <p className="mt-4 text-sm text-slate-300">
            National Land Acquisition &amp; Management System
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur"
        >
          <h2 className="mb-6 text-lg font-semibold text-white">Sign in</h2>

          {error && (
            <div className="mb-4 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <label className="mb-4 flex flex-col gap-2 text-sm font-medium text-slate-300">
            Email address
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. cala.pune@demo.gov.in"
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
          </label>

          <label className="mb-6 flex flex-col gap-2 text-sm font-medium text-slate-300">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-teal-500 px-4 py-3 text-sm font-semibold text-[#082b3a] transition-colors hover:bg-teal-400 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {/* Demo credentials hint */}
          <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-xs font-semibold text-teal-300">
              Demo accounts
            </p>
            <div className="flex flex-col gap-1.5 text-xs text-slate-400">
              <span>
                <strong className="text-slate-300">State Monitor:</strong>{" "}
                monitor@demo.gov.in
              </span>
              <span>
                <strong className="text-slate-300">Requiring Body:</strong>{" "}
                nhai@demo.gov.in
              </span>
              <span>
                <strong className="text-slate-300">CALA / Collector:</strong>{" "}
                cala.pune@demo.gov.in
              </span>
              <span>
                <strong className="text-slate-300">Field Surveyor:</strong>{" "}
                surveyor.anita@demo.gov.in
              </span>
              <span>
                <strong className="text-slate-300">Citizen:</strong>{" "}
                ganesh.patil@demo.gov.in
              </span>
              <span className="mt-1 text-teal-400/80">
                Password for all: <code>Demo@1234</code>
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
