import { useState, useEffect } from 'react'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

type ScamAlert = {
  id: string
  title: string
  region: string
  severity: 'high' | 'medium' | 'low'
  timestamp: string
  estimatedLoss?: string
  victimCount?: number
}

const sampleAlerts: ScamAlert[] = [
  { id: 'sa-1', title: 'Digital Arrest Scam — CBI impersonation call centre active', region: 'Delhi NCR', severity: 'high', timestamp: '2 min ago', estimatedLoss: '₹2.4 Cr', victimCount: 18 },
  { id: 'sa-2', title: 'UPI Collect fraud targeting SBI customers', region: 'Mumbai', severity: 'high', timestamp: '7 min ago', estimatedLoss: '₹48 L', victimCount: 23 },
  { id: 'sa-3', title: 'Fake court notice scam via WhatsApp', region: 'Bengaluru', severity: 'medium', timestamp: '15 min ago', victimCount: 12 },
  { id: 'sa-4', title: 'Loan app harassment complaint spike', region: 'Hyderabad', severity: 'medium', timestamp: '22 min ago', victimCount: 8 },
  { id: 'sa-5', title: 'SIM swap fraud attempt at telecom provider', region: 'Kolkata', severity: 'medium', timestamp: '31 min ago', estimatedLoss: '₹12 L' },
  { id: 'sa-6', title: 'Phishing campaign impersonating income tax department', region: 'Pan India', severity: 'high', timestamp: '45 min ago', estimatedLoss: '₹3.1 Cr', victimCount: 45 },
]

const severityColors: Record<string, string> = {
  high: 'bg-risk-high',
  medium: 'bg-risk-medium',
  low: 'bg-risk-low',
}

export function ScamAlertTicker() {
  const [alerts] = useState<ScamAlert[]>(sampleAlerts)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [alerts.length])

  const current = alerts[currentIndex]

  return (
    <div className="bg-et-red/5 border border-et-red/20 rounded-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-et-red/10 border-b border-et-red/20">
        <AlertTriangle className="w-3.5 h-3.5 text-et-red" />
        <span className="text-[10px] font-bold text-et-red uppercase tracking-widest">Live Scam Alerts</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-et-red animate-pulse" />
          <span className="text-[9px] text-et-secondary font-mono">LIVE</span>
        </span>
      </div>

      <div className="px-4 py-3 min-h-[72px] flex items-center">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${severityColors[current.severity]}`} />
            <div className="min-w-0">
              <p className="text-xs font-medium text-et-text leading-snug">{current.title}</p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-et-secondary flex-wrap">
                <span>{current.region}</span>
                <span>&middot;</span>
                <span>{current.timestamp}</span>
                {current.estimatedLoss && (
                  <>
                    <span>&middot;</span>
                    <span className="text-et-red font-medium">{current.estimatedLoss}</span>
                  </>
                )}
                <span className="ml-1 rounded-full border border-et-red/20 bg-white px-2 py-0.5 text-[9px] uppercase tracking-wider text-et-red">
                  Escalation-ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-1.5 bg-et-bg border-t border-et-divider">
        <div className="flex gap-1">
          {alerts.slice(0, 6).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                i === currentIndex ? 'bg-et-red w-3' : 'bg-et-divider hover:bg-et-border'
              }`}
            />
          ))}
        </div>
        <Link
          to="/scam-analyzer"
          className="inline-flex items-center gap-1 text-[10px] text-et-red font-medium hover:underline"
        >
          Analyze <ExternalLink className="w-2.5 h-2.5" />
        </Link>
      </div>
    </div>
  )
}
