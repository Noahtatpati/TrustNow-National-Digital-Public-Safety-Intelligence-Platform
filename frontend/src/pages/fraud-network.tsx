import { useState, useMemo } from 'react'
import { TopNav } from '@/layouts/top-nav'
import { NetworkGraph } from '@/components/threat/network-graph'
import { Share2, Download, Clock, Users, GitBranch, Activity } from 'lucide-react'

type EntityType = 'person' | 'organization' | 'device' | 'location'

type Entity = { id: string; name: string; type: EntityType }
type Edge = { source: string; target: string; label: string }
type TimelineEvent = { date: string; title: string; description: string }

type InvestigationData = {
  id: string
  headline: string
  summary: string
  entities: Entity[]
  edges: Edge[]
  timeline: TimelineEvent[]
  risk: string
}

const investigations: InvestigationData[] = [
  {
    id: 'TN-INV-001',
    headline: 'Counterfeit Currency Network',
    summary: 'Multi-state counterfeit currency operation',
    entities: [
      { id: 'ent1', name: 'Rajesh Mehta', type: 'person' },
      { id: 'ent2', name: 'Shiv Enterprises', type: 'organization' },
      { id: 'ent3', name: 'Laptop (Unit #3)', type: 'device' },
      { id: 'ent4', name: 'Vikram Singh', type: 'person' },
      { id: 'ent5', name: 'PrintWorks Pvt Ltd', type: 'organization' },
      { id: 'ent6', name: 'SBI Main Branch Surat', type: 'location' },
      { id: 'ent7', name: 'Priya Sharma', type: 'person' },
      { id: 'ent8', name: 'Mumbai Warehouse', type: 'location' },
      { id: 'ent9', name: 'Jaipur Courier Hub', type: 'location' },
      { id: 'ent10', name: 'ICICI Account #8842', type: 'device' },
    ],
    edges: [
      { source: 'Rajesh Mehta', target: 'Shiv Enterprises', label: 'director' },
      { source: 'Rajesh Mehta', target: 'Vikram Singh', label: 'financial link' },
      { source: 'Rajesh Mehta', target: 'Priya Sharma', label: 'co-conspirator' },
      { source: 'Shiv Enterprises', target: 'PrintWorks Pvt Ltd', label: 'supplier' },
      { source: 'Shiv Enterprises', target: 'Mumbai Warehouse', label: 'leased by' },
      { source: 'Vikram Singh', target: 'Laptop (Unit #3)', label: 'owner' },
      { source: 'Priya Sharma', target: 'Jaipur Courier Hub', label: 'manager' },
      { source: 'Rajesh Mehta', target: 'ICICI Account #8842', label: 'beneficiary' },
      { source: 'Shiv Enterprises', target: 'SBI Main Branch Surat', label: 'banking at' },
      { source: 'Vikram Singh', target: 'ICICI Account #8842', label: 'co-signatory' },
    ],
    timeline: [
      { date: 'Jan 2026', title: 'Initial Setup', description: 'Shiv Enterprises registered; printing equipment procured' },
      { date: 'Mar 2026', title: 'Production Begins', description: 'First batch of counterfeit ₹500 notes produced' },
      { date: 'May 2026', title: 'Distribution Network', description: 'Jaipur hub established; mule accounts activated' },
      { date: 'Jul 2026', title: 'Investigation Active', description: 'Raid executed; 8 suspects arrested' },
    ],
    risk: 'high',
  },
  {
    id: 'TN-INV-002',
    headline: 'Digital Arrest Call Centre',
    summary: 'CBI impersonation scam operation in Noida',
    entities: [
      { id: 'ent21', name: 'Sunil Verma', type: 'person' },
      { id: 'ent22', name: 'TechCall Solutions', type: 'organization' },
      { id: 'ent23', name: 'Noida Call Centre', type: 'location' },
      { id: 'ent24', name: 'Server Rack #2', type: 'device' },
      { id: 'ent25', name: 'Airtel SIP Trunk', type: 'device' },
      { id: 'ent26', name: 'Ananya Gupta', type: 'person' },
      { id: 'ent27', name: 'Yes Bank Account #7712', type: 'device' },
    ],
    edges: [
      { source: 'Sunil Verma', target: 'TechCall Solutions', label: 'founder' },
      { source: 'Sunil Verma', target: 'Ananya Gupta', label: 'operations head' },
      { source: 'TechCall Solutions', target: 'Noida Call Centre', label: 'operates' },
      { source: 'Sunil Verma', target: 'Yes Bank Account #7712', label: 'beneficiary' },
      { source: 'TechCall Solutions', target: 'Airtel SIP Trunk', label: 'leased' },
      { source: 'Noida Call Centre', target: 'Server Rack #2', label: 'equipment' },
    ],
    timeline: [
      { date: 'Feb 2026', title: 'Scam Operation Launch', description: 'Call centre begins operations; 20 seats initially' },
      { date: 'Apr 2026', title: 'First Victim Reports', description: 'Senior citizen in Pune reports ₹14L loss' },
      { date: 'Jun 2026', title: 'AI Pattern Detection', description: 'TrustNow AI links 142 complaints to single operation' },
      { date: 'Jul 2026', title: 'Raid Executed', description: '14 arrested; ₹12Cr+ in losses identified' },
    ],
    risk: 'high',
  },
]

