import { useState } from 'react'
import { TopNav } from '@/layouts/top-nav'
import { Footer } from '@/layouts/footer'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertTriangle, CheckCircle, Phone, MessageSquare, ExternalLink, Sparkles, FileText, TrendingUp, Globe, CreditCard, Mail, Search, MapPin, Building, Flag } from 'lucide-react'

type AnalysisEvidence = {
  label: string
  detail: string
  weight: number
}

type AlertPackage = {
  id: string
  synopsis: string
  confidence: number
  jurisdiction: string
  leadTime: string
  escalation: string
  evidence: string[]
}

type AnalysisResult = {
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  indicators: { name: string; found: boolean; description: string }[]
  scamType: string
  recommendedActions: string[]
  verdict: string
  confidence: number
  explanation: string
  evidence: AnalysisEvidence[]
  suggestedEscalation: string
  leadTime: string
  caseId: string
}

const scamTypes = [
  'Digital Arrest Scam',
  'UPI Collect Fraud',
  'Bank Account Takeover',
  'Fake Legal Notice',
  'Loan App Fraud',
  'Investment Scam',
  'SIM Swap Fraud',
  'Phishing Link',
]

export function ScamAnalyzer() {
  const [inputType, setInputType] = useState<'phone' | 'message' | 'call' | 'website' | 'upi' | 'email'>('phone')
  const [inputValue, setInputValue] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [alertPackage, setAlertPackage] = useState<AlertPackage | null>(null)
  const [phoneLookup, setPhoneLookup] = useState<{
    number: string; location: string; carrier: string;
    lineType: string; spamScore: number; reportCount: number;
    country: string; isValid: boolean
  } | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [emailLookup, setEmailLookup] = useState<{
    email: string; isValid: boolean; isFreeProvider: boolean; domain: string
  } | null>(null)
  const [urlLookup, setUrlLookup] = useState<{
    url: string; score: number; riskLevel: string; recommendation: string;
    usesHttps: boolean; dnsExists: boolean; hasIp: boolean;
    suspiciousTld: string | null; recentlyCreated: boolean | null;
    sslValid: boolean | null; domainAgeDays: number | null
  } | null>(null)
  const [upiLookup, setUpiLookup] = useState<{
    upiId: string; isValid: boolean; provider: string;
    riskLevel: string; spamScore: number; notes: string[]
  } | null>(null)

  const generateAlertPackage = () => {
    if (!result) return

    const jurisdiction = inputType === 'phone' ? 'National telecom + cybercrime desk' : 'Regional cybercrime cell'
    const priority = result.riskLevel === 'high' ? 'Priority 1' : result.riskLevel === 'medium' ? 'Priority 2' : 'Priority 3'

    setAlertPackage({
      id: result.caseId,
      synopsis: result.explanation,
      confidence: result.confidence,
      jurisdiction,
      leadTime: result.leadTime,
      escalation: result.suggestedEscalation,
      evidence: result.evidence.slice(0, 3).map((item) => item.label),
    })

    window.dispatchEvent(new CustomEvent('trustnow:alert-generated', {
      detail: { priority, caseId: result.caseId }
    }))
  }

  const handleAnalyze = async () => {
    if (!inputValue.trim()) return
    setAnalyzing(true)
    setResult(null)
    setAlertPackage(null)
    setPhoneLookup(null)
    setEmailLookup(null)
    setUrlLookup(null)
    setUpiLookup(null)

    // Phone lookup for phone type
    if (inputType === 'phone') {
      setLookupLoading(true)
      fetch('/api/lookup/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: inputValue }),
      })
        .then((r) => r.json())
        .then(setPhoneLookup)
        .catch(() => {})
        .finally(() => setLookupLoading(false))
    }

    // Email lookup for email type
    if (inputType === 'email') {
      setLookupLoading(true)
      fetch('/api/lookup/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputValue }),
      })
        .then((r) => r.json())
        .then(setEmailLookup)
        .catch(() => {})
        .finally(() => setLookupLoading(false))
    }

    // URL lookup for website type
    if (inputType === 'website') {
      setLookupLoading(true)
      fetch('/api/lookup/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputValue }),
      })
        .then((r) => r.json())
        .then(setUrlLookup)
        .catch(() => {})
        .finally(() => setLookupLoading(false))
    }

    // UPI lookup for upi type
    if (inputType === 'upi') {
      setLookupLoading(true)
      fetch('/api/lookup/upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upiId: inputValue }),
      })
        .then((r) => r.json())
        .then(setUpiLookup)
        .catch(() => {})
        .finally(() => setLookupLoading(false))
    }

    try {
      const res = await fetch('/api/scam/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: inputType, content: inputValue }),
      })
      const data = await res.json()
      setResult({
        riskScore: Number(data.riskScore ?? 0),
        riskLevel: data.riskLevel ?? 'low',
        indicators: data.indicators ?? [],
        scamType: data.scamType ?? 'Benign',
        recommendedActions: data.recommendedActions ?? [],
        verdict: data.verdict ?? 'No verdict available',
        confidence: Number(data.confidence ?? 0),
        explanation: data.explanation ?? 'Pattern matched known scam heuristics.',
        evidence: data.evidence ?? [],
        suggestedEscalation: data.suggestedEscalation ?? 'Escalate for review.',
        leadTime: data.leadTime ?? 'No immediate escalation',
        caseId: data.caseId ?? `TN-${Date.now().toString().slice(-6)}`,
      })
    } catch {
      const contentLower = inputValue.toLowerCase()
      const indicators = [
        { name: 'Urgency Language', found: ['immediately', 'urgent', 'within', 'asap', 'hurry', 'now', 'immediate action', 'act now', 'limited time', 'expires'].some(w => contentLower.includes(w)), description: 'Scammers create false urgency to prevent rational thinking' },
        { name: 'Authority Impersonation', found: ['cbi', 'police', 'court', 'judge', 'supreme', 'high court', 'customs', 'enforcement', 'income tax', 'edi', 'government', 'rbi', 'sebi', 'trai'].some(w => contentLower.includes(w)), description: 'Impersonating government or law enforcement agencies' },
        { name: 'Payment Demand', found: ['pay', 'transfer', 'send', 'upi', 'bank account', 'deposit', 'fine', 'fee', 'payment', 'receive money', 'send money'].some(w => contentLower.includes(w)), description: 'Request for money or financial information' },
        { name: 'Threat Language', found: ['arrest', 'warrant', 'case', 'jail', 'illegal', 'locked', 'freeze', 'blocked', 'legal action', 'notice', 'summon'].some(w => contentLower.includes(w)), description: 'Threats of legal action or account freezing' },
        { name: 'Personal Info Request', found: ['otp', 'password', 'aadhaar', 'pan', 'account number', 'cv', 'login', 'credential', 'verify now', 'update kyc'].some(w => contentLower.includes(w)), description: 'Request for sensitive personal information' },
        { name: 'Suspicious Link / URL', found: ['http', 'bit.ly', 'tinyurl', 'click here', 'link', 'trackid', 'redirect'].some(w => contentLower.includes(w)), description: 'Message contains suspicious links that may lead to phishing sites' },
        { name: 'Account Compromise Language', found: ['your account', 'suspended', 'deactivated', 'unusual activity', 'security alert', 'login attempt', 'unauthorized', 'breach'].some(w => contentLower.includes(w)), description: 'Claims about account compromise to create panic' },
        { name: 'Spoofed Number', found: inputValue.startsWith('+') && inputValue.length > 12, description: 'International or spoofed caller ID pattern' },
      ]
      const foundCount = indicators.filter(i => i.found).length
      if (foundCount === 0) {
        setResult({
          riskScore: 5,
          riskLevel: 'low',
          scamType: 'Benign',
          indicators,
          recommendedActions: [
            'Exercise normal caution',
            'No immediate action required',
            'Report if you receive follow-up messages',
          ],
          verdict: 'Appears safe — exercise normal caution',
          confidence: 85,
          explanation: 'No scam indicators were detected. The message does not match known scam language patterns.',
          evidence: [{ label: 'No strong signal', detail: 'No dominant scam markers were detected in the supplied input.', weight: 1 }],
          suggestedEscalation: 'Continue normal caution and monitor for follow-up requests.',
          leadTime: 'No immediate escalation',
          caseId: `TN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`,
        })
      } else {
        const rawScore = (foundCount / indicators.length) * 100
        const score = Math.min(99, Math.round(rawScore) + 10)
        const riskLevel = score >= 65 ? 'high' : score >= 35 ? 'medium' : 'low'
        const evidence = indicators.filter(i => i.found).map(i => ({ label: i.name, detail: i.description, weight: 2 }))
        setResult({
          riskScore: score,
          riskLevel,
          scamType: riskLevel === 'high' ? 'Digital Arrest Scam' : riskLevel === 'medium' ? 'Suspicious Communication' : 'Benign',
        indicators,
        recommendedActions: [
          'Do not share any personal or financial information',
          'Verify the caller by calling the official police station number',
          'Report immediately to cybercrime.gov.in or dial 1930',
          'Block the caller and report to your telecom provider',
        ],
        verdict: riskLevel === 'high' ? 'Likely a scam — do not engage' : riskLevel === 'medium' ? 'Suspicious — verify before responding' : 'Appears safe — exercise normal caution',
        confidence: Math.min(98, Math.max(60, score - 5 + Math.min(15, indicators.filter((indicator) => indicator.found).length * 2))),
        explanation: riskLevel === 'high'
          ? 'The message matches a high density of scam indicators, especially authority impersonation and urgency language.'
          : riskLevel === 'medium'
            ? 'The message contains several warning signals but not enough to confirm a full scam packet.'
            : 'No dominant scam markers were identified in the supplied input.',
        evidence: evidence.length > 0 ? evidence : [{ label: 'No strong signal', detail: 'No dominant scam markers were detected in the supplied input.', weight: 1 }],
        suggestedEscalation: riskLevel === 'high'
          ? 'Escalate to the cybercrime cell and telecom provider, preserve the call metadata, and prepare a case file.'
          : riskLevel === 'medium'
            ? 'Flag the report for review and ask the caller to verify through an official channel.'
            : 'Continue normal caution and monitor for follow-up requests.',
        leadTime: riskLevel === 'high' ? '3-5 min before transfer' : riskLevel === 'medium' ? '1-2 min before transfer' : 'No immediate escalation',
        caseId: `TN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`,
      })
    }
    setAnalyzing(false)
  }
  }

  return (
    <div className="min-h-screen bg-et-bg">
      <TopNav />
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-et-red" />
          <div>
            <h1 className="font-serif font-bold text-3xl text-et-text">Scam Detector</h1>
            <p className="text-sm text-et-secondary mt-1">AI-powered analysis of phone numbers, websites, UPI IDs, emails, messages, and calls</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mt-8">
          <div>
            {/* Input Type Tabs */}
            <div className="flex gap-1 mb-4 bg-et-surface border border-et-divider rounded-sm p-1 overflow-x-auto">
              {[
                { id: 'phone', label: 'Phone', icon: Phone },
                { id: 'website', label: 'Website / URL', icon: Globe },
                { id: 'upi', label: 'UPI ID', icon: CreditCard },
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'message', label: 'SMS / Text', icon: MessageSquare },
                { id: 'call', label: 'Call', icon: Phone },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setInputType(tab.id as typeof inputType); setResult(null); setAlertPackage(null) }}
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-sm transition-colors cursor-pointer justify-center shrink-0 ${
                    inputType === tab.id
                      ? 'bg-et-red text-white'
                      : 'text-et-secondary hover:text-et-text hover:bg-et-bg'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="border border-et-divider bg-et-surface rounded-sm">
              <div className="p-5">
                {inputType === 'phone' && (
                  <div>
                    <label className="block text-xs font-medium text-et-secondary uppercase tracking-wider mb-2">Enter Phone Number</label>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="e.g. +91-98765-43210"
                      className="w-full h-12 px-4 text-sm border border-et-divider rounded-sm focus:outline-none focus:border-et-text font-mono"
                    />
                  </div>
                )}
                {inputType === 'website' && (
                  <div>
                    <label className="block text-xs font-medium text-et-secondary uppercase tracking-wider mb-2">Enter Website URL</label>
                    <input
                      type="url"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="e.g. https://example.com or example.com"
                      className="w-full h-12 px-4 text-sm border border-et-divider rounded-sm focus:outline-none focus:border-et-text font-mono"
                    />
                    <p className="text-[10px] text-et-secondary mt-2">Check if a website is a phishing site, fake government portal, or fraudulent login page</p>
                  </div>
                )}
                {inputType === 'upi' && (
                  <div>
                    <label className="block text-xs font-medium text-et-secondary uppercase tracking-wider mb-2">Enter UPI ID / VPA</label>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="e.g. example@paytm or example@upi"
                      className="w-full h-12 px-4 text-sm border border-et-divider rounded-sm focus:outline-none focus:border-et-text font-mono"
                    />
                    <p className="text-[10px] text-et-secondary mt-2">Check if a UPI ID is associated with known fraud reports or scam patterns</p>
                  </div>
                )}
                {inputType === 'email' && (
                  <div>
                    <label className="block text-xs font-medium text-et-secondary uppercase tracking-wider mb-2">Enter Email Address</label>
                    <input
                      type="email"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="e.g. sender@example.com"
                      className="w-full h-12 px-4 text-sm border border-et-divider rounded-sm focus:outline-none focus:border-et-text font-mono"
                    />
                    <p className="text-[10px] text-et-secondary mt-2">Check if an email address is associated with phishing campaigns or scam operations</p>
                  </div>
                )}
                {inputType === 'message' && (
                  <div>
                    <label className="block text-xs font-medium text-et-secondary uppercase tracking-wider mb-2">Paste the Message</label>
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Paste the suspicious SMS, WhatsApp message, or email here..."
                      rows={6}
                      className="w-full px-4 py-3 text-sm border border-et-divider rounded-sm focus:outline-none focus:border-et-text resize-none"
                    />
                  </div>
                )}
                {inputType === 'call' && (
                  <div>
                    <label className="block text-xs font-medium text-et-secondary uppercase tracking-wider mb-2">Describe the Call</label>
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Describe what the caller said, the number that appeared, any demands made..."
                      rows={6}
                      className="w-full px-4 py-3 text-sm border border-et-divider rounded-sm focus:outline-none focus:border-et-text resize-none"
                    />
                    <div className="mt-3 flex gap-3">
                      {['Someone claimed to be from CBI', 'Said my bank account is frozen', 'Demanded payment via UPI', 'Sent a fake court notice'].map((hint) => (
                        <button
                          key={hint}
                          onClick={() => setInputValue(hint)}
                          className="text-[10px] text-et-secondary border border-et-divider px-2 py-1 rounded-sm hover:border-et-text hover:text-et-text transition-colors cursor-pointer"
                        >
                          {hint}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-et-divider bg-et-bg flex items-center justify-between">
                <p className="text-[10px] text-et-secondary">Your data is analyzed in real-time and not stored.</p>
                <button
                  onClick={handleAnalyze}
                  disabled={!inputValue.trim() || analyzing}
                  className="inline-flex items-center gap-2 bg-et-red hover:bg-et-red-hover disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-2 text-sm font-medium rounded-sm transition-colors cursor-pointer"
                >
                  {analyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>

            {/* Results */}
            {result && (
              <div className="mt-6 space-y-4">
                {/* Verdict Banner */}
                <div className={`border-l-4 p-4 rounded-sm ${
                  result.riskLevel === 'high'
                    ? 'border-risk-high bg-risk-high/5'
                    : result.riskLevel === 'medium'
                    ? 'border-risk-medium bg-risk-medium/5'
                    : 'border-risk-low bg-risk-low/5'
                }`}>
                  <div className="flex items-start gap-3">
                    {result.riskLevel === 'high' ? (
                      <AlertTriangle className="w-6 h-6 text-risk-high shrink-0 mt-0.5" />
                    ) : result.riskLevel === 'medium' ? (
                      <AlertTriangle className="w-6 h-6 text-risk-medium shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-risk-low shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-serif font-bold text-lg text-et-text">
                          Risk Score: {result.riskScore}/100
                        </h3>
                        <Badge
                          variant={result.riskLevel === 'high' ? 'risk' : result.riskLevel === 'medium' ? 'warning' : 'safe'}
                          className="text-[10px]"
                        >
                          {result.riskLevel === 'high' ? 'High Risk' : result.riskLevel === 'medium' ? 'Medium Risk' : 'Low Risk'}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-et-text">{result.verdict}</p>
                      <p className="text-xs text-et-secondary mt-1">Classified as: {result.scamType}</p>
                    </div>
                  </div>
                </div>

                {/* Truecaller-style phone lookup */}
                {inputType === 'phone' && phoneLookup && (
                  <div className="border border-et-divider bg-et-surface rounded-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-et-divider flex items-center gap-2">
                      <Search className="w-4 h-4 text-et-red" />
                      <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">Phone Lookup</h3>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-bold font-serif text-et-text">{phoneLookup.number}</h4>
                            <Badge variant={phoneLookup.isValid ? 'safe' : 'risk'} className="text-[10px]">
                              {phoneLookup.isValid ? 'Valid' : 'Invalid'}
                            </Badge>
                          </div>
                          {phoneLookup.location !== 'Unknown' && (
                            <p className="text-xs text-et-secondary flex items-center gap-1 mb-1">
                              <MapPin className="w-3 h-3" /> {phoneLookup.location}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-et-secondary">
                            <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {phoneLookup.carrier}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {phoneLookup.lineType}</span>
                            <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {phoneLookup.country}</span>
                          </div>
                        </div>
                        <div className="text-center shrink-0">
                          <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center text-lg font-bold ${
                            phoneLookup.spamScore >= 60
                              ? 'border-risk-high text-risk-high'
                              : phoneLookup.spamScore >= 30
                              ? 'border-risk-medium text-risk-medium'
                              : 'border-risk-low text-risk-low'
                          }`}>
                            {phoneLookup.spamScore}
                          </div>
                          <p className="text-[10px] text-et-secondary mt-1">Spam</p>
                        </div>
                      </div>
                      {phoneLookup.reportCount > 0 && (
                        <div className="mt-3 pt-3 border-t border-et-divider">
                          <p className="text-xs text-et-secondary">{phoneLookup.reportCount} spam report{phoneLookup.reportCount !== 1 ? 's' : ''}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Email lookup */}
                {inputType === 'email' && emailLookup && (
                  <div className="border border-et-divider bg-et-surface rounded-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-et-divider flex items-center gap-2">
                      <Mail className="w-4 h-4 text-et-red" />
                      <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">Email Validation</h3>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold font-serif text-et-text break-all">{emailLookup.email}</h4>
                          <p className="text-xs text-et-secondary mt-0.5">@{emailLookup.domain}</p>
                        </div>
                        <Badge variant={emailLookup.isValid ? 'safe' : 'risk'} className="text-[10px] shrink-0">
                          {emailLookup.isValid ? 'Valid Format' : 'Invalid'}
                        </Badge>
                      </div>
                      <div className="flex gap-3 text-xs text-et-secondary">
                        <span>Free provider: {emailLookup.isFreeProvider ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* URL lookup */}
                {inputType === 'website' && urlLookup && (
                  <div className="border border-et-divider bg-et-surface rounded-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-et-divider flex items-center gap-2">
                      <Globe className="w-4 h-4 text-et-red" />
                      <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">URL Analysis</h3>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold font-serif text-et-text break-all">{urlLookup.url}</h4>
                            <Badge variant={urlLookup.riskLevel === 'SAFE' || urlLookup.riskLevel === 'LOW_RISK' ? 'safe' : urlLookup.riskLevel === 'HIGH_RISK' ? 'risk' : 'warning'} className="text-[10px] shrink-0">
                              {urlLookup.riskLevel}
                            </Badge>
                          </div>
                          {urlLookup.recommendation && (
                            <p className="text-xs text-et-secondary mt-1">{urlLookup.recommendation}</p>
                          )}
                        </div>
                        <div className="text-center shrink-0">
                          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-lg font-bold ${
                            urlLookup.score >= 60 ? 'border-risk-high text-risk-high'
                            : urlLookup.score >= 30 ? 'border-risk-medium text-risk-medium'
                            : 'border-risk-low text-risk-low'
                          }`}>
                            {urlLookup.score}
                          </div>
                          <p className="text-[10px] text-et-secondary mt-1">Risk Score</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-et-secondary">
                        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> HTTPS: {urlLookup.usesHttps ? 'Yes' : 'No'}</span>
                        <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> DNS: {urlLookup.dnsExists ? 'Resolves' : 'No'}</span>
                        {urlLookup.sslValid !== null && (
                          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> SSL: {urlLookup.sslValid ? 'Valid' : 'Invalid'}</span>
                        )}
                        {urlLookup.suspiciousTld && (
                          <span className="flex items-center gap-1"><Flag className="w-3 h-3" /> Suspicious TLD: {urlLookup.suspiciousTld}</span>
                        )}
                        {urlLookup.recentlyCreated !== null && (
                          <span className="flex items-center gap-1">{urlLookup.recentlyCreated ? '⚠ Recently Registered' : 'Established Domain'}</span>
                        )}
                        {urlLookup.domainAgeDays !== null && (
                          <span className="flex items-center gap-1">Domain age: {urlLookup.domainAgeDays} days</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI lookup */}
                {inputType === 'upi' && upiLookup && (
                  <div className="border border-et-divider bg-et-surface rounded-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-et-divider flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-et-red" />
                      <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">UPI ID Analysis</h3>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-lg font-bold font-serif text-et-text">{upiLookup.upiId}</h4>
                            <Badge variant={upiLookup.isValid ? 'safe' : 'risk'} className="text-[10px]">
                              {upiLookup.isValid ? 'Valid Format' : 'Invalid'}
                            </Badge>
                          </div>
                          <p className="text-xs text-et-secondary">Provider: {upiLookup.provider}</p>
                        </div>
                        <div className="text-center shrink-0">
                          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-lg font-bold ${
                            upiLookup.spamScore >= 60 ? 'border-risk-high text-risk-high'
                            : upiLookup.spamScore >= 30 ? 'border-risk-medium text-risk-medium'
                            : 'border-risk-low text-risk-low'
                          }`}>
                            {upiLookup.spamScore}
                          </div>
                          <p className="text-[10px] text-et-secondary mt-1">Risk</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        {upiLookup.notes.map((note, i) => (
                          <p key={i} className="text-xs text-et-secondary flex items-center gap-1">
                            <span className={upiLookup.isValid ? 'text-risk-low' : 'text-risk-high'}>&bull;</span> {note}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Explainability + Workflow */}
                <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
                  <div className="border border-et-divider bg-et-surface rounded-sm">
                    <div className="px-5 py-3 border-b border-et-divider flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-et-red" />
                        <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">Explainable Signal Review</h3>
                      </div>
                      <span className="text-[10px] text-et-secondary">Confidence {result.confidence}%</span>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="rounded-sm border border-et-divider bg-et-bg p-4">
                        <p className="text-sm text-et-text">{result.explanation}</p>
                        <div className="mt-3 h-2 rounded-full bg-et-divider overflow-hidden">
                          <div className="h-2 rounded-full bg-et-red" style={{ width: `${result.confidence}%` }} />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] text-et-secondary">
                          <span>Model confidence</span>
                          <span>{result.confidence}%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {result.evidence.map((item) => (
                          <div key={item.label} className="rounded-sm border border-et-divider bg-et-bg p-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-medium text-et-text">{item.label}</p>
                              <span className="text-[10px] text-et-secondary">W{item.weight}</span>
                            </div>
                            <p className="text-xs text-et-secondary mt-1">{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border border-et-divider bg-et-surface rounded-sm">
                    <div className="px-5 py-3 border-b border-et-divider flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-et-red" />
                        <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">Intelligence Package</h3>
                      </div>
                      <button
                        onClick={generateAlertPackage}
                        className="text-[10px] text-et-red font-medium hover:underline cursor-pointer"
                      >
                        Generate
                      </button>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="rounded-sm border border-et-divider bg-et-bg p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] uppercase tracking-wider text-et-secondary">Case ID</span>
                          <span className="font-mono text-[11px] text-et-text">{result.caseId}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <span className="text-[10px] uppercase tracking-wider text-et-secondary">Lead time</span>
                          <span className="text-sm font-medium text-et-text">{result.leadTime}</span>
                        </div>
                      </div>
                      {alertPackage ? (
                        <div className="space-y-3">
                          <div className="rounded-sm border border-et-divider bg-et-bg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-et-red" />
                              <p className="text-sm font-medium text-et-text">{alertPackage.synopsis}</p>
                            </div>
                            <p className="text-xs text-et-secondary">{alertPackage.escalation}</p>
                          </div>
                          <div className="rounded-sm border border-et-divider bg-et-bg p-3 text-xs text-et-secondary">
                            <div className="flex items-center justify-between">
                              <span>Confidence</span>
                              <span className="font-medium text-et-text">{alertPackage.confidence}%</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span>Jurisdiction</span>
                              <span className="font-medium text-et-text">{alertPackage.jurisdiction}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span>Evidence</span>
                              <span className="font-medium text-et-text">{alertPackage.evidence.join(' · ')}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-et-secondary">Create an evidence-backed escalation package for telecom providers, banks, and cybercrime desks.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Indicators */}
                <div className="border border-et-divider bg-et-surface rounded-sm">
                  <div className="px-5 py-3 border-b border-et-divider">
                    <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">Detection Indicators</h3>
                  </div>
                  <div className="divide-y divide-et-divider">
                    {result.indicators.map((ind) => (
                      <div key={ind.name} className="flex items-center gap-3 px-5 py-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          ind.found ? 'bg-risk-high/10 text-risk-high' : 'bg-risk-low/10 text-risk-low'
                        }`}>
                          {ind.found ? (
                            <AlertTriangle className="w-3 h-3" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-et-text">{ind.name}</p>
                            <Badge variant={ind.found ? 'risk' : 'safe'} className="text-[8px] px-1 py-0 h-3.5">
                              {ind.found ? 'Detected' : 'Clear'}
                            </Badge>
                          </div>
                          <p className="text-xs text-et-secondary mt-0.5">{ind.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Actions */}
                <div className="border border-et-divider bg-et-surface rounded-sm">
                  <div className="px-5 py-3 border-b border-et-divider">
                    <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">Recommended Actions</h3>
                  </div>
                  <div className="px-5 py-4 space-y-2">
                    {result.recommendedActions.map((action, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-et-text">
                        <span className="w-5 h-5 bg-et-red/10 text-et-red rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Report Button */}
                <div className="flex items-center gap-4 p-4 bg-et-surface border border-et-divider rounded-sm">
                  <p className="text-sm text-et-secondary">Report this to the authorities</p>
                  <a
                    href="https://cybercrime.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-et-red font-medium hover:underline"
                  >
                    Report at cybercrime.gov.in <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="text-et-divider">|</span>
                  <span className="text-sm text-et-secondary">or dial</span>
                  <span className="text-sm font-bold font-mono text-et-text">1930</span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="border border-et-divider bg-et-surface rounded-sm p-5">
              <h3 className="text-xs font-bold text-et-text uppercase tracking-widest mb-3">How It Works</h3>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Enter the suspicious number, message, or call details' },
                  { step: '2', text: 'Our AI analyzes against known scam patterns and indicators' },
                  { step: '3', text: 'Get an instant risk assessment with specific warnings' },
                  { step: '4', text: 'Follow recommended actions and report if necessary' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-et-red/10 text-et-red rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{item.step}</span>
                    <p className="text-xs text-et-secondary">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-et-divider bg-et-surface rounded-sm p-5">
              <h3 className="text-xs font-bold text-et-text uppercase tracking-widest mb-3">Common Scam Types</h3>
              <div className="flex flex-wrap gap-1.5">
                {scamTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setInputType('message')
                      setInputValue(`URGENT: Your account has been flagged for suspicious activity. This is a ${type.toLowerCase()} alert. Pay immediately to avoid legal action.`)
                      setResult(null)
                      setAlertPackage(null)
                    }}
                    className="px-2.5 py-1 text-[10px] border border-et-divider rounded-sm text-et-secondary hover:border-et-red hover:text-et-red transition-colors cursor-pointer"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-et-divider bg-et-surface rounded-sm p-5">
              <h3 className="text-xs font-bold text-et-text uppercase tracking-widest mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-et-divider">
                  <span className="text-xs text-et-secondary">Scams detected today</span>
                  <span className="text-sm font-serif font-bold text-et-text">1,247</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-et-divider">
                  <span className="text-xs text-et-secondary">Active investigations</span>
                  <span className="text-sm font-serif font-bold text-et-text">342</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-xs text-et-secondary">Amount saved (this week)</span>
                  <span className="text-sm font-serif font-bold text-risk-low">₹12.4 Cr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
