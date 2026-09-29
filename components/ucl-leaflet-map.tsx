"use client"

/**
 * VajraBhoomi UCL — Leaflet Map Inner Component
 *
 * This component is loaded via next/dynamic with ssr: false because
 * Leaflet requires the `window` object and cannot render server-side.
 *
 * Renders GeoJSON cadastral polygons on an OpenStreetMap tile layer with:
 *   - Auto-bounds fitting on mount so all parcels are immediately centered & zoomed
 *   - Color-coded fills (red = litigated, emerald = clear title, amber = selected)
 *   - Hover tooltips showing ULPIN + owner + CTS Number
 *   - Click handler to select a parcel and fly to its centroid
 *   - Animated transitions between selected parcels
 */

import { useEffect, useRef, useMemo, useState } from "react"
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet"
import L from "leaflet"
import type { FeatureCollection, Feature, Geometry } from "geojson"

// Must import Leaflet CSS
import "leaflet/dist/leaflet.css"

// ─── Types ───────────────────────────────────────────────────────────────

interface PlotProperties {
  id: string
  ulpin: string
  owner_name: string
  cts_number: string
  litigation_flag: boolean
  ward: string | null
  area_sqm: number | null
  property_card_url: string | null
}

interface Props {
  geojson: FeatureCollection | null
  filteredFeatures: Feature<Geometry, PlotProperties>[]
  selectedUlpin: string | null
  onPlotClick: (ulpin: string) => void
  loading: boolean
}

// ─── Styling Constants ───────────────────────────────────────────────────

const STYLES = {
  clear: {
    color: "#059669",        // emerald-600 border
    weight: 2.5,
    fillColor: "#34D399",   // emerald-400 fill
    fillOpacity: 0.45,
    dashArray: "",
  },
  litigated: {
    color: "#DC2626",        // red-600 border
    weight: 2.5,
    fillColor: "#F87171",   // red-400 fill
    fillOpacity: 0.50,
    dashArray: "6 4",
  },
  selected: {
    color: "#D97706",        // amber-600 border
    weight: 4,
    fillColor: "#FBBF24",   // amber-400 fill
    fillOpacity: 0.65,
    dashArray: "",
  },
  hover: {
    weight: 3.5,
    fillOpacity: 0.65,
  },
} as const

// ─── Map Center & Zoom (Central Pune Cadastral Belt) ──────────────────────

const DEFAULT_CENTER: L.LatLngExpression = [18.5175, 73.8400]
const DEFAULT_ZOOM = 16

// ─── Auto-Fit All Cadastral Bounds on Mount ───────────────────────────────

function AutoFitCadastralBounds({ displayCollection }: { displayCollection: FeatureCollection }) {
  const map = useMap()
  const fittedRef = useRef(false)

  useEffect(() => {
    if (fittedRef.current || !displayCollection.features || displayCollection.features.length === 0) return
    try {
      const layer = L.geoJSON(displayCollection as any)
      const bounds = layer.getBounds()
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.25), { maxZoom: 17 })
        fittedRef.current = true
      }
    } catch (e) {
      console.warn("Could not auto-fit cadastral bounds:", e)
    }
  }, [displayCollection, map])

  return null
}

// ─── Fly-To Controller for Clicked Parcel ─────────────────────────────────

function FlyToSelected({ selectedUlpin, geojson }: { selectedUlpin: string | null; geojson: FeatureCollection | null }) {
  const map = useMap()

  useEffect(() => {
    if (!selectedUlpin || !geojson) return

    const feature = geojson.features.find(
      (f: any) => f.properties?.ulpin === selectedUlpin
    )
    if (!feature) return

    try {
      const layer = L.geoJSON(feature as any)
      const bounds = layer.getBounds()
      if (bounds.isValid()) {
        map.flyToBounds(bounds.pad(0.4), { duration: 0.8, easeLinearity: 0.25, maxZoom: 18 })
      }
    } catch (e) {
      console.warn("Fly to selected parcel error:", e)
    }
  }, [selectedUlpin, geojson, map])

  return null
}

// ─── Main Map Component ─────────────────────────────────────────────────

