import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import indiaMapUrl from '@/assets/maps/india.svg'

type Threat = {
  id: string
  lat: number
  lng: number
  title: string
  severity: 'high' | 'medium' | 'low'
  region: string
}

type IndiaMapProps = {
  threats: Threat[]
  className?: string
}

const MIN_LNG = 67
const LNG_RANGE = 31
const MAX_LAT = 38
const LAT_RANGE = 32

function pct(lat: number, lng: number): { x: number; y: number } {
  return {
    x: ((lng - MIN_LNG) / LNG_RANGE) * 100,
    y: ((MAX_LAT - lat) / LAT_RANGE) * 100,
  }
}

const severityColor = {
  high: '#C62828',
  medium: '#D97706',
  low: '#4D7C0F',
}

const severitySize = {
  high: 12,
  medium: 8,
  low: 5,
}

const severityOpacity = {
  high: 0.9,
  medium: 0.7,
  low: 0.5,
}

export function IndiaMap({ threats, className }: IndiaMapProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string; severity: string } | null>(null)

  const markers = useMemo(
    () =>
      threats.map((t) => {
        const pos = pct(t.lat, t.lng)
        return { ...t, ...pos }
      }),
    [threats]
  )

  return (
    <div className={cn('relative w-full', className)} style={{ paddingBottom: '116.7%' }}>
      <div className="absolute inset-0">
        <img
          src={indiaMapUrl}
          alt="India map"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>

      {markers.map((m) => (
        <div
          key={m.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
          style={{ left: `${m.x}%`, top: `${m.y}%` }}
          onMouseEnter={() =>
            setTooltip({ x: m.x, y: m.y, text: `${m.title} — ${m.region}`, severity: m.severity })
          }
          onMouseLeave={() => setTooltip(null)}
        >
          <div
            className="rounded-full transition-transform duration-150 group-hover:scale-150"
            style={{
              width: severitySize[m.severity],
              height: severitySize[m.severity],
              backgroundColor: severityColor[m.severity],
              opacity: severityOpacity[m.severity],
              boxShadow: `0 0 ${m.severity === 'high' ? '8px 4px' : '4px 2px'} ${severityColor[m.severity]}40`,
            }}
          />
        </div>
      ))}

      {tooltip && (
        <div
          className="absolute pointer-events-none z-20 px-2.5 py-1.5 bg-[#161616] text-[#FAF9F6] text-xs rounded-sm whitespace-nowrap shadow-sm"
          style={{
            left: `${Math.min(tooltip.x, 85)}%`,
            top: `${Math.max(tooltip.y - 4, 2)}%`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.text}
        </div>
      )}

      <div className="absolute bottom-2 right-2 flex items-center gap-2.5 text-[10px] text-et-secondary bg-white/90 px-2.5 py-1.5 rounded-sm border border-et-divider z-10">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColor.high }} /> High
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColor.medium }} /> Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColor.low }} /> Low
        </span>
      </div>
    </div>
  )
}
