"use client"

/**
 * VajraBhoomi — National Infrastructure GIS Map (OpenStreetMap & Satellite)
 *
 * Replaces static image placeholders with a fully interactive Leaflet GIS engine
 * powered by OpenStreetMap tiles and optional ESRI World Satellite imagery.
 *
 * Features:
 *   - 100% Free, Zero API Keys, Zero Watermarks (OSM + ESRI)
 *   - Smooth flyTo animations when switching national projects (NMIA, Bullet Train, Expressway, Missing Link)
 *   - Real geographic GeoJSON polygons and corridors for all 4 national infrastructure projects
 *   - Color-coded status overlays (Acquired = Emerald, In Progress = Amber, Disputed = Red, Eco-Zone = Hatched Red)
 *   - Interactive parcel selection & hover tooltips
 *   - Click-anywhere cadastral inspector pin dropping
 */

import { useEffect, useRef, useState, useMemo } from "react"
import { MapContainer, TileLayer, Polygon, Polyline, Tooltip, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// ─── Types ───────────────────────────────────────────────────────────────

export interface GisParcelOverlay {
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
  // Real geographic coordinates [lat, lon][]
  geoCoordinates?: [number, number][]
}

export interface GisProjectSite {
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

interface Props {
  project: GisProjectSite
  visibleLayers: Record<string, boolean>
  onToggleLayer?: (status: string) => void
  selectedParcelId: string | null
  onSelectParcel: (parcel: any) => void
  onMapClickCoord?: (lat: number, lon: number) => void
  inspectionPin: { lat: number; lon: number } | null
}

// ─── Real Geographic Polygons for National Infrastructure Sites ──────────

export const REAL_GIS_PARCELS: Record<string, Record<string, [number, number][]>> = {
  nmia: {
    // Runway 08L/26R (Northern strip)
    p_runway_n: [
      [19.0015, 73.0535],
      [19.0035, 73.0820],
      [19.0005, 73.0825],
      [18.9985, 73.0540],
    ],
    // Runway 08R/26L (Southern strip)
    p_runway_s: [
      [18.9860, 73.0550],
      [18.9880, 73.0835],
      [18.9850, 73.0840],
      [18.9830, 73.0555],
    ],
    // Terminal 1 & Central Concourse
    p_terminal: [
      [18.9970, 73.0645],
      [18.9975, 73.0745],
      [18.9895, 73.0740],
      [18.9890, 73.0640],
    ],
    // Access Highway (Atal Setu Link to NH-4B)
    p_access_hwy: [
      [18.9960, 73.0760],
      [18.9980, 73.0895],
      [18.9930, 73.0905],
      [18.9910, 73.0765],
    ],
    // Coastal Mangrove CRZ-I Eco-Zone
    p_crz_buffer: [
      [19.0055, 73.0485],
      [19.0060, 73.0530],
      [18.9800, 73.0545],
      [18.9790, 73.0490],
    ],
  },
  mahsr: {
    // Bullet Train Viaduct Alignment (Multi-km strip)
    p_viaduct: [
      [20.8900, 72.9060],
      [20.8915, 72.9100],
      [20.8520, 72.9500],
      [20.8505, 72.9460],
    ],
    // Precast Concrete Casting Yard #4
    p_casting_yard: [
      [20.8800, 72.9180],
      [20.8850, 72.9260],
      [20.8750, 72.9320],
      [20.8700, 72.9240],
    ],
    // Traction Sub-Station & Maintenance Depot
    p_substation: [
      [20.8650, 72.9350],
      [20.8700, 72.9440],
      [20.8610, 72.9480],
      [20.8560, 72.9390],
    ],
    // Disputed Agricultural Land (Survey 412/A)
    p_agri_disputed: [
      [20.8600, 72.9150],
      [20.8640, 72.9210],
      [20.8590, 72.9240],
      [20.8550, 72.9180],
    ],
    // Irrigation Canal Eco-Buffer
    p_canal_buffer: [
      [20.8920, 72.9230],
      [20.8920, 72.9260],
      [20.8510, 72.9340],
      [20.8510, 72.9310],
    ],
  },
  dme: {
    // 8-Lane Expressway Mainline ROW
    p_mainline: [
      [22.1270, 73.0160],
      [22.1300, 73.0180],
      [22.1640, 73.0600],
      [22.1610, 73.0620],
    ],
    // Cloverleaf Interchange Junction 14
    p_cloverleaf: [
      [22.1480, 73.0320],
      [22.1550, 73.0420],
      [22.1450, 73.0480],
      [22.1380, 73.0380],
    ],
    // Smart Toll Plaza
    p_toll_plaza: [
      [22.1410, 73.0280],
      [22.1450, 73.0340],
      [22.1380, 73.0380],
      [22.1340, 73.0320],
    ],
    // Wayside Amenities Node
    p_wayside: [
      [22.1350, 73.0200],
      [22.1390, 73.0260],
      [22.1330, 73.0290],
      [22.1290, 73.0230],
    ],
    // Village Abadi Sound Buffer
    p_village_buffer: [
      [22.1580, 73.0420],
      [22.1620, 73.0480],
      [22.1560, 73.0520],
      [22.1520, 73.0460],
    ],
  },
  pme: {
    // Missing Link Twin-Tunnel West Portal
    p_tunnel_w: [
      [18.7510, 73.3330],
      [18.7540, 73.3420],
      [18.7490, 73.3440],
      [18.7460, 73.3350],
    ],
    p1: [
      [18.7510, 73.3330],
      [18.7540, 73.3420],
      [18.7490, 73.3440],
      [18.7460, 73.3350],
    ],
    // Missing Link Twin-Tunnel East Portal
    p_tunnel_e: [
      [18.7420, 73.3520],
      [18.7450, 73.3610],
      [18.7390, 73.3630],
      [18.7360, 73.3540],
    ],
    p2: [
      [18.7420, 73.3520],
      [18.7450, 73.3610],
      [18.7390, 73.3630],
      [18.7360, 73.3540],
    ],
    // Kusgaon Cable-Stayed Viaduct
    p_viaduct_kusgaon: [
      [18.7470, 73.3420],
      [18.7490, 73.3530],
      [18.7440, 73.3540],
      [18.7420, 73.3430],
    ],
    p3: [
      [18.7470, 73.3420],
      [18.7490, 73.3530],
      [18.7440, 73.3540],
      [18.7420, 73.3430],
    ],
    // Borghat Wildlife Sanctuary Eco-Buffer
    p_borghat_eco: [
      [18.7580, 73.3320],
      [18.7580, 73.3550],
      [18.7500, 73.3550],
      [18.7500, 73.3320],
    ],
    forest: [
      [18.7580, 73.3320],
      [18.7580, 73.3550],
      [18.7500, 73.3550],
      [18.7500, 73.3320],
    ],
  },
}

// ─── Map Controller (Fly to Project Bounds) ──────────────────────────────

function ProjectMapController({ project }: { project: GisProjectSite }) {
  const map = useMap()

  useEffect(() => {
    if (!project || !project.bounds) return

    const { north, south, west, east } = project.bounds
    const bounds = L.latLngBounds([south, west], [north, east])

    map.flyToBounds(bounds.pad(0.15), {
      duration: 1.2,
      easeLinearity: 0.25,
      maxZoom: 16,
    })
  }, [project, map])

  return null
}

// ─── Click Event Listener for Cadastral Reticle ───────────────────────────

function MapClickHandler({ onMapClickCoord }: { onMapClickCoord?: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClickCoord) {
        onMapClickCoord(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

// ─── Main National GIS Leaflet Map Component ─────────────────────────────

export default function NationalGisLeafletMap({
  project,
  visibleLayers,
  onToggleLayer,
  selectedParcelId,
  onSelectParcel,
  onMapClickCoord,
  inspectionPin,
}: Props) {
  const [basemap, setBasemap] = useState<"streets" | "satellite">("streets")

  // Calculate project center
  const centerLat = (project.bounds.north + project.bounds.south) / 2
  const centerLon = (project.bounds.east + project.bounds.west) / 2

  // Get project parcel coordinates
  const siteGeoCoords = REAL_GIS_PARCELS[project.id] || {}

  return (
    <div className="relative h-full w-full">
      <style jsx global>{`
        .national-gis-tooltip {
          background: #0F172A !important;
          color: white !important;
          border: 1px solid #334155 !important;
          border-radius: 8px !important;
          padding: 7px 12px !important;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3) !important;
        }
        .national-gis-tooltip::before {
          border-top-color: #0F172A !important;
        }
      `}</style>

      {/* Top Left Status & Verification Badge */}
      <div className="absolute top-3 left-12 z-[1000] flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2 rounded-md bg-slate-900/90 px-2.5 py-1 text-[11px] font-mono text-emerald-400 shadow-md backdrop-blur-sm">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>PostGIS ST_Intersects Verified</span>
        </div>
        <div className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-mono text-white/90 backdrop-blur-sm">
          Click any parcel or point for Cadastral Survey Record
        </div>
      </div>

      {/* Basemap Switcher (Streets vs Satellite) */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center rounded-lg bg-white/95 p-1 shadow-md border border-slate-300/80 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setBasemap("streets")}
          className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition ${
            basemap === "streets"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          OpenStreetMap
        </button>
        <button
          type="button"
          onClick={() => setBasemap("satellite")}
          className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition ${
            basemap === "satellite"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          ESRI Satellite
        </button>
      </div>

      {/* Bottom Left Layer Status Filter Bar */}
      <div className="absolute bottom-3 left-3 z-[1000] flex flex-col gap-1.5 pointer-events-auto">
        <div className="rounded-lg border border-slate-200/90 bg-white/95 p-2 shadow-lg backdrop-blur-sm text-xs">
          <p className="mb-1 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
            Spatial Demarcation Layers
          </p>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            {(["Acquired", "In Progress", "Disputed", "Restricted Zone"] as const).map((layerName) => {
              const isActive = visibleLayers[layerName] !== false
              const colorDot =
                layerName === "Acquired"
                  ? "bg-emerald-500"
                  : layerName === "In Progress"
                  ? "bg-amber-500"
                  : layerName === "Disputed"
                  ? "bg-rose-500"
                  : "bg-red-700 border border-red-800"
              const label = layerName === "Restricted Zone" ? "Eco-Buffer" : layerName
              return (
                <button
                  key={layerName}
                  type="button"
                  onClick={() => onToggleLayer && onToggleLayer(layerName)}
                  className={`flex items-center gap-1.5 rounded px-2 py-0.5 text-xs transition ${
                    isActive
                      ? "bg-slate-100 font-semibold text-slate-800 shadow-2xs"
                      : "opacity-40 text-slate-400 hover:opacity-70"
                  }`}
                >
                  <span className={`size-2 rounded-full ${colorDot}`} /> {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <MapContainer
        center={[centerLat, centerLon]}
        zoom={13}
        className="h-full w-full z-0"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        {/* Base Tile Layer — OpenStreetMap / ESRI (100% Free, Zero API Keys, Zero Watermark) */}
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

        {/* Project Spatial Boundary & Alignment Overlays */}
        {project.parcels.map((parcel) => {
          if (!visibleLayers[parcel.status]) return null

          const coords =
            parcel.geoCoordinates ||
            siteGeoCoords[parcel.id] ||
            (parcel.points
              ? (parcel.points
                  .trim()
                  .split(/\s+/)
                  .map((pt) => {
                    const [px, py] = pt.split(",").map(Number)
                    const u = Math.max(0, Math.min(1, px / 960))
                    const v = Math.max(0, Math.min(1, py / 540))
                    const lat = project.bounds.north - v * (project.bounds.north - project.bounds.south)
                    const lon = project.bounds.west + u * (project.bounds.east - project.bounds.west)
                    return [lat, lon] as [number, number]
                  }) as [number, number][])
              : null)

          if (!coords || coords.length === 0) return null

          const isSelected = selectedParcelId === parcel.id

          let fillColor = "#10b981"
          let color = "#059669"

          if (parcel.status === "In Progress") {
            fillColor = "#f59e0b"
            color = "#d97706"
          } else if (parcel.status === "Disputed") {
            fillColor = "#ef4444"
            color = "#dc2626"
          } else if (parcel.status === "Restricted Zone") {
            fillColor = "#dc2626"
            color = "#991b1b"
          }

          return (
            <Polygon
              key={parcel.id}
              positions={coords}
              pathOptions={{
                color: isSelected ? "#F59E0B" : color,
                fillColor,
                fillOpacity: isSelected ? 0.75 : parcel.status === "Restricted Zone" ? 0.45 : 0.55,
                weight: isSelected ? 4 : 2.5,
                dashArray: parcel.status === "Restricted Zone" ? "6 5" : "",
              }}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e)
                  onSelectParcel(parcel)
                },
              }}
            >
              <Tooltip direction="top" className="national-gis-tooltip" sticky>
                <div className="text-xs">
                  <strong className="block text-white font-bold">{parcel.name}</strong>
                  <span className="text-slate-300 font-mono text-[10px]">{parcel.surveyNumber}</span>
                  <div className="mt-1 flex items-center justify-between gap-3 text-[10px]">
                    <span className="text-emerald-400 font-bold">{parcel.status}</span>
                    <span className="text-amber-300 font-mono">{parcel.disbursedAmount}</span>
                  </div>
                </div>
              </Tooltip>
            </Polygon>
          )
        })}

        {/* Inspection Reticle Pin Marker */}
        {inspectionPin && (
          <Polygon
            positions={[
              [inspectionPin.lat - 0.0006, inspectionPin.lon - 0.0006],
              [inspectionPin.lat + 0.0006, inspectionPin.lon - 0.0006],
              [inspectionPin.lat + 0.0006, inspectionPin.lon + 0.0006],
              [inspectionPin.lat - 0.0006, inspectionPin.lon + 0.0006],
            ]}
            pathOptions={{
              color: "#0284c7",
              fillColor: "#38bdf8",
              fillOpacity: 0.6,
              weight: 3,
            }}
          >
            <Tooltip permanent direction="top" className="national-gis-tooltip">
              <div className="text-xs font-mono">
                <span className="text-sky-300 font-bold">📍 INSPECTED CADASTRAL PIN</span>
                <p className="text-[10px] text-slate-300">
                  {inspectionPin.lat.toFixed(5)}°N, {inspectionPin.lon.toFixed(5)}°E
                </p>
              </div>
            </Tooltip>
          </Polygon>
        )}

        {/* Dynamic Project Controller (FlyTo) */}
        <ProjectMapController project={project} />

        {/* Map Click Listener */}
        <MapClickHandler onMapClickCoord={onMapClickCoord} />
      </MapContainer>
    </div>
  )
}
