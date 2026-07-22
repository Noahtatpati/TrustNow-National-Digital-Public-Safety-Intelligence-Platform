import { useState } from 'react'
import { X, Upload, Check, Headphones, Video, ImageIcon, FileText, MessageSquare, Archive, ChevronRight, Camera } from 'lucide-react'

type EvidenceType = 'audio' | 'video' | 'image' | 'document' | 'chat' | 'other'

const evidenceTypes = [
  { type: 'audio' as EvidenceType, label: 'Audio', desc: 'Call recordings, voice notes, audio files', icon: Headphones },
  { type: 'video' as EvidenceType, label: 'Video', desc: 'CCTV footage, screen recordings, videos', icon: Video },
  { type: 'image' as EvidenceType, label: 'Image', desc: 'Photos, screenshots, scanned images', icon: ImageIcon },
  { type: 'document' as EvidenceType, label: 'Document', desc: 'PDF, DOC, XLS, statements', icon: FileText },
  { type: 'chat' as EvidenceType, label: 'Chat / Message', desc: 'WhatsApp, SMS, Email, Social media', icon: MessageSquare },
  { type: 'other' as EvidenceType, label: 'Other', desc: 'ZIP files, logs, miscellaneous', icon: Archive },
]

const subCategories: Record<string, string[]> = {
  audio: ['Scam Call', 'Threat Call', 'Negotiation Call', 'Voice Note', 'Recorded Statement'],
  video: ['CCTV Footage', 'Screen Recording', 'Body Camera', 'Surveillance'],
  image: ['Screenshot', 'Photo', 'Scanned Document', 'CCTV Frame'],
  document: ['Bank Statement', 'Legal Notice', 'Court Order', 'ID Proof', 'Invoice'],
  chat: ['WhatsApp', 'SMS', 'Email', 'Social Media Message'],
  other: ['Log File', 'ZIP Archive', 'Data Export', 'Other'],
}

const sources = ['Victim Phone', 'Police Report', 'Bank Record', 'Witness Statement', 'Digital Forensics', 'Public Record']

const tags = ['Digital Arrest', 'Police Impersonation', 'ATM', 'Cash Withdrawal', 'Suspect Identified', 'WhatsApp', 'Threat', 'Extortion', 'Bank', 'Transaction', 'Financial Evidence']

interface AddEvidenceModalProps {
  open: boolean
  onClose: () => void
  onAdd: (evidence: Record<string, string | string[] | boolean>) => void
}

