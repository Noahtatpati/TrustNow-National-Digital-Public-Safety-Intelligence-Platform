import { useState, useEffect, useCallback } from 'react'
import { TopNav } from '@/layouts/top-nav'
import { StateWrapper } from '@/components/ui/state-wrapper'
import { LeafletThreatMap } from '@/components/threat/leaflet-map'
import { Badge } from '@/components/ui/badge'

type Threat = {
  id: string
  lat: number
  lng: number
  title: string
  severity: 'high' | 'medium' | 'low'
  region: string
}

type CityThreat = {
  city: string
  threats: number
  risk: string
}

type ThreatType = {
  type: string
  count: number
}

export function ThreatMapPage() {
  const [threats, setThreats] = useState<Threat[]>([])
  const [cityThreats, setCityThreats] = useState<CityThreat[]>([])
  const [threatTypes, setThreatTypes] = useState<ThreatType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [showAllCities, setShowAllCities] = useState(false)
  const [showAllThreatTypes, setShowAllThreatTypes] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const displayedCities = showAllCities ? cityThreats : cityThreats.slice(0, 5)
  const displayedThreatTypes = showAllThreatTypes ? threatTypes : threatTypes.slice(0, 5)

  const fetchData = useCallback(() => {
    fetch('/api/threats')
      .then((r) => r.json())
      .then((data) => {
        setThreats(data.threats || [])
        setCityThreats(data.cityThreats || [])
        setThreatTypes(data.threatTypes || [])
        setLastUpdated(data.generatedAt || '')
        setError(false)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [fetchData])

  const filtered = filter === 'all' ? threats : threats.filter((t) => t.severity === filter)

  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="font-serif font-bold text-3xl text-et-text">Threat Map</h1>
            <p className="text-sm text-et-secondary mt-1">
              Real-time view of digital threat hotspots across India
              {lastUpdated && (
                <span className="ml-2 text-[10px] font-mono text-et-divider">
                  · updated {new Date(lastUpdated).toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 text-xs text-et-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-risk-low animate-pulse" /> Low
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-risk-medium animate-pulse" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-risk-high animate-pulse" /> High
          </span>
          <span className="text-[10px] text-et-secondary ml-auto">
            Auto-refreshes every 15s · {threats.length} active threats
          </span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
          <StateWrapper
            isLoading={loading}
            isEmpty={!loading && !error && filtered.length === 0}
            isError={error}
            onRetry={fetchData}
          >
            <div className="border border-et-divider bg-white p-1 rounded-sm overflow-hidden">
              <LeafletThreatMap threats={filtered} className="w-full" height={520} />
            </div>
          </StateWrapper>

          <div className="space-y-6">
            <div className="border border-et-divider">
              <div className="px-4 py-3 border-b border-et-divider">
                <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">Top Cities by Threats</h3>
              </div>
              <div className="divide-y divide-et-divider">
                {displayedCities.map((city) => (
                  <div key={city.city} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-et-text">{city.city}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-serif font-bold text-et-text">{city.threats}</span>
                      <Badge
                        variant={city.risk === 'high' ? 'risk' : 'warning'}
                        className="text-[8px] px-1.5 py-0 h-4"
                      >
                        {city.risk === 'high' ? 'High' : city.risk === 'medium' ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-et-divider">
                <button
                  onClick={() => setShowAllCities(!showAllCities)}
                  className="text-xs text-et-red font-medium hover:underline"
                >
                  {showAllCities ? 'Show less ←' : `View all ${cityThreats.length} cities →`}
                </button>
              </div>
            </div>

            <div className="border border-et-divider">
              <div className="px-4 py-3 border-b border-et-divider">
                <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">Top Threat Types</h3>
              </div>
              <div className="divide-y divide-et-divider">
                {displayedThreatTypes.map((tt) => (
                  <div key={tt.type} className="flex items-center justify-between px-4 py-3">
                    <p className="text-sm text-et-text">{tt.type}</p>
                    <span className="text-lg font-serif font-bold text-et-text">{tt.count}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-et-divider">
                <button
                  onClick={() => setShowAllThreatTypes(!showAllThreatTypes)}
                  className="text-xs text-et-red font-medium hover:underline"
                >
                  {showAllThreatTypes ? 'Show less ←' : `View all ${threatTypes.length} types →`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
