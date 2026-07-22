import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { ShieldAlert, ScanLine, Network, Map } from 'lucide-react'

type AnalyticsPoint = {
  name: string
  value: number
}

type IndicatorPayload = {
  label: string
  value: string
  trend: string
}

const fallbackData: AnalyticsPoint[] = [
  { name: 'Scam', value: 72 },
  { name: 'Counterfeit', value: 58 },
  { name: 'Network', value: 64 },
  { name: 'Hotspots', value: 69 },
]

export function AnalyticsPanel() {
  const { data: indicators = [] } = useQuery<IndicatorPayload[]>({
    queryKey: ['analytics-panel'],
    queryFn: async () => {
      const response = await fetch('/api/indicators')
      if (!response.ok) throw new Error('Failed to load indicators')
      const payload = await response.json()
      return payload.indicators as IndicatorPayload[]
    },
    initialData: [],
  })

  const chartData = useMemo(() => {
    if (!indicators.length) return fallbackData

    const metricMap: Record<string, AnalyticsPoint> = {}
    indicators.forEach((indicator) => {
      const numericValue = Number(indicator.value.replace(/[^0-9.-]/g, ''))
      if (!Number.isFinite(numericValue)) return
      const name = indicator.label === 'Alerts Today' ? 'Scam' : indicator.label === 'Active Cases' ? 'Counterfeit' : indicator.label === 'Resolution Rate' ? 'Network' : 'Hotspots'
      metricMap[name] = { name, value: numericValue }
    })

    return Object.values(metricMap).length ? Object.values(metricMap) : fallbackData
  }, [indicators])

  return (
    <div className="rounded-sm border border-et-divider bg-et-surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-et-text">Threat Intelligence Pulse</h3>
          <p className="mt-1 text-sm text-et-secondary">Composite signal strength across key public-safety modules.</p>
        </div>
      </div>

      <div className="mt-5 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid stroke="#E6E6E6" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#666' }} />
            <YAxis tick={{ fontSize: 11, fill: '#666' }} domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#B22222" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { label: 'Scam Analyzer', value: '72%', icon: ShieldAlert },
          { label: 'Counterfeit Scan', value: '58%', icon: ScanLine },
          { label: 'Fraud Network', value: '64%', icon: Network },
          { label: 'Threat Map', value: '69%', icon: Map },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-sm border border-et-divider bg-et-bg p-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-et-red" />
                <span className="text-[11px] font-medium text-et-text">{item.label}</span>
              </div>
              <p className="mt-2 text-lg font-serif font-bold text-et-text">{item.value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
