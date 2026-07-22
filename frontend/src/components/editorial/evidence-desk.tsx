import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Search, Play, Download, ExternalLink,
  Mic, FileText, MessageSquare, Video, Image as ImageIcon, Shield
} from 'lucide-react'

type EvidenceItem = {
  id: string
  name: string
  context: string
  type: 'audio' | 'chat' | 'pdf' | 'image' | 'video' | 'email' | 'financial' | 'id'
  date: string
  duration?: string
  aiStatus: 'verified' | 'ocr-ready' | 'transcript-ready' | 'linked-cases' | 'high-risk' | 'processed'
  size: 'large' | 'medium' | 'small'
  transcript?: string
  amount?: string
}

const aiStatusConfig = {
  'verified': { label: 'Verified', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'ocr-ready': { label: 'OCR Ready', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'transcript-ready': { label: 'Transcript Ready', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  'linked-cases': { label: 'Linked Cases', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'high-risk': { label: 'High Risk', color: 'bg-red-50 text-red-700 border-red-200' },
  'processed': { label: 'Processed', color: 'bg-gray-50 text-gray-600 border-gray-200' },
}

function AudioPreview({ item }: { item: EvidenceItem }) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col justify-end p-4 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center px-4 opacity-30">
        <svg viewBox="0 0 400 80" className="w-full h-16">
          <path
            d="M0,40 Q10,10 20,40 Q30,70 40,40 Q50,20 60,40 Q70,55 80,40 Q90,25 100,40 Q110,60 120,40 Q130,15 140,40 Q150,65 160,40 Q170,20 180,40 Q190,55 200,40 Q210,30 220,40 Q230,50 240,40 Q250,25 260,40 Q270,60 280,40 Q290,20 300,40 Q310,55 320,40 Q330,30 340,40 Q350,50 360,40 Q370,35 380,40 Q390,45 400,40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-emerald-400"
          />
          <path
            d="M0,40 Q15,25 30,40 Q45,55 60,40 Q75,30 90,40 Q105,50 120,40 Q135,28 150,40 Q165,52 180,40 Q195,32 210,40 Q225,48 240,40 Q255,30 270,40 Q285,50 300,40 Q315,35 330,40 Q345,45 360,40 Q375,38 390,40 L400,40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-emerald-500/50"
          />
        </svg>
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          </div>
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-[35%] bg-emerald-400 rounded-full" />
          </div>
          <span className="text-[10px] text-white/50 font-mono">{item.duration}</span>
        </div>
      </div>
    </div>
  )
}

function ChatPreview() {
  return (
    <div className="w-full h-full bg-[#ECE5DD] p-4 flex flex-col justify-end gap-2 relative overflow-hidden">
      <div className="absolute top-3 left-3 right-3">
        <div className="bg-white rounded-lg rounded-tl-none p-2.5 shadow-sm max-w-[85%]">
          <p className="text-[10px] text-gray-800 leading-relaxed">Sir, your account has been flagged by CBI. You must cooperate or a warrant will be issued against you.</p>
          <p className="text-[8px] text-gray-400 mt-1 text-right">10:02 AM</p>
        </div>
      </div>
      <div className="absolute top-[52px] left-3 right-3">
        <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none p-2.5 shadow-sm max-w-[75%] ml-auto">
          <p className="text-[10px] text-gray-800 leading-relaxed">Please send the court order. I need to verify this.</p>
          <p className="text-[8px] text-gray-400 mt-1 text-right">10:05 AM</p>
        </div>
      </div>
      <div className="absolute top-[100px] left-3 right-3">
        <div className="bg-white rounded-lg rounded-tl-none p-2.5 shadow-sm max-w-[90%]">
          <p className="text-[10px] text-gray-800 leading-relaxed">Here is the notice. Pay ₹2,40,000 to UPI @scamupi-yesbank within 2 hours or police will arrive at your doorstep.</p>
          <div className="w-full h-12 bg-gray-100 rounded mt-1.5 flex items-center justify-center">
            <span className="text-[8px] text-gray-400">📎 fake_notice.pdf</span>
          </div>
          <p className="text-[8px] text-gray-400 mt-1 text-right">10:08 AM</p>
        </div>
      </div>
    </div>
  )
}

function PdfPreview(_props: { item: EvidenceItem }) {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="flex-1 p-4 border-b border-gray-100">
        <div className="w-full h-3 bg-gray-200 rounded mb-2" />
        <div className="w-3/4 h-3 bg-gray-200 rounded mb-4" />
        <div className="space-y-1.5">
          <div className="w-full h-2 bg-gray-100 rounded" />
          <div className="w-full h-2 bg-gray-100 rounded" />
          <div className="w-5/6 h-2 bg-gray-100 rounded" />
          <div className="w-full h-2 bg-gray-100 rounded" />
          <div className="w-2/3 h-2 bg-gray-100 rounded" />
        </div>
        <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-red-500 rounded-sm flex items-center justify-center">
              <span className="text-[6px] text-white font-bold">!</span>
            </div>
            <span className="text-[8px] text-red-700 font-medium">NOTICE: ARREST WARRANT</span>
          </div>
        </div>
      </div>
      <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
        <span className="text-[8px] text-gray-400">SUPREME COURT OF INDIA</span>
        <span className="text-[8px] text-gray-400">1/3</span>
      </div>
    </div>
  )
}

function FinancialPreview(_props: { item: EvidenceItem }) {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-[6px] text-white font-bold">SB</span>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-900">State Bank of India</p>
              <p className="text-[8px] text-gray-400">****4821</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] text-gray-400">Available</p>
            <p className="text-[11px] font-bold text-gray-900">₹12,340</p>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4">
        <div className="space-y-2.5">
          {[
            { desc: 'UPI Transfer — @mule1', amt: '-₹1,60,000', color: 'text-red-600' },
            { desc: 'UPI Transfer — @mule2', amt: '-₹1,80,000', color: 'text-red-600' },
            { desc: 'UPI Transfer — @mule3', amt: '-₹1,42,000', color: 'text-red-600' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-[9px] text-gray-700">{tx.desc}</p>
                <p className="text-[7px] text-gray-400">20 May 2025</p>
              </div>
              <span className={`text-[9px] font-semibold ${tx.color}`}>{tx.amt}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-2 bg-red-50 border-t border-red-100">
        <div className="flex items-center justify-between">
          <span className="text-[8px] text-red-600 font-medium">⚠ Suspicious Activity Detected</span>
          <span className="text-[8px] text-red-600 font-bold">₹4,82,000</span>
        </div>
      </div>
    </div>
  )
}

function VideoPreview({ item }: { item: EvidenceItem }) {
  return (
    <div className="w-full h-full bg-gray-900 relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full grid grid-cols-6 grid-rows-4 gap-px">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="bg-gray-700/30" />
          ))}
        </div>
      </div>
      <div className="relative z-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 cursor-pointer hover:bg-white/20 transition-colors">
        <Play className="w-6 h-6 text-white fill-white ml-1" />
      </div>
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] text-white/70 font-mono">{item.duration}</span>
        </div>
        <span className="text-[8px] text-white/50 font-mono">CCTV</span>
      </div>
      <div className="absolute top-3 left-3 z-10">
        <div className="px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[8px] text-white/70 font-mono">
          CAM-04 — SECTOR 18
        </div>
      </div>
    </div>
  )
}