export default function UclLeafletMap({
  geojson,
  filteredFeatures,
  selectedUlpin,
  onPlotClick,
  loading,
}: Props) {
  const geoJsonRef = useRef<L.GeoJSON | null>(null)
  const [basemap, setBasemap] = useState<"streets" | "satellite">("streets")

  // Build a filtered FeatureCollection for the GeoJSON layer
  const displayCollection = useMemo<FeatureCollection>(() => {
    return {
      type: "FeatureCollection",
      features: filteredFeatures as Feature<Geometry>[],
    }
  }, [filteredFeatures])

  // Style function: per-feature styling based on litigation flag + selection
  const styleFeature = (feature: Feature<Geometry, any> | undefined) => {
    if (!feature?.properties) return STYLES.clear

    const isSelected = feature.properties.ulpin === selectedUlpin
    if (isSelected) return STYLES.selected

    return feature.properties.litigation_flag ? STYLES.litigated : STYLES.clear
  }

  // Event handlers for each polygon
  const onEachFeature = (feature: Feature<Geometry, PlotProperties>, layer: L.Layer) => {
    const props = feature.properties

    // Tooltip on hover
    layer.bindTooltip(
      `<div style="font-family: system-ui, -apple-system, sans-serif; font-size: 11px; line-height: 1.45; min-width: 150px;">
        <div style="font-weight: 700; font-size: 12px; color: #0F172A; font-family: monospace;">${props.ulpin}</div>
        <div style="color: #334155; margin-top: 2px;">${props.owner_name}</div>
        <div style="color: #64748B; font-size: 10px; margin-top: 2px;">CTS No: <strong>${props.cts_number}</strong> · ${props.area_sqm?.toLocaleString('en-IN') || ''} sqm</div>
        ${props.litigation_flag ? '<div style="color: #DC2626; font-weight: 700; font-size: 9.5px; margin-top: 3px; background: #FEE2E2; padding: 2px 6px; border-radius: 4px; display: inline-block;">⚠ LITIGATION RECORDED</div>' : '<div style="color: #059669; font-weight: 700; font-size: 9.5px; margin-top: 3px; background: #D1FAE5; padding: 2px 6px; border-radius: 4px; display: inline-block;">✓ CLEAR TITLE</div>'}
      </div>`,
      {
        sticky: true,
        direction: "top",
        offset: L.point(0, -10),
        className: "ucl-tooltip",
      }
    )

    // Hover highlight
    layer.on("mouseover", (e) => {
      const target = e.target as L.Path
      if (props.ulpin !== selectedUlpin) {
        target.setStyle(STYLES.hover)
        target.bringToFront()
      }
    })

    layer.on("mouseout", (e) => {
      const target = e.target as L.Path
      if (props.ulpin !== selectedUlpin) {
        target.setStyle(
          props.litigation_flag ? STYLES.litigated : STYLES.clear
        )
      }
    })

    // Click → select parcel & notify inspector
    layer.on("click", () => {
      onPlotClick(props.ulpin)
    })
  }

  if (loading || !geojson) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-2 size-8 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
          <p className="text-xs text-slate-500 font-medium">Loading Cadastral PostGIS Geometries…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <style jsx global>{`
        .ucl-tooltip {
          background: white !important;
          border: 1px solid #CBD5E1 !important;
          border-radius: 10px !important;
          padding: 8px 12px !important;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15) !important;
        }
        .ucl-tooltip::before {
          border-top-color: #CBD5E1 !important;
        }
        .leaflet-control-zoom a {
          background: #0F172A !important;
          color: white !important;
          border: none !important;
          font-weight: 600 !important;
          border-radius: 6px !important;
          margin-bottom: 2px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #1E293B !important;
        }
        .leaflet-control-attribution {
          font-size: 9px !important;
          background: rgba(255,255,255,0.85) !important;
        }
      `}</style>

      {/* Basemap Switcher Pill (Streets vs Satellite) */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center rounded-lg bg-white/95 p-1 shadow-md border border-slate-300/80 backdrop-blur-sm">
        <button
          onClick={() => setBasemap("streets")}
          className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition ${
            basemap === "streets"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Street Map
        </button>
        <button
          onClick={() => setBasemap("satellite")}
          className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition ${
            basemap === "satellite"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Satellite
        </button>
      </div>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full z-0"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* Base Tile Layer — OpenStreetMap / ESRI (100% Free, No Watermark, No API Key Required) */}
        {basemap === "streets" ? (
          <TileLayer
            key="osm-streets"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        ) : (
          <TileLayer
            key="esri-satellite"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        )}

        {/* GeoJSON Polygons */}
        <GeoJSON
          key={`${filteredFeatures.length}-${selectedUlpin}`}
          data={displayCollection}
          style={styleFeature}
          onEachFeature={onEachFeature}
          ref={geoJsonRef as any}
        />

        {/* Automatic bounds fitting on load */}
        <AutoFitCadastralBounds displayCollection={displayCollection} />

        {/* Animated fly-to on selection */}
        <FlyToSelected selectedUlpin={selectedUlpin} geojson={geojson} />
      </MapContainer>
    </div>
  )
}
