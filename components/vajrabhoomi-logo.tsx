"use client"

import React from "react"

interface VajraBhoomiLogoProps {
  className?: string
  size?: number
  withText?: boolean
  subtext?: string
  textColor?: string
}

export function VajraBhoomiLogo({
  className = "",
  size = 36,
  withText = false,
  subtext = "National Land Governance",
  textColor = "text-white",
}: VajraBhoomiLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* VajraBhoomi Geometric Insignia */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 p-1 border border-slate-700/80 shadow-md shadow-slate-950/40"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Saffron Gradient */}
            <linearGradient id="vb-saffron" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF9933" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            {/* Amber / Gold Gradient */}
            <linearGradient id="vb-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Emerald Gradient */}
            <linearGradient id="vb-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Azure Blue Gradient */}
            <linearGradient id="vb-blue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            {/* Core Vajra Diamond */}
            <linearGradient id="vb-core" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>

          {/* Coordinate Reticle Ring */}
          <circle cx="50" cy="50" r="44" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          <circle cx="50" cy="50" r="34" stroke="#64748B" strokeWidth="0.8" opacity="0.3" />

          {/* 4 Land Cadastre Facets (Vajra + Bhoomi Geometry) */}
          {/* North Parcel - Saffron */}
          <path
            d="M 50 10 L 76 36 L 58 40 L 50 32 Z"
            fill="url(#vb-saffron)"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />

          {/* West Parcel - Gold */}
          <path
            d="M 50 10 L 24 36 L 42 40 L 50 32 Z"
            fill="url(#vb-amber)"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />

          {/* South-West Parcel - Emerald */}
          <path
            d="M 24 36 L 50 90 L 50 68 L 42 60 Z"
            fill="url(#vb-emerald)"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />

          {/* South-East Parcel - Blue */}
          <path
            d="M 76 36 L 50 90 L 50 68 L 58 60 Z"
            fill="url(#vb-blue)"
            stroke="#FFFFFF"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />

          {/* Lateral Vajra Thunderbolt Wings */}
          <path d="M 10 50 L 36 24 L 40 42 L 32 50 Z" fill="url(#vb-amber)" fillOpacity="0.9" />
          <path d="M 90 50 L 64 24 L 60 42 L 68 50 Z" fill="url(#vb-saffron)" fillOpacity="0.9" />
          <path d="M 10 50 L 36 76 L 40 58 L 32 50 Z" fill="url(#vb-emerald)" fillOpacity="0.9" />
          <path d="M 90 50 L 64 76 L 60 58 L 68 50 Z" fill="url(#vb-blue)" fillOpacity="0.9" />

          {/* Central Vajra Diamond Core */}
          <polygon
            points="50,28 66,50 50,72 34,50"
            fill="url(#vb-core)"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />

          {/* Inner Geodetic Eye */}
          <polygon points="50,38 58,50 50,62 42,50" fill="#0A0F1D" />
          <circle cx="50" cy="50" r="3.5" fill="#FBBF24" />

          {/* Cadastral Crosshair */}
          <line x1="43" y1="50" x2="57" y2="50" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
          <line x1="50" y1="43" x2="50" y2="57" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>

      {/* Typography Brand (Optional) */}
      {withText && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight text-base ${textColor}`}>
              Vajra<span className="text-amber-400">Bhoomi</span>
            </span>
            <span className="rounded bg-amber-500/20 px-1 py-0.2 text-[9px] font-mono font-bold text-amber-300 border border-amber-500/30">
              DPI
            </span>
          </div>
          {subtext && (
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase truncate">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default VajraBhoomiLogo