function EmailPreview() {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
            <span className="text-[8px] font-bold text-gray-500">CB</span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-gray-900 truncate">CBI Investigation Cell</p>
            <p className="text-[8px] text-gray-400 truncate">notice@cbi-gov.in.investigate.xyz</p>
          </div>
        </div>
      </div>
      <div className="flex-1 p-3">
        <p className="text-[9px] font-semibold text-gray-900 mb-1.5">URGENT: Account Suspension Notice</p>
        <div className="space-y-1">
          <div className="w-full h-1.5 bg-gray-100 rounded" />
          <div className="w-5/6 h-1.5 bg-gray-100 rounded" />
          <div className="w-full h-1.5 bg-gray-100 rounded" />
          <div className="w-3/4 h-1.5 bg-gray-100 rounded" />
        </div>
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
          <p className="text-[8px] text-amber-700">⚠ This is a phishing domain. The sender is impersonating CBI.</p>
        </div>
      </div>
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span className="text-[7px] text-red-600 font-medium">SPOOFED DOMAIN</span>
        </div>
      </div>
    </div>
  )
}

function ImagePreview() {
  return (
    <div className="w-full h-full bg-gray-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-28 bg-white rounded-lg shadow-md border border-gray-200 mx-auto flex flex-col items-center justify-center p-1.5">
            <div className="w-full h-3 bg-gray-100 rounded mb-1" />
            <div className="w-3/4 h-2 bg-gray-100 rounded mb-2" />
            <div className="w-full space-y-1">
              <div className="w-full h-1.5 bg-blue-100 rounded" />
              <div className="w-full h-1.5 bg-green-100 rounded" />
              <div className="w-full h-1.5 bg-gray-100 rounded" />
            </div>
            <div className="mt-2 w-full h-4 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-[6px] text-white font-bold">₹48,000</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <span className="text-[8px] text-gray-500 bg-white/80 px-1.5 py-0.5 rounded">Screenshot</span>
        <span className="text-[8px] text-gray-500 bg-white/80 px-1.5 py-0.5 rounded">480×860</span>
      </div>
    </div>
  )
}

