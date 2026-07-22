import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TopNav } from '@/layouts/top-nav'
import { Footer } from '@/layouts/footer'
import { StateWrapper } from '@/components/ui/state-wrapper'
import { Badge } from '@/components/ui/badge'
import { ThreatMapWidget } from '@/components/threat/leaflet-map'
import { ScamAlertTicker } from '@/components/threat/scam-alert-ticker'
import { AnalyticsPanel } from '@/components/threat/analytics-panel'
import { useAlertStore } from '@/lib/alert-store'

type Threat = {
  id: string
  lat: number
  lng: number
  title: string
  severity: 'high' | 'medium' | 'low'
  region: string
}

type Alert = {
  title: string
  severity: 'high' | 'medium' | 'low'
  region: string
}

type Indicator = {
  label: string
  value: string
  trend: string
}

type ScamEvent = {
  id: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  region: string
  type: string
  timestamp: Date
}

const scamEventSamples = [
  { title: 'CBI Impersonation Call Detected', description: 'Caller claiming to be from CBI demanding payment to avoid arrest', type: 'Digital Arrest' },
  { title: 'UPI Collect Fraud Attempt', description: 'Fraudulent UPI collect request for ₹24,500 disguised as refund', type: 'UPI Fraud' },
  { title: 'Fake Court Notice via WhatsApp', description: 'Fake legal notice with court seal claiming missed summons', type: 'Legal Scam' },
  { title: 'Loan App Harassment Report', description: 'Fraud loan app demanding processing fee before disbursal', type: 'Loan Scam' },
  { title: 'SIM Swap Attempt Flagged', description: 'Unauthorised SIM replacement request detected at telecom retail point', type: 'SIM Swap' },
  { title: 'Phishing Link in SMS Campaign', description: 'Fake bank login page circulating via SMS targeting SBI customers', type: 'Phishing' },
  { title: 'Investment Fraud Promise', description: 'Guaranteed 30% monthly returns through unregistered investment scheme', type: 'Investment' },
  { title: 'Fake Income Tax Refund Email', description: 'Phishing email claiming IT refund with malicious attachment', type: 'Phishing' },
  { title: 'E-Commerce Refund Scam', description: 'Fraudster posing as Amazon客服 requesting OTP for refund', type: 'Refund Scam' },
  { title: 'KYC Update Scam SMS', description: 'Fake bank KYC update link designed to steal net banking credentials', type: 'Phishing' },
]

const regions = ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Kolkata', 'Chennai', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow']