const timePhases = [
  { label: 'Phase 1', months: 0, desc: 'Initial Setup' },
  { label: 'Phase 2', months: 2, desc: 'Early Operations' },
  { label: 'Phase 3', months: 4, desc: 'Active Campaign' },
  { label: 'Phase 4', months: 6, desc: 'Investigation' },
]

type CombinedEntity = Entity & { caseId: string; caseName: string }
type CombinedEdge = Edge & { caseId: string }

export function FraudNetworkPage() {
  const [activeCase, setActiveCase] = useState<string>('all')
  const [timePhase, setTimePhase] = useState(3)

  const filtered = useMemo(() => {
    let ents: CombinedEntity[] = []
    let edges: CombinedEdge[] = []

    const cases = activeCase === 'all'
      ? investigations
      : investigations.filter((inv) => inv.id === activeCase)

    for (const inv of cases) {
      // Filter entities/edges by time phase: later phases show more connections
      const maxEntities = Math.ceil(inv.entities.length * ((timePhase + 1) / 4))
      const maxEdges = Math.ceil(inv.edges.length * ((timePhase + 1) / 4))

      ents.push(
        ...inv.entities.slice(0, maxEntities).map((e) => ({ ...e, caseId: inv.id, caseName: inv.headline }))
      )
      edges.push(
        ...inv.edges.slice(0, maxEdges).map((e) => ({ ...e, caseId: inv.id }))
      )
    }

    return { entities: ents, edges }
  }, [activeCase, timePhase])

  const totalEntities = filtered.entities.length
  const totalEdges = filtered.edges.length

  const handleExport = () => {
    const payload = {
      exportDate: new Date().toISOString(),
      activeCase,
      timePhase: timePhases[timePhase],
      entities: filtered.entities,
      edges: filtered.edges,
      totalEntities,
      totalEdges,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fraud-network-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    const shareText = `TrustNow Fraud Network Intelligence\nCase: ${activeCase === 'all' ? 'All Cases' : investigations.find(i => i.id === activeCase)?.headline}\nEntities mapped: ${totalEntities} · Connections found: ${totalEdges}\n\nView on TrustNow platform.`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'TrustNow - Fraud Network Intelligence', text: shareText })
        return
      } catch {
        // user cancelled or error
      }
    }
    // Fallback: copy summary to clipboard
    try {
      await navigator.clipboard.writeText(shareText)
      alert('Share link and summary copied to clipboard.')
    } catch {
      prompt('Copy this report summary manually:', shareText)
    }
  }

  return (
    <div className="min-h-screen bg-et-bg">
      <TopNav />
      <div className="mx-auto max-w-[1440px] px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-et-red/10 rounded-sm flex items-center justify-center shrink-0">
              <GitBranch className="w-5 h-5 text-et-red" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-3xl text-et-text">Fraud Network Intelligence</h1>
              <p className="text-sm text-et-secondary mt-1">Visual analysis of entity relationships across investigations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-et-divider rounded-sm text-et-secondary hover:border-et-text hover:text-et-text transition-colors cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button onClick={handleShare} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-et-divider rounded-sm text-et-secondary hover:border-et-text hover:text-et-text transition-colors cursor-pointer">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Entities Mapped', value: totalEntities, icon: Users, color: 'text-et-red' },
            { label: 'Connections Found', value: totalEdges, icon: GitBranch, color: 'text-risk-medium' },
            { label: 'Fraud Cases Mapped', value: investigations.length, icon: Activity, color: 'text-risk-low' },
            { label: 'Time Period', value: `${timePhase + 1}/4 phases`, icon: Clock, color: 'text-et-secondary' },
          ].map((stat) => (
            <div key={stat.label} className="border border-et-divider bg-et-surface rounded-sm p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <p className="text-[10px] text-et-secondary uppercase tracking-wider">{stat.label}</p>
              </div>
              <p className="text-xl font-serif font-bold text-et-text">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Case Filter */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-medium text-et-secondary uppercase tracking-wider mr-2">Case:</span>
          <button
            onClick={() => setActiveCase('all')}
            className={`px-3 py-1.5 text-xs border rounded-sm transition-colors cursor-pointer ${
              activeCase === 'all'
                ? 'border-et-red bg-et-red/5 text-et-red font-medium'
                : 'border-et-divider text-et-secondary hover:border-et-text hover:text-et-text'
            }`}
          >
            All Cases
          </button>
          {investigations.map((inv) => (
            <button
              key={inv.id}
              onClick={() => setActiveCase(inv.id)}
              className={`px-3 py-1.5 text-xs border rounded-sm transition-colors cursor-pointer ${
                activeCase === inv.id
                  ? 'border-et-red bg-et-red/5 text-et-red font-medium'
                  : 'border-et-divider text-et-secondary hover:border-et-text hover:text-et-text'
              }`}
            >
              {inv.headline}
            </button>
          ))}
        </div>

        {/* Time Phase Slider */}
        <div className="border border-et-divider bg-et-surface rounded-sm mb-4">
          <div className="px-5 py-3 border-b border-et-divider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-et-secondary" />
              <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">Investigation Timeline</h3>
            </div>
            <span className="text-[10px] text-et-secondary font-mono">{timePhases[timePhase].label} — {timePhases[timePhase].desc}</span>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-3">
              {timePhases.map((phase, i) => (
                <button
                  key={phase.label}
                  onClick={() => setTimePhase(i)}
                  className={`flex-1 py-2 text-[10px] text-center rounded-sm border transition-colors cursor-pointer ${
                    timePhase >= i
                      ? 'border-et-red bg-et-red/5 text-et-red font-medium'
                      : 'border-et-divider text-et-secondary hover:border-et-text'
                  }`}
                >
                  {phase.label}
                  <span className="block text-[8px] opacity-70 mt-0.5">{phase.desc}</span>
                </button>
              ))}
            </div>
            <input
              type="range"
              min={0}
              max={3}
              value={timePhase}
              onChange={(e) => setTimePhase(Number(e.target.value))}
              className="w-full mt-3 h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-et-red"
            />
          </div>
        </div>

        {/* Network Graph */}
        <div className="border border-et-divider bg-et-surface rounded-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-et-divider flex items-center justify-between">
            <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">Force-Directed Network Graph</h3>
            <div className="flex items-center gap-3 text-[10px] text-et-secondary">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#B22222]" /> Person</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#D97706]" /> Organization</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#666]" /> Device</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4D7C0F]" /> Location</span>
            </div>
          </div>
          <NetworkGraph
            entities={filtered.entities}
            edges={filtered.edges}
            className="w-full"
          />
          <div className="px-5 py-2 border-t border-et-divider flex items-center justify-between text-[10px] text-et-secondary">
            <span>Drag nodes to explore connections · Click an entity for details · Scroll to zoom</span>
            <span>{totalEntities} entities · {totalEdges} connections</span>
          </div>
        </div>


      </div>
    </div>
  )
}