function IdPreview() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[180px] bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-orange-400 via-white to-green-400" />
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-200 rounded" />
            <div className="flex-1">
              <div className="w-full h-2 bg-gray-200 rounded mb-1" />
              <div className="w-2/3 h-2 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-[7px] text-gray-400">UID</span>
              <span className="text-[7px] text-gray-600 font-mono">XXXX-XXXX-7842</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[7px] text-gray-400">Name</span>
              <span className="text-[7px] text-gray-600">RAKESH KUMAR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[7px] text-gray-400">DOB</span>
              <span className="text-[7px] text-gray-600">15/08/1992</span>
            </div>
          </div>
        </div>
        <div className="h-1.5 bg-gradient-to-r from-orange-400 via-white to-green-400" />
      </div>
    </div>
  )
}

function EvidenceCard({ item }: { item: EvidenceItem }) {
  const [hovered, setHovered] = useState(false)

  const renderPreview = () => {
    switch (item.type) {
      case 'audio': return <AudioPreview item={item} />
      case 'chat': return <ChatPreview />
      case 'pdf': return <PdfPreview item={item} />
      case 'financial': return <FinancialPreview item={item} />
      case 'video': return <VideoPreview item={item} />
      case 'email': return <EmailPreview />
      case 'image': return <ImagePreview />
      case 'id': return <IdPreview />
    }
  }

  const status = aiStatusConfig[item.aiStatus]

  const sizeClasses = {
    large: 'col-span-2 row-span-2',
    medium: 'col-span-2 row-span-1',
    small: 'col-span-1 row-span-1',
  }

  return (
    <div
      className={`${sizeClasses[item.size]} border border-gray-200 rounded-lg overflow-hidden cursor-pointer group relative hover:border-gray-400 transition-all duration-200`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Preview Area */}
      <div className={`${item.size === 'large' ? 'h-52' : item.size === 'medium' ? 'h-36' : 'h-32'} relative`}>
        {renderPreview()}

        {/* Hover Overlay */}
        {hovered && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center gap-2 z-20 animate-in fade-in duration-150">
            <button
              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(item.name + ' - ' + item.context); }}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/20"
              title="Copy name to clipboard"
            >
              <ExternalLink className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); const a = document.createElement('a'); a.href = '#'; a.download = `${item.name}.file`; a.click(); }}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/20"
              title="Download"
            >
              <Download className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="p-3 bg-white">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h4 className="text-[13px] font-semibold text-gray-900 leading-tight truncate">{item.name}</h4>
          <Badge variant="outline" className={`text-[8px] px-1.5 py-0 h-4 shrink-0 border ${status.color}`}>
            {status.label}
          </Badge>
        </div>
        <p className="text-[11px] text-gray-500 leading-snug line-clamp-1">{item.context}</p>
        <p className="text-[10px] text-gray-400 mt-1.5 font-mono">{item.date}</p>
      </div>
    </div>
  )
}

