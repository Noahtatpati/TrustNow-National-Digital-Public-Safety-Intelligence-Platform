import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type Threat = {
  id: string
  lat: number
  lng: number
  title: string
  severity: 'high' | 'medium' | 'low'
  region: string
}

type LeafletThreatMapProps = {
  threats: Threat[]
  className?: string
  height?: number
}

const severityColor: Record<string, string> = {
  high: '#C62828',
  medium: '#D97706',
  low: '#4D7C0F',
}

const severityBg: Record<string, string> = {
  high: '#C6282820',
  medium: '#D9770620',
  low: '#4D7C0F20',
}

const severityLabel: Record<string, string> = {
  high: 'HIGH',
  medium: 'MED',
  low: 'LOW',
}

function createColoredIcon(color: string, bg: string, severity: string) {
  const label = severityLabel[severity] || ''
  const labelColor = severity === 'high' ? '#C62828' : severity === 'medium' ? '#D97706' : '#4D7C0F'
  return L.divIcon({
    className: '',
    html: `<div style="
      display: flex; align-items: center; gap: 4px;
      padding: 2px 6px 2px 2px;
      background: white;
      border: 1px solid ${labelColor}40;
      border-radius: 12px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.1);
    ">
      <div style="
        width: 10px; height: 10px;
        background: ${color};
        border: 1px solid ${bg};
        border-radius: 50%;
      "></div>
      <span style="
        font-size: 8px; font-weight: 700;
        color: ${labelColor};
        letter-spacing: 0.5px;
        text-transform: uppercase;
        line-height: 1;
      ">${label}</span>
    </div>`,
    iconSize: [severity === 'low' ? 44 : 50, 22],
    iconAnchor: [severity === 'low' ? 22 : 25, 11],
    popupAnchor: [0, -14],
  })
}

function MapBounds({ threats }: { threats: Threat[] }) {
  const map = useMap()

  useEffect(() => {
    if (threats.length > 0) {
      const bounds = L.latLngBounds(
        threats.map((t) => [t.lat, t.lng] as [number, number])
      )
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 })
      }
    } else {
      map.setView([20.5937, 78.9629], 4.5)
    }
  }, [threats, map])

  return null
}

function HeatmapLayer({ threats, visible }: { threats: Threat[]; visible: boolean }) {
  const map = useMap()

  useEffect(() => {
    if (!visible || typeof (L as any).heatLayer !== 'function') return

    const points = threats.map((t) => {
      const intensity = t.severity === 'high' ? 0.8 : t.severity === 'medium' ? 0.5 : 0.3
      return [t.lat, t.lng, intensity] as [number, number, number]
    })

    const layer = (L as any).heatLayer(points, {
      radius: 35,
      blur: 20,
      maxZoom: 8,
      max: 1.0,
      gradient: {
        0.3: '#4D7C0F',
        0.5: '#D97706',
        0.8: '#C62828',
      },
    })

    layer.addTo(map)
    return () => {
      map.removeLayer(layer)
    }
    // Stable key — avoid re-creating on every render
  }, [visible, map, threats.length, threats.map(t => t.id).join(',')])

  return null
}



export function LeafletThreatMap({ threats, className, height = 500 }: LeafletThreatMapProps) {
  const [showHeatmap, setShowHeatmap] = useState(true)

  return (
    <div className={className} style={{ height, width: '100%' }}>
      <div className="relative w-full h-full">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={4.5}
          className="w-full h-full"
          zoomControl={true}
          scrollWheelZoom={true}
          style={{ background: '#FAF9F6' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <MapBounds threats={threats} />
          <HeatmapLayer threats={threats} visible={showHeatmap} />

          {threats.map((threat) => (
            <Marker
              key={threat.id}
              position={[threat.lat, threat.lng]}
              icon={createColoredIcon(severityColor[threat.severity], severityBg[threat.severity], threat.severity)}
            >
              <Popup>
                <div className="font-sans min-w-[180px]">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: severityColor[threat.severity] }}
                    />
                    <p className="text-sm font-semibold text-[#161616]">{threat.title}</p>
                  </div>
                  <p className="text-xs text-[#666] mb-2">{threat.region}</p>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span
                      className="px-1.5 py-0.5 rounded-sm font-medium uppercase tracking-wider"
                      style={{ backgroundColor: severityBg[threat.severity], color: severityColor[threat.severity] }}
                    >
                      {threat.severity}
                    </span>
                    <span className="text-[#999]">ID: {threat.id}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Heatmap toggle */}
        <div className="absolute top-3 left-3 z-[1000] flex gap-1 bg-white border border-et-divider rounded-sm shadow-sm p-1">
          <button
            onClick={() => setShowHeatmap(true)}
            className={`px-3 py-1.5 text-[10px] rounded-sm transition-colors cursor-pointer font-medium ${
              showHeatmap ? 'bg-et-red text-white' : 'text-et-secondary hover:text-et-text'
            }`}
          >
            Heatmap
          </button>
          <button
            onClick={() => setShowHeatmap(false)}
            className={`px-3 py-1.5 text-[10px] rounded-sm transition-colors cursor-pointer font-medium ${
              !showHeatmap ? 'bg-et-red text-white' : 'text-et-secondary hover:text-et-text'
            }`}
          >
            Markers
          </button>
        </div>
      </div>
    </div>
  )
}

export function ThreatMapWidget({ threats, className }: LeafletThreatMapProps) {
  return (
    <div className={className} style={{ height: 280, width: '100%' }}>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={4.2}
        className="w-full h-full"
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        style={{ background: '#FAF9F6' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapBounds threats={threats} />

        {threats.map((threat) => (
          <Marker
            key={threat.id}
            position={[threat.lat, threat.lng]}
            icon={createColoredIcon(severityColor[threat.severity], severityBg[threat.severity], threat.severity)}
          >
            <Popup>
              <div className="font-sans min-w-[160px]">
                <p className="text-xs font-semibold text-[#161616]">{threat.title}</p>
                <p className="text-[10px] text-[#666]">{threat.region}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
