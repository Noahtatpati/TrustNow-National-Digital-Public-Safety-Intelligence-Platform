import { useState, useRef, useEffect } from 'react'
import { TopNav } from '@/layouts/top-nav'
import {
  Shield, Send, Phone, AlertTriangle,
  MessageSquare, Globe, Smartphone,
  ExternalLink, ChevronRight, CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type AnalysisData = {
  riskScore: number
  riskLevel: string
  scamType: string
  verdict: string
  recommendedActions: string[]
}

type Message = {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
  analysis?: AnalysisData
}

type ScamTypeInfo = {
  type: string
  description: string
  warning: string
  action: string
  icon: typeof AlertTriangle
}

const scamTypes: ScamTypeInfo[] = [
  { type: 'Digital Arrest Scam', description: 'Caller impersonates CBI/ED/Police and demands payment to avoid "digital arrest"', warning: 'Real law enforcement never demands money over the phone', action: 'Hang up and call 112', icon: Phone },
  { type: 'UPI Collect Fraud', description: 'Fraud sends UPI collect request disguised as refund or payment', warning: 'Never approve a UPI collect request you did not initiate', action: 'Block the UPI ID immediately', icon: MessageSquare },
  { type: 'Fake Court Notice', description: 'Fake legal documents claiming you missed court or have a warrant', warning: 'Courts send notices by registered post, not WhatsApp', action: 'Report to cybercrime.gov.in', icon: AlertTriangle },
  { type: 'Loan App Scam', description: 'Fake loan apps that charge processing fees then disappear', warning: 'RBI-regulated NBFCs never charge fees before disbursal', action: 'Uninstall app, block UPI mandate', icon: Smartphone },
  { type: 'SIM Swap Fraud', description: 'Fraudster gets your SIM replaced to receive OTPs', warning: 'If your mobile network suddenly drops, contact your provider', action: 'Call your telco immediately', icon: Phone },
  { type: 'Investment Scam', description: 'Promises of unrealistically high returns on investments', warning: 'SEBI-registered advisors never guarantee fixed returns', action: 'Check SEBI registration before investing', icon: Globe },
]

const quickPrompts = [
  'I got a call from "CBI" saying my account is frozen',
  'Someone sent me a UPI collect request for ₹500',
  'A bank called asking for my OTP to block a transaction',
  'I received a court notice on WhatsApp',
  'A friend shared a loan app that needs processing fee',
  'My phone shows "no network" but bill is paid',
]

// ─── Verdict Card Sub‑component ───────────────────────────────────────────

function VerdictCard({ analysis }: { analysis: AnalysisData }) {
  const { riskScore, riskLevel, scamType, verdict, recommendedActions } = analysis

  const isHigh = riskLevel === 'high'
  const isMedium = riskLevel === 'medium'
  const isLow = riskLevel === 'low'

  const accentBg = isHigh ? 'bg-red-50' : isMedium ? 'bg-amber-50' : 'bg-emerald-50'
  const accentBorder = isHigh ? 'border-red-200' : isMedium ? 'border-amber-200' : 'border-emerald-200'
  const accentText = isHigh ? 'text-red-700' : isMedium ? 'text-amber-700' : 'text-emerald-700'
  const badgeColor = isHigh ? 'bg-red-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="space-y-3">
      {/* Verdict Banner */}
      <div className={cn('flex items-start gap-3 p-3 rounded-lg border', accentBg, accentBorder)}>
        <div className="shrink-0 mt-0.5">
          {isLow ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : (
            <AlertTriangle className={cn('w-5 h-5', isHigh ? 'text-red-500' : 'text-amber-500')} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={cn('text-sm font-semibold', accentText)}>{verdict}</p>
            {/* Risk Score Badge */}
            <span
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white',
                badgeColor,
              )}
            >
              {riskScore}/100
            </span>
          </div>
          {scamType && scamType !== 'Benign' && (
            <p className="text-xs text-et-secondary mt-1">
              Type: <span className="font-medium">{scamType}</span>
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {recommendedActions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-et-secondary uppercase tracking-wider">
            Recommended Actions
          </p>              {recommendedActions.slice(0, 4).map((action, i) => {
                const urls: Record<string, string> = {
                  'cybercrime.gov.in': 'https://cybercrime.gov.in',
                  '1930': 'https://cybercrime.gov.in',
                }
                const match = Object.entries(urls).find(([key]) =>
                  action.toLowerCase().includes(key),
                )
                const href = match ? match[1] : undefined

                return href ? (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-start gap-2 px-3 py-1.5 text-[11px] text-left rounded-md border border-et-divider bg-white hover:bg-gray-50 hover:border-et-text transition-colors group"
                  >
                    <ChevronRight className="w-3 h-3 text-et-secondary shrink-0 mt-0.5 group-hover:text-et-text transition-colors" />
                    <span className="text-et-secondary group-hover:text-et-text transition-colors leading-snug">
                      {action}
                    </span>
                    <ExternalLink className="w-3 h-3 text-et-secondary shrink-0 mt-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <div
                    key={i}
                    className="w-full flex items-start gap-2 px-3 py-1.5 text-[11px] text-left rounded-md border border-et-divider bg-white cursor-default group"
                  >
                    <ChevronRight className="w-3 h-3 text-et-secondary shrink-0 mt-0.5 group-hover:text-et-text transition-colors" />
                    <span className="text-et-secondary leading-snug">
                      {action}
                    </span>
                  </div>
                )
              })}
        </div>
      )}
    </div>
  )
}

// ─── Simple heuristic fallback (client‑side) ──────────────────────────────

function clientSideAnalyze(text: string): AnalysisData {
  const contentLower = text.toLowerCase()
  const indicatorCount = ['cbi', 'police', 'court', 'arrest', 'pay', 'otp', 'urgent', 'freeze', 'blocked', 'warrant']
    .filter((w) => contentLower.includes(w)).length
  const riskScore = Math.min(95, indicatorCount * 15 + 10)
  const riskLevel = riskScore >= 60 ? 'high' : riskScore >= 30 ? 'medium' : 'low'
  const scamType = riskScore >= 60 ? 'Digital Arrest Scam' : riskScore >= 30 ? 'Suspicious Communication' : 'Benign'
  const verdict = riskScore >= 60
    ? 'Likely a scam — do not engage'
    : riskScore >= 30
      ? 'Suspicious — verify independently'
      : 'Appears safe — normal caution'

  const actions = riskScore >= 30
    ? [
      'Do not share any personal or financial information',
      'Report immediately at cybercrime.gov.in or dial 1930',
      'Block the number and report to your telecom provider',
    ]
    : ['Exercise normal caution', 'Monitor for follow-up requests']

  return { riskScore, riskLevel, scamType, verdict, recommendedActions: actions }
}

function clientSideExplain(analysis: AnalysisData): string {
  const { riskScore } = analysis
  if (riskScore >= 60) {
    return 'This message contains strong scam indicators — authority impersonation, urgency language, and payment demands. Do not engage, share no personal information, and report immediately.'
  }
  if (riskScore >= 30) {
    return 'This message has some suspicious characteristics. Be cautious — verify independently before responding or taking any action.'
  }
  return 'No obvious scam indicators detected. The message appears to be normal communication. Practice standard caution.'
}

// ─── Main Component ────────────────────────────────────────────────────────

export function CitizenShield() {
  const [activeTab, setActiveTab] = useState<'chat' | 'learn'>('chat')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: '👋 Welcome to TrustNow Fraud Shield!\n\nI can help you check if a call, message, or payment request is a scam.\n\n**Try one of these:**\n• Paste a suspicious message below\n• Tap a quick example\n• Or describe what happened',
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text: string) => {
    if (!text.trim() || isAnalyzing) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInputText('')
    setIsAnalyzing(true)

    try {
      const res = await fetch('/api/shield/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'message', content: text.trim() }),
      })
      const data = await res.json()

      const analysis: AnalysisData = {
        riskScore: data.riskScore ?? 5,
        riskLevel: data.riskLevel ?? 'low',
        scamType: data.scamType ?? 'Benign',
        verdict: data.verdict ?? 'Appears safe',
        recommendedActions: data.recommendedActions ?? [
          'Do not share any personal or financial information',
          'Report at cybercrime.gov.in or dial 1930',
        ],
      }

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: data.explanation || data.verdict || '',
        timestamp: new Date(),
        analysis,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      const analysis = clientSideAnalyze(text)
      const explanation = clientSideExplain(analysis)

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: explanation,
          timestamp: new Date(),
          analysis,
        },
      ])
    }
    setIsAnalyzing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(inputText)
    }
  }

  return (
    <div className="min-h-screen bg-et-bg">
      <TopNav />
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-7 h-7 text-emerald-600" />
          <div>
            <h1 className="font-serif font-bold text-3xl text-et-text">Fraud Shield</h1>
            <p className="text-sm text-et-secondary mt-1">Citizen protection — check suspicious calls, messages, and payment requests</p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mb-6 bg-white border border-et-divider rounded-sm p-1 max-w-md">
          {[
            { id: 'chat', label: 'Chat Check', icon: MessageSquare },
            { id: 'learn', label: 'Know Scams', icon: AlertTriangle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs rounded-sm transition-colors cursor-pointer ${
                activeTab === tab.id ? 'bg-emerald-600 text-white' : 'text-et-secondary hover:text-et-text hover:bg-et-bg'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Content */}
          <div>
            {activeTab === 'chat' && (
              <div className="border border-et-divider bg-white rounded-sm overflow-hidden">
                {/* Chat Header */}
                <div className="px-4 py-3 border-b border-et-divider bg-emerald-600 text-white flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">TrustNow Fraud Shield</p>
                    <p className="text-[10px] text-white/70">Online · AI-powered protection</p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="h-[480px] overflow-y-auto p-4 space-y-3 bg-[#ECE5DD]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4cfc4\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
                  {messages.map((msg) => {
                    const isWelcome = msg.role === 'assistant' && msg.id === 'welcome'
                    // Rendered text to show — for analysis messages, text is already the explanation
                    const hasAnalysis = msg.role === 'assistant' && !!msg.analysis

                    return (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className="max-w-[90%]">
                          <div
                            className={cn(
                              'rounded-lg p-3 shadow-sm',
                              msg.role === 'user'
                                ? 'bg-[#DCF8C6] rounded-tr-none'
                                : 'bg-white rounded-tl-none',
                            )}
                          >
                            {/* Welcome message with bold markdown */}
                            {isWelcome ? (
                              <div className="text-sm text-et-text leading-relaxed whitespace-pre-line">
                                {msg.text.split('**').map((part, i) =>
                                  i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
                                )}
                              </div>
                            ) : (
                              <>
                                {/* Verdict card with risk badge + actions */}
                                {hasAnalysis && msg.analysis && (
                                  <VerdictCard analysis={msg.analysis} />
                                )}

                                {/* Explanation text */}
                                {msg.text && (
                                  <p
                                    className={cn(
                                      'text-sm text-et-text whitespace-pre-line leading-relaxed',
                                      hasAnalysis && 'mt-3',
                                    )}
                                  >
                                    {msg.text}
                                  </p>
                                )}
                              </>
                            )}

                            <p className="text-[9px] text-gray-400 mt-2 text-right">
                              {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {isAnalyzing && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Quick Prompts */}
                <div className="px-4 py-2 border-t border-et-divider bg-gray-50">
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {quickPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(prompt)}
                        className="shrink-0 px-2.5 py-1 text-[10px] bg-white border border-et-divider rounded-full text-et-secondary hover:border-emerald-400 hover:text-emerald-600 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {prompt.length > 30 ? prompt.slice(0, 30) + '…' : prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input */}
                <div className="px-4 py-3 border-t border-et-divider flex items-end gap-2">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Paste a suspicious message or describe what happened..."
                    rows={1}
                    className="flex-1 px-3 py-2 text-sm border border-et-divider rounded-lg resize-none focus:outline-none focus:border-emerald-500 max-h-20"
                  />
                  <button
                    onClick={() => handleSend(inputText)}
                    disabled={!inputText.trim() || isAnalyzing}
                    className="w-9 h-9 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'learn' && (
              <div className="space-y-3">
                <p className="text-xs text-et-secondary mb-4">Learn to recognize the most common scams targeting Indian citizens.</p>
                {scamTypes.map((scam) => (
                  <div key={scam.type} className="border border-et-divider bg-white rounded-sm overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                          <scam.icon className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-et-text">{scam.type}</h4>
                          <p className="text-xs text-et-secondary mt-1 leading-relaxed">{scam.description}</p>
                          <div className="flex items-start gap-2 mt-2 p-2 bg-amber-50 rounded-sm">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-amber-800">{scam.warning}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-medium text-et-secondary uppercase tracking-wider">What to do:</span>
                            <span className="text-[11px] font-semibold text-emerald-700">{scam.action}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="border border-et-divider bg-white rounded-sm p-4">
              <h3 className="text-xs font-bold text-et-text uppercase tracking-widest mb-3">Shield Statistics</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Citizens Protected', value: '12,45,000+' },
                  { label: 'Scams Blocked Today', value: '1,247' },
                  { label: 'Amount Saved (This Week)', value: '₹8.2 Cr' },
                  { label: 'Active in Cities', value: '450+' },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center py-1.5 border-b border-et-divider last:border-0">
                    <span className="text-xs text-et-secondary">{stat.label}</span>
                    <span className="text-sm font-bold font-mono text-emerald-700">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="border border-et-divider bg-white rounded-sm p-4">
              <h3 className="text-xs font-bold text-et-text uppercase tracking-widest mb-3">How to Report</h3>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Save all evidence — screenshots, call recordings, messages' },
                  { step: '2', text: 'Call 1930 immediately for financial fraud' },
                  { step: '3', text: 'File a complaint at cybercrime.gov.in within 24 hours' },
                  { step: '4', text: 'Visit your nearest police station for a written FIR' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{item.step}</span>
                    <p className="text-[11px] text-et-secondary leading-snug">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