const filterOptions = [
  { label: 'Audio', value: 'audio', icon: Mic },
  { label: 'Images', value: 'image', icon: ImageIcon },
  { label: 'Documents', value: 'pdf', icon: FileText },
  { label: 'Chats', value: 'chat', icon: MessageSquare },
  { label: 'Video', value: 'video', icon: Video },
]

const allEvidence: Record<string, EvidenceItem[]> = {
  'INV-2025-05-17-0001': [
    { id: 'ev-001', name: 'Call Recording — Victim 1', context: 'Scam call demanding ₹2.4L via fake CBI notice', type: 'audio', date: '20 May, 10:30 AM', duration: '12:47', aiStatus: 'transcript-ready', size: 'large', transcript: '"This is Inspector Sharma from CBI..."' },
    { id: 'ev-002', name: 'WhatsApp Chat Export', context: 'Threat messages with fake court order screenshots', type: 'chat', date: '20 May, 10:15 AM', aiStatus: 'verified', size: 'large' },
    { id: 'ev-003', name: 'Fake Supreme Court Notice', context: 'Forged arrest warrant with fake case number', type: 'pdf', date: '19 May, 04:04 PM', aiStatus: 'ocr-ready', size: 'medium' },
    { id: 'ev-004', name: 'UPI Transaction Screenshot', context: '₹48,000 transferred to @scamupi-yesbank', type: 'image', date: '18 May, 08:55 PM', aiStatus: 'verified', size: 'small', amount: '₹48,000' },
    { id: 'ev-005', name: 'CCTV — ATM Withdrawal', context: 'Suspect withdrawing cash at Sector 18 Noida ATM', type: 'video', date: '18 May, 03:10 AM', duration: '02:34', aiStatus: 'linked-cases', size: 'large' },
    { id: 'ev-006', name: 'Call Recording — Victim 2', context: 'Follow-up call demanding additional payment', type: 'audio', date: '20 May, 10:12 PM', duration: '08:22', aiStatus: 'transcript-ready', size: 'medium' },
    { id: 'ev-007', name: 'Legal Notice Email', context: 'Spoofed email from fake CBI domain', type: 'email', date: '18 May, 04:30 PM', aiStatus: 'ocr-ready', size: 'medium' },
    { id: 'ev-008', name: 'Aadhaar Card — Suspect', context: 'ID proof linked to mule account holder', type: 'image', date: '17 May, 11:20 AM', aiStatus: 'verified', size: 'small' },
    { id: 'ev-009', name: 'Call Recording — Scammer', context: 'Outbound call to victim threatening arrest', type: 'audio', date: '19 May, 02:15 PM', duration: '05:41', aiStatus: 'transcript-ready', size: 'medium' },
    { id: 'ev-010', name: 'Screenshot — Fake App', context: 'WhatsApp scam group with 247 members', type: 'image', date: '19 May, 06:45 PM', aiStatus: 'processed', size: 'small' },
  ],
  'INV-2025-05-16-0002': [
    { id: 'ev-101', name: 'UPI Collect Request Logs', context: 'Automated collect requests to 200+ numbers', type: 'image', date: '16 May, 11:20 AM', aiStatus: 'verified', size: 'large' },
    { id: 'ev-102', name: 'Mule Account List', context: '12 accounts used for fund routing', type: 'pdf', date: '16 May, 02:45 PM', aiStatus: 'ocr-ready', size: 'large' },
    { id: 'ev-103', name: 'Victim Call Recording', context: 'Victim describing how collect request was approved', type: 'audio', date: '17 May, 09:15 AM', duration: '06:33', aiStatus: 'transcript-ready', size: 'medium' },
    { id: 'ev-104', name: 'Bank Transfer Trail', context: 'Fund flow through 3 layers of accounts', type: 'pdf', date: '17 May, 11:00 AM', aiStatus: 'high-risk', size: 'medium' },
    { id: 'ev-105', name: 'WhatsApp Group Screenshots', context: 'Scammers celebrating successful collections', type: 'image', date: '16 May, 05:30 PM', aiStatus: 'verified', size: 'small' },
    { id: 'ev-106', name: 'CCTV — Meeting Point', context: 'Suspects meeting at Mumbai cafe', type: 'video', date: '15 May, 07:20 PM', duration: '03:15', aiStatus: 'linked-cases', size: 'medium' },
  ],
  'INV-2025-05-16-0003': [
    { id: 'ev-201', name: 'Spoofed Customs Email', context: 'Fake refund notification from customs domain', type: 'email', date: '16 May, 10:00 AM', aiStatus: 'ocr-ready', size: 'large' },
    { id: 'ev-202', name: 'Fake Refund Portal Screenshot', context: 'Website mimicking customs.gov.in', type: 'image', date: '16 May, 10:15 AM', aiStatus: 'verified', size: 'medium' },
    { id: 'ev-203', name: 'Victim Statement Audio', context: 'Victim describing the scam process', type: 'audio', date: '17 May, 02:30 PM', duration: '04:18', aiStatus: 'transcript-ready', size: 'medium' },
    { id: 'ev-204', name: 'Processing Fee Receipt', context: 'UPI receipt for ₹5,000 processing fee', type: 'image', date: '16 May, 11:45 AM', aiStatus: 'verified', size: 'small' },
    { id: 'ev-205', name: 'Domain Registration Records', context: 'Whois data for fake customs domain', type: 'pdf', date: '17 May, 09:00 AM', aiStatus: 'processed', size: 'small' },
  ],
  'INV-2025-05-14-0001': [
    { id: 'ev-301', name: 'Loan App APK Analysis', context: 'Malicious permissions and data collection', type: 'pdf', date: '14 May, 03:00 PM', aiStatus: 'high-risk', size: 'large' },
    { id: 'ev-302', name: 'Victim Threat Messages', context: 'WhatsApp threats to contact all contacts', type: 'chat', date: '15 May, 10:30 AM', aiStatus: 'verified', size: 'large' },
    { id: 'ev-303', name: 'Interest Rate Calculation', context: '300%+ annual interest documented', type: 'pdf', date: '14 May, 04:15 PM', aiStatus: 'ocr-ready', size: 'medium' },
    { id: 'ev-304', name: 'App Store Listing Screenshots', context: 'Fake reviews and ratings', type: 'image', date: '14 May, 02:00 PM', aiStatus: 'processed', size: 'small' },
    { id: 'ev-305', name: 'Call Recording — Recovery Agent', context: 'Threatening call from recovery agent', type: 'audio', date: '15 May, 11:45 AM', duration: '07:12', aiStatus: 'transcript-ready', size: 'medium' },
    { id: 'ev-306', name: 'Data Breach Evidence', context: 'Contact list accessed without consent', type: 'pdf', date: '15 May, 01:30 PM', aiStatus: 'high-risk', size: 'medium' },
    { id: 'ev-307', name: 'CCTV — Agent Office', context: 'Recovery agent office in Bangalore', type: 'video', date: '14 May, 06:00 PM', duration: '01:45', aiStatus: 'linked-cases', size: 'small' },
  ],
  'INV-2025-05-13-0001': [
    { id: 'ev-401', name: 'Trading Platform Screenshots', context: 'Fake profit dashboard showing 400% returns', type: 'image', date: '13 May, 11:00 AM', aiStatus: 'verified', size: 'large' },
    { id: 'ev-402', name: 'Telegram Group Messages', context: 'Fake testimonials and profit screenshots', type: 'chat', date: '13 May, 02:30 PM', aiStatus: 'verified', size: 'large' },
    { id: 'ev-403', name: 'Crypto Wallet Transactions', context: 'BTC deposits routed through 5 wallets', type: 'pdf', date: '14 May, 09:00 AM', aiStatus: 'high-risk', size: 'medium' },
    { id: 'ev-404', name: 'Website Source Code Analysis', context: 'Manipulated price charts detected', type: 'pdf', date: '13 May, 04:00 PM', aiStatus: 'processed', size: 'medium' },
    { id: 'ev-405', name: 'Victim Audio Statement', context: 'Describing initial small withdrawal success', type: 'audio', date: '14 May, 11:30 AM', duration: '05:55', aiStatus: 'transcript-ready', size: 'medium' },
  ],
  'INV-2025-05-12-0001': [
    { id: 'ev-501', name: 'Fake Court Notice — PDF', context: 'Forged Supreme Court letterhead', type: 'pdf', date: '12 May, 10:00 AM', aiStatus: 'ocr-ready', size: 'large' },
    { id: 'ev-502', name: 'WhatsApp Threat Messages', context: '24-hour deadline to pay or face arrest', type: 'chat', date: '12 May, 10:30 AM', aiStatus: 'verified', size: 'large' },
    { id: 'ev-503', name: 'Payment Screenshot', context: '₹35,000 UPI payment to settle fake case', type: 'image', date: '12 May, 11:15 AM', aiStatus: 'verified', size: 'small' },
    { id: 'ev-504', name: 'Call Recording — Scammer', context: 'Posing as court registrar demanding payment', type: 'audio', date: '12 May, 09:45 AM', duration: '09:20', aiStatus: 'transcript-ready', size: 'medium' },
    { id: 'ev-505', name: 'Email Thread Evidence', context: 'Multiple emails from spoofed domain', type: 'email', date: '11 May, 04:00 PM', aiStatus: 'ocr-ready', size: 'medium' },
  ],
  'INV-2025-05-11-0001': [
    { id: 'ev-601', name: 'Remote Access Session Recording', context: 'TeamViewer session stealing UPI PIN', type: 'video', date: '11 May, 02:00 PM', duration: '04:30', aiStatus: 'linked-cases', size: 'large' },
    { id: 'ev-602', name: 'Scam Call Recording', context: 'Caller posing as e-commerce support', type: 'audio', date: '11 May, 01:30 PM', duration: '03:45', aiStatus: 'transcript-ready', size: 'medium' },
    { id: 'ev-603', name: 'Fake Refund Portal', context: 'Website mimicking popular e-commerce site', type: 'image', date: '11 May, 01:45 PM', aiStatus: 'verified', size: 'medium' },
    { id: 'ev-604', name: 'Transaction Alerts', context: 'Multiple small deductions from bank account', type: 'image', date: '12 May, 09:00 AM', aiStatus: 'verified', size: 'small' },
  ],
}