export function TodaysBrief() {
  const [threats, setThreats] = useState<Threat[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [scamEvents, setScamEvents] = useState<ScamEvent[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const { activeRegion, setActiveRegion } = useAlertStore()

  const [loading, setLoading] = useState({ threats: true, alerts: true, indicators: true })
  const [error, setError] = useState({ threats: false, alerts: false, indicators: false })

  const fetchIndicators = () => {
    fetch('/api/indicators')
      .then((r) => r.json())
      .then((d) => {
        setIndicators(d.indicators || [])
        setLastUpdated(d.generatedAt || '')
      })
      .catch(() => setError((p) => ({ ...p, indicators: true })))
      .finally(() => setLoading((p) => ({ ...p, indicators: false })))
  }

  const fetchAlerts = () => {
    fetch('/api/alerts')
      .then((r) => r.json())
      .then((d) => {
        setAlerts(d.alerts || [])
        setLastUpdated(d.generatedAt || '')
      })
      .catch(() => setError((p) => ({ ...p, alerts: true })))
      .finally(() => setLoading((p) => ({ ...p, alerts: false })))
  }

  const fetchThreats = () => {
    fetch('/api/threats')
      .then((r) => r.json())
      .then((d) => {
        setThreats(d.threats || [])
        setLastUpdated(d.generatedAt || '')
      })
      .catch(() => setError((p) => ({ ...p, threats: true })))
      .finally(() => setLoading((p) => ({ ...p, threats: false })))
  }

  useEffect(() => {
    const initial: ScamEvent[] = []
    for (let i = 0; i < 5; i++) {
      const sample = scamEventSamples[i % scamEventSamples.length]
      const severity: ScamEvent['severity'] = i < 2 ? 'high' : i < 4 ? 'medium' : 'low'
      initial.push({
        id: `seed-${i}`,
        title: sample.title,
        description: sample.description,
        severity,
        region: regions[i % regions.length],
        type: sample.type,
        timestamp: new Date(Date.now() - (5 - i) * 60000),
      })
    }
    setScamEvents(initial)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const sample = scamEventSamples[Math.floor(Math.random() * scamEventSamples.length)]
      const weight = Math.random()
      const severity: ScamEvent['severity'] = weight < 0.4 ? 'high' : weight < 0.75 ? 'medium' : 'low'
      const event: ScamEvent = {
        id: `live-${Date.now()}`,
        title: sample.title,
        description: sample.description,
        severity,
        region: regions[Math.floor(Math.random() * regions.length)],
        type: sample.type,
        timestamp: new Date(),
      }
      setScamEvents((prev) => [event, ...prev].slice(0, 8))
    }, 6000 + Math.random() * 4000)
    return () => clearInterval(interval)
  }, [])

  const fetchAll = () => {
    setLoading({ threats: true, alerts: true, indicators: true })
    setError({ threats: false, alerts: false, indicators: false })
    fetchThreats()
    fetchAlerts()
    fetchIndicators()
  }

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchAll()
    const pollIndicators = setInterval(fetchIndicators, 15000)
    const pollAlerts = setInterval(fetchAlerts, 20000)
    const pollThreats = setInterval(fetchThreats, 25000)
    return () => {
      clearInterval(pollIndicators)
      clearInterval(pollAlerts)
      clearInterval(pollThreats)
    }
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()
  }

  const formatEventTime = (date: Date) => {
    const now = Date.now()
    const diff = now - date.getTime()
    if (diff < 60000) return 'Just now'
    if (diff < 120000) return '1m ago'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 7200000) return '1h ago'
    return `${Math.floor(diff / 3600000)}h ago`
  }

  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <div className="border-b border-et-divider">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 py-6">
          <p className="text-[11px] font-mono text-et-secondary uppercase tracking-widest mb-4">
            {formatDate(currentTime)} &middot; {formatTime(currentTime)} IST
            {lastUpdated && (
              <span className="ml-3 text-[9px] text-et-divider normal-case">
                Live · updated {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </p>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <h1 className="font-serif font-bold text-4xl lg:text-5xl text-et-text leading-tight mb-4">
                {alerts[0]?.title || 'Loading latest intelligence...'}
              </h1>
              <p className="text-base text-et-secondary leading-relaxed mb-6">
                TrustNow fuses scam signals, counterfeit intelligence, and geospatial threat patterns into one proactive public-safety command view.
              </p>
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="rounded-full border border-et-divider bg-et-bg px-3 py-1 text-[11px] text-et-secondary">Focus: {activeRegion}</span>
                {['Digital arrest detection', 'Counterfeit monitoring', 'Fraud network mapping'].map((chip) => (
                  <span key={chip} className="px-3 py-1 rounded-full border border-et-divider bg-et-bg text-[11px] text-et-secondary">{chip}</span>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-[420px] shrink-0">
              <div className="relative aspect-video overflow-hidden bg-et-bg border border-et-divider">
                <img
                  src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop"
                  alt="Cyber crime investigation"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-et-divider">
        <div className="mx-auto max-w-[1440px] px-4 md:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-et-divider">
            {indicators.length === 0 ? (
              <>
                {[{ label: 'Scams Detected Today', value: '...' }, { label: 'Active Investigations', value: '...' }, { label: 'High Priority', value: '...' }, { label: 'Amount Saved (Cr)', value: '...' }].map((f) => (
                  <div key={f.label} className="py-5 px-6">
                    <p className="text-3xl font-serif font-bold text-et-text">{f.value}</p>
                    <p className="text-sm text-et-secondary mt-1">{f.label}</p>
                  </div>
                ))}
              </>
            ) : (
              indicators.map((ind) => (
                <div key={ind.label} className="py-5 px-6">
                  <p className="text-3xl font-serif font-bold text-et-text">{ind.value}</p>
                  <p className="text-sm text-et-secondary mt-1">{ind.label}</p>
                  <p className={`text-xs mt-1 font-medium ${ind.trend === 'up' ? 'text-et-red' : 'text-et-secondary'}`}>
                    {ind.trend === 'up' ? '↑' : '↓'} Today
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="border-y border-et-divider">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="flex flex-col lg:border-r border-et-divider">
            <div className="px-6 py-3 border-b border-et-divider">
              <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">Today's Alerts</h3>
            </div>
            <StateWrapper
              isLoading={loading.alerts}
              isEmpty={!loading.alerts && !error.alerts && alerts.length === 0}
              isError={error.alerts}
              onRetry={fetchAll}
            >
              <div className="px-6 pt-3">
                <ScamAlertTicker />
              </div>
              <div className="px-6 mt-3">
                {alerts.map((alert, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveRegion(alert.region)}
                    className="flex w-full items-start justify-between py-3 border-b border-et-divider last:border-0 text-left cursor-pointer hover:bg-et-bg"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${alert.severity === 'high' ? 'bg-et-red' : alert.severity === 'medium' ? 'bg-risk-medium' : 'bg-risk-low'}`} />
                      <p className="text-sm text-et-text leading-snug">{alert.title}</p>
                    </div>
                    <span className="text-[10px] text-et-secondary shrink-0 ml-4">{alert.region}</span>
                  </button>
                ))}
              </div>
            </StateWrapper>
            <div className="px-6 py-2.5 border-t border-et-divider mt-auto text-center">
                <Link to="/threat-map" className="text-xs text-et-red font-medium hover:underline">
                  View all alerts →
                </Link>
            </div>
          </div>

          <div className="flex flex-col lg:border-r border-et-divider">
            <div className="px-6 py-3 border-b border-et-divider">
              <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">Live Scam Feed</h3>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[400px]">
              {scamEvents.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-xs text-et-secondary">Awaiting scam detection events...</p>
                </div>
              ) : (
                <div className="divide-y divide-et-divider">
                  {scamEvents.map((event, i) => (
                    <div
                      key={event.id}
                      className={`px-6 py-3 transition-all duration-500 ${
                        i === 0 ? 'bg-risk-high/[0.03]' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 min-w-0 flex-1">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            event.severity === 'high' ? 'bg-et-red' :
                            event.severity === 'medium' ? 'bg-risk-medium' : 'bg-risk-low'
                          }`} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-et-text leading-snug">{event.title}</p>
                              <Badge
                                variant={event.severity === 'high' ? 'risk' : event.severity === 'medium' ? 'warning' : 'safe'}
                                className="text-[8px] px-1 py-0 h-3.5"
                              >
                                {event.severity === 'high' ? 'HIGH' : event.severity === 'medium' ? 'MED' : 'LOW'}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-et-secondary mt-0.5 leading-relaxed line-clamp-2">{event.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] text-et-secondary font-mono">{formatEventTime(event.timestamp)}</span>
                              <span className="text-[8px] text-et-divider">|</span>
                              <span className="text-[9px] text-et-secondary">{event.region}</span>
                              <span className="text-[8px] text-et-divider">|</span>
                              <span className="text-[9px] font-medium text-et-secondary">{event.type}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-2 border-t border-et-divider bg-et-bg">
              <div className="flex items-center justify-between text-[9px] text-et-secondary">
                <span>Auto-detected in real time</span>
                <span className="font-mono">{scamEvents.length} events</span>
              </div>
            </div>
            <div className="px-6 py-3 border-t border-et-divider">
              <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">Intelligence Pulse</h3>
            </div>
            <div className="p-6">
              <AnalyticsPanel />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="px-6 py-3 border-b border-et-divider">
              <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">Threat Map</h3>
            </div>
            <StateWrapper
              isLoading={loading.threats}
              isEmpty={!loading.threats && !error.threats && threats.length === 0}
              isError={error.threats}
              onRetry={fetchAll}
            >
              <div className="p-1">
                <ThreatMapWidget threats={threats} className="w-full" height={280} />
              </div>
            </StateWrapper>
            <div className="px-6 py-2.5 border-t border-et-divider mt-auto text-center">
              <Link to="/threat-map" className="text-xs text-et-red font-medium hover:underline">
                View full map →
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