export function AddEvidenceModal({ open, onClose, onAdd }: AddEvidenceModalProps) {
  const [step, setStep] = useState(1)
  const [evidenceType, setEvidenceType] = useState<EvidenceType | null>(null)
  const [fileName, setFileName] = useState('')
  const [form, setForm] = useState({
    name: '',
    category: '',
    subCategory: '',
    description: '',
    dateTime: '20/07/2026 10:30 AM',
    source: 'Victim Phone',
    location: '',
    tags: [] as string[],
    // Audio specific
    callType: 'Incoming',
    language: 'Hindi',
    duration: '02:41',
    transcribe: false,
    // Video specific
    videoType: 'CCTV Footage',
    resolution: '1080p',
    // Image specific
    imageType: 'Screenshot',
    // Document specific
    docType: 'Bank Statement',
    issuedBy: '',
    documentDate: '',
    referenceNumber: '',
  })

  if (!open) return null

  const updateForm = (key: string, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const handleNext = () => {
    if (step < 5) setStep(step + 1)
  }

  const handleBack = () => {
    if (step === 1 && evidenceType) {
      setEvidenceType(null)
      setFileName('')
    } else if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleAdd = () => {
    onAdd({ ...form, type: evidenceType || '', fileName })
    setStep(5)
  }

  const handleClose = () => {
    setStep(1)
    setEvidenceType(null)
    setFileName('')
    setForm({
      name: '', category: '', subCategory: '', description: '',
      dateTime: '20/07/2026 10:30 AM', source: 'Victim Phone', location: '',
      tags: [], callType: 'Incoming', language: 'Hindi', duration: '02:41',
      transcribe: false, videoType: 'CCTV Footage', resolution: '1080p',
      imageType: 'Screenshot', docType: 'Bank Statement', issuedBy: '',
      documentDate: '', referenceNumber: '',
    })
    onClose()
  }

  const stepLabels = ['Upload', 'Details', 'Review']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {step === 5 ? 'Evidence Added Successfully!' : `Add Evidence${evidenceType ? ` — ${evidenceTypes.find((t) => t.type === evidenceType)?.label}` : ''}`}
          </h2>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Step Indicator */}
        {step <= 3 && (
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              {stepLabels.map((label, i) => {
                const num = i + 1
                const isActive = step === num
                const isDone = step > num
                return (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                      isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-et-red text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {isDone ? <Check className="w-3 h-3" /> : num}
                    </div>
                    <span className={`text-[11px] font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
                    {i < 2 && <div className={`w-8 h-px mx-1 ${isDone ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Select Type */}
          {step === 1 && !evidenceType && (
            <div>
              <p className="text-sm text-gray-500 mb-4">Select evidence type</p>
              <div className="grid grid-cols-3 gap-3">
                {evidenceTypes.map((t) => (
                  <button
                    key={t.type}
                    onClick={() => { setEvidenceType(t.type); setForm((p) => ({ ...p, category: t.label })) }}
                    className="flex flex-col items-center gap-2 p-5 border border-gray-200 rounded-sm hover:border-et-red hover:bg-red-50/30 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-et-red/10 flex items-center justify-center transition-colors">
                      <t.icon className="w-5 h-5 text-gray-500 group-hover:text-et-red transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{t.label}</span>
                    <span className="text-[10px] text-gray-400 text-center leading-tight">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Upload (after type selected) */}
          {step === 1 && evidenceType && (
            <div>
              <div
                className="border-2 border-dashed border-gray-300 rounded-sm p-12 text-center hover:border-et-red transition-colors cursor-pointer"
                onClick={() => setFileName(`evidence_${Date.now()}.${evidenceType === 'audio' ? 'mp3' : evidenceType === 'video' ? 'mp4' : evidenceType === 'image' ? 'jpg' : evidenceType === 'document' ? 'pdf' : evidenceType === 'chat' ? 'txt' : 'zip'}`)}
              >
                {fileName ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-emerald-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{fileName}</p>
                    <p className="text-xs text-gray-400">Click to change file</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-sm text-gray-600">Drag and drop {evidenceType} files here</p>
                    <p className="text-xs text-gray-400">or</p>
                    <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-et-red border border-et-red rounded-sm hover:bg-red-50 transition-colors cursor-pointer">
                      Choose File
                    </button>
                    <p className="text-[10px] text-gray-400 mt-2">
                      Supports: {evidenceType === 'audio' ? 'MP3, WAV, M4A, OGG (Max 100MB)' :
                        evidenceType === 'video' ? 'MP4, MOV, AVI (Max 500MB)' :
                        evidenceType === 'image' ? 'JPG, PNG, HEIC (Max 50MB)' :
                        evidenceType === 'document' ? 'PDF, DOC, XLS (Max 25MB)' :
                        evidenceType === 'chat' ? 'TXT, PDF, HTML (Max 10MB)' :
                        'ZIP, LOG, CSV (Max 100MB)'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Evidence Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    placeholder="e.g. Call Recording - Victim 1"
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-et-text"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                  <input type="text" value={form.category} readOnly className="w-full h-9 px-3 text-sm border border-gray-200 rounded-sm bg-gray-50 text-gray-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Sub Category *</label>
                  <select
                    value={form.subCategory}
                    onChange={(e) => updateForm('subCategory', e.target.value)}
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded-sm bg-white focus:outline-none focus:border-et-text cursor-pointer"
                  >
                    <option value="">Select...</option>
                    {(subCategories[evidenceType || 'other'] || []).map((sc) => (
                      <option key={sc} value={sc}>{sc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Date & Time</label>
                  <input
                    type="text"
                    value={form.dateTime}
                    onChange={(e) => updateForm('dateTime', e.target.value)}
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-et-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  placeholder="Describe what this evidence contains..."
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-et-text resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Source</label>
                  <select
                    value={form.source}
                    onChange={(e) => updateForm('source', e.target.value)}
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded-sm bg-white focus:outline-none focus:border-et-text cursor-pointer"
                  >
                    {sources.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">Location</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => updateForm('location', e.target.value)}
                    placeholder="City, State"
                    className="w-full h-9 px-3 text-sm border border-gray-200 rounded-sm focus:outline-none focus:border-et-text"
                  />
                </div>
              </div>

              {/* Type-specific fields */}
              {evidenceType === 'audio' && (
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100 space-y-4">
                  <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Audio Details</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Call Type</label>
                      <select value={form.callType} onChange={(e) => updateForm('callType', e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 rounded-sm bg-white cursor-pointer">
                        <option>Incoming</option><option>Outgoing</option><option>Missed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Language</label>
                      <select value={form.language} onChange={(e) => updateForm('language', e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 rounded-sm bg-white cursor-pointer">
                        <option>Hindi</option><option>English</option><option>Tamil</option><option>Telugu</option><option>Bengali</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Duration</label>
                      <input type="text" value={form.duration} onChange={(e) => updateForm('duration', e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 rounded-sm" />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.transcribe} onChange={(e) => updateForm('transcribe', e.target.checked)} className="w-3.5 h-3.5 rounded border-gray-300" />
                    <span className="text-xs text-gray-600">Transcribe Audio</span>
                  </label>
                </div>
              )}

              {evidenceType === 'video' && (
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100 space-y-4">
                  <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Video Details</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Video Type</label>
                      <select value={form.videoType} onChange={(e) => updateForm('videoType', e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 rounded-sm bg-white cursor-pointer">
                        <option>CCTV Footage</option><option>Screen Recording</option><option>Body Camera</option><option>Surveillance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Duration</label>
                      <input type="text" value={form.duration} onChange={(e) => updateForm('duration', e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 rounded-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Resolution</label>
                      <select value={form.resolution} onChange={(e) => updateForm('resolution', e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 rounded-sm bg-white cursor-pointer">
                        <option>1080p</option><option>720p</option><option>480p</option><option>4K</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {evidenceType === 'image' && (
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100 space-y-4">
                  <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Image Details</p>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-500 mb-1">Image Type</label>
                    <select value={form.imageType} onChange={(e) => updateForm('imageType', e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 rounded-sm bg-white cursor-pointer">
                      <option>Screenshot</option><option>Photo</option><option>Scanned Document</option><option>CCTV Frame</option>
                    </select>
                  </div>
                </div>
              )}

              {evidenceType === 'document' && (
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100 space-y-4">
                  <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">Document Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Document Type</label>
                      <select value={form.docType} onChange={(e) => updateForm('docType', e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 rounded-sm bg-white cursor-pointer">
                        <option>Bank Statement</option><option>Legal Notice</option><option>Court Order</option><option>ID Proof</option><option>Invoice</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Issued By</label>
                      <input type="text" value={form.issuedBy} onChange={(e) => updateForm('issuedBy', e.target.value)} placeholder="e.g. SBI Bank" className="w-full h-8 px-2 text-xs border border-gray-200 rounded-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Document Date</label>
                      <input type="text" value={form.documentDate} onChange={(e) => updateForm('documentDate', e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 rounded-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1">Reference Number</label>
                      <input type="text" value={form.referenceNumber} onChange={(e) => updateForm('referenceNumber', e.target.value)} className="w-full h-8 px-2 text-xs border border-gray-200 rounded-sm" />
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-full border transition-colors cursor-pointer ${
                        form.tags.includes(tag)
                          ? 'bg-et-red text-white border-et-red'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {tag}
                      {form.tags.includes(tag) && <X className="w-2.5 h-2.5" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-sm border border-gray-100">
                <div className="w-16 h-16 bg-white border border-gray-200 rounded-sm flex items-center justify-center shrink-0">
                  {evidenceType === 'audio' && <Headphones className="w-7 h-7 text-gray-400" />}
                  {evidenceType === 'video' && <Video className="w-7 h-7 text-gray-400" />}
                  {evidenceType === 'image' && <Camera className="w-7 h-7 text-gray-400" />}
                  {evidenceType === 'document' && <FileText className="w-7 h-7 text-gray-400" />}
                  {evidenceType === 'chat' && <MessageSquare className="w-7 h-7 text-gray-400" />}
                  {evidenceType === 'other' && <Archive className="w-7 h-7 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{form.name || 'Untitled Evidence'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{fileName}</p>
                  {evidenceType === 'audio' && (
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-8 bg-white rounded border border-gray-200 flex items-center px-3 gap-2">
                        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-et-red" />
                        <div className="flex-1 flex items-end gap-[1px] h-5">
                          {Array.from({ length: 40 }).map((_, i) => (
                            <div key={i} className="w-[2px] bg-et-red/40 rounded-full" style={{ height: `${Math.random() * 80 + 20}%` }} />
                          ))}
                        </div>
                        <span className="text-[9px] text-gray-400 font-mono">{form.duration}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {[
                  ['Evidence Name', form.name || '—'],
                  ['Category', form.category],
                  ['Sub Category', form.subCategory || '—'],
                  ['Date & Time', form.dateTime],
                  ['Source', form.source],
                  ['Location', form.location || '—'],
                  ['Description', form.description || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-medium text-gray-900 text-right max-w-[60%] truncate">{value}</span>
                  </div>
                ))}
              </div>

              {form.tags.length > 0 && (
                <div>
                  <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Evidence Added Successfully!</h3>
              <p className="text-sm text-gray-500 mb-6">The evidence has been added to the investigation.</p>

              <div className="inline-flex items-center gap-3 p-3 bg-gray-50 rounded-sm border border-gray-100 mb-8">
                <div className="w-10 h-10 bg-white border border-gray-200 rounded-sm flex items-center justify-center">
                  {evidenceType === 'audio' && <Headphones className="w-5 h-5 text-gray-400" />}
                  {evidenceType === 'video' && <Video className="w-5 h-5 text-gray-400" />}
                  {evidenceType === 'image' && <Camera className="w-5 h-5 text-gray-400" />}
                  {evidenceType === 'document' && <FileText className="w-5 h-5 text-gray-400" />}
                  {evidenceType === 'chat' && <MessageSquare className="w-5 h-5 text-gray-400" />}
                  {evidenceType === 'other' && <Archive className="w-5 h-5 text-gray-400" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{form.name || 'Untitled Evidence'}</p>
                  <p className="text-[10px] text-gray-500">{form.category} · {form.dateTime}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => { setStep(1); setEvidenceType(null); setFileName(''); setForm((p) => ({ ...p, name: '', description: '', subCategory: '', tags: [], location: '', issuedBy: '', documentDate: '', referenceNumber: '' })) }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Add Another
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-et-red rounded-sm hover:bg-et-red-hover transition-colors cursor-pointer"
                >
                  Go to Evidence List
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 5 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <button
              onClick={handleBack}
              disabled={step === 1 && !evidenceType}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <div className="flex items-center gap-2">
              <button onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                Cancel
              </button>
              {step === 3 ? (
                <button onClick={handleAdd} className="px-5 py-2 text-sm font-medium text-white bg-et-red rounded-sm hover:bg-et-red-hover transition-colors cursor-pointer">
                  Add Evidence
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={step === 1 && !fileName}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-et-red rounded-sm hover:bg-et-red-hover transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