export function EvidenceDesk({ investigationId = 'INV-2025-05-17-0001' }: { investigationId?: string }) {
  const [activeFilter, setActiveFilter] = useState('audio')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')

  const evidenceData = allEvidence[investigationId] || allEvidence['INV-2025-05-17-0001']

  const filtered = useMemo(() => {
    let items = evidenceData.filter((e) => e.type === activeFilter)

    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (e) => e.name.toLowerCase().includes(q) || e.context.toLowerCase().includes(q)
      )
    }

    return items
  }, [activeFilter, search])

  return (
    <div className="space-y-5">
      {/* Investigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Evidence Desk</h2>
          <div className="flex items-center gap-3 mt-1 text-[12px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-red-500" />
              <span className="font-medium text-red-600">High Risk</span>
            </span>
            <span className="text-gray-300">|</span>
            <span>{evidenceData.length} items</span>
            <span className="text-gray-300">|</span>
            <span>Updated 2 hours ago</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Type Filters */}
        <div className="flex items-center gap-1 flex-wrap">
          {filterOptions.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-full border transition-all duration-150 cursor-pointer ${
                activeFilter === f.value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900'
              }`}
            >
              {f.icon && <f.icon className="w-3 h-3" />}
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search evidence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-48 h-8 pl-8 pr-3 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-white"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-8 px-2.5 text-[12px] border border-gray-200 rounded-lg bg-white text-gray-600 outline-none cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="type">By Type</option>
            <option value="risk">By Risk</option>
          </select>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {filtered.map((item) => (
          <div key={item.id} className="break-inside-avoid">
            <EvidenceCard item={item} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-sm text-gray-400">
          No evidence matches your search.
        </div>
      )}
    </div>
  )
}
