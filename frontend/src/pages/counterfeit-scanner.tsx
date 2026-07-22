import { useState, useRef, useCallback, useEffect } from 'react'
import { TopNav } from '@/layouts/top-nav'
import { Badge } from '@/components/ui/badge'
import { ShieldAlert, Scan, CheckCircle, XCircle, Upload, Camera, ImageIcon, X } from 'lucide-react'

type DetectionCheck = {
  id: string
  label: string
  description: string
  passed: boolean | null
  details: string
}

const demoNotes = [
  {
    id: 'genuine-500',
    label: 'Genuine ₹500 (New Design)',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/New_500_rupee_note.jpg/800px-New_500_rupee_note.jpg',
    results: [
      { id: 'thread', label: 'Security Thread', passed: true, description: 'Windowed security thread with RBI text visible when held against light', details: 'Thread reads "भारत" (Bharat) — color shifts green to blue on tilt. Position: 8mm from left edge.' },
      { id: 'microprint', label: 'Microprint Lettering', passed: true, description: 'Microprinted "RBI" and "₹500" text under magnification', details: 'Clear, sharp microprint visible at 10x magnification on Gandhi\'s collar and the ornamental leaf pattern.' },
      { id: 'serial', label: 'Serial Number', passed: true, description: 'Unique serial number with consistent font and spacing', details: 'Number format: 7B 123456 — prefix matches RBI records, font is consistent with no bleeding.' },
      { id: 'watermark', label: 'Watermark', passed: true, description: 'Mahatma Gandhi portrait watermark and electrotype denomination', details: 'Clear multi-tone watermark visible when held to light. Electrotype "500" is distinct.' },
      { id: 'uv', label: 'UV Feature', passed: true, description: 'UV-reactive elements including number panel and security thread', details: 'Number panel fluoresces green under UV light. Security thread glows yellow. Paper does not glow (genuine paper has no optical brightener).' },
      { id: 'latent', label: 'Latent Image', passed: true, description: 'Hidden denomination value visible when note is tilted at 45°', details: '"500" appears clearly in the latent image band when tilted. Font matches official RBI specimen.' },
    ],
  },
  {
    id: 'fake-500',
    label: 'Counterfeit ₹500 (Seized Sample)',
    image: 'https://images.unsplash.com/photo-1585314614250-d2130-98670b57c53f?w=800&h=500&fit=crop',
    results: [
      { id: 'thread', label: 'Security Thread', passed: false, description: 'Windowed security thread with RBI text visible when held against light', details: '⚠ FRAUD: Printed security thread (not windowed). No color shift. Text reads "INDIA" instead of "भारत". Thread is printed on surface, not embedded.' },
      { id: 'microprint', label: 'Microprint Lettering', passed: false, description: 'Microprinted "RBI" and "₹500" text under magnification', details: '⚠ FRAUD: Microprint is blurred and illegible at 10x. Text appears as a solid line rather than individual characters. Printing resolution is ~300dpi vs required 1200dpi.' },
      { id: 'serial', label: 'Serial Number', passed: true, description: 'Unique serial number with consistent font and spacing', details: 'Serial number appears genuine at first glance. Prefix "7B" is legitimate. Font spacing is slightly off — 0.3mm variation detected.' },
      { id: 'watermark', label: 'Watermark', passed: false, description: 'Mahatma Gandhi portrait watermark and electrotype denomination', details: '⚠ FRAUD: Watermark is printed using light ink rather than being embedded in the paper. Uniform opacity instead of multi-tone. Electrotype "500" is indistinct.' },
      { id: 'uv', label: 'UV Feature', passed: false, description: 'UV-reactive elements including number panel and security thread', details: '⚠ FRAUD: Paper fluoresces bright blue under UV (indicates optical brighteners in normal paper). Number panel does not fluoresce green. Security thread shows no UV reaction.' },
      { id: 'latent', label: 'Latent Image', passed: false, description: 'Hidden denomination value visible when note is tilted at 45°', details: '⚠ FRAUD: Latent image is absent. No denomination appears at any viewing angle. Printing method cannot reproduce latent image effect.' },
    ],
  },
  {
    id: 'fake-2000',
    label: 'Counterfeit ₹2000 (High Quality)',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=500&fit=crop',
    results: [
      { id: 'thread', label: 'Security Thread', passed: false, description: 'Windowed security thread with RBI text visible when held against light', details: '⚠ FRAUD: Advanced color-shift ink used but thread is printed on surface. No windowing effect. Thread discontinues at note edges — not woven through.' },
      { id: 'microprint', label: 'Microprint Lettering', passed: false, description: 'Microprinted "RBI" and "₹2000" text under magnification', details: '⚠ FRAUD: Microprint is partially legible but character edges are fuzzy. Resolution is approximately 600dpi — better than most fakes but still below RBI\'s 1200dpi standard.' },
      { id: 'serial', label: 'Serial Number', passed: false, description: 'Unique serial number with consistent font and spacing', details: '⚠ FRAUD: Serial number prefix "9A" does not exist in RBI\'s published prefix register for ₹2000 notes. Font is bold compared to genuine specimens.' },
      { id: 'watermark', label: 'Watermark', passed: false, description: 'Mahatma Gandhi portrait watermark and electrotype denomination', details: '⚠ FRAUD: Watermark is simulated with a density gradient but lacks the multi-tone depth of genuine notes. Edges are too sharp — genuine watermarks have soft transitions.' },
      { id: 'uv', label: 'UV Feature', passed: false, description: 'UV-reactive elements including number panel and security thread', details: '⚠ FRAUD: Paper has mild fluorescence. Number panel partially glows but color is off (teal vs genuine green). Security thread shows no phosphorescent afterglow.' },
      { id: 'latent', label: 'Latent Image', passed: false, description: 'Hidden denomination value visible when note is tilted at 45°', details: '⚠ FRAUD: Faint latent image visible but incorrect font — uses sans-serif instead of RBI\'s custom serif font for latent text.' },
    ],
  },
]

export function CounterfeitScanner() {
  const [selectedDemo, setSelectedDemo] = useState(demoNotes[0])
  const [scanning, setScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [results, setResults] = useState<DetectionCheck[]>([])
  const [activeCheck, setActiveCheck] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [showDemoModal, setShowDemoModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploadedFileName(file.name)
    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string)
      setScanComplete(false)
      setResults([])
    }
    reader.readAsDataURL(file)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
    if (e.target) e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      })
      streamRef.current = stream
      setCameraActive(true)
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream
      }, 100)
    } catch {
      alert('Camera access denied. Please allow camera permissions or upload an image instead.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setUploadedImage(dataUrl)
    setUploadedFileName('Camera capture')
    stopCamera()
    setScanComplete(false)
    setResults([])
  }, [stopCamera])

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const handleScan = () => {
    if (scanning) return
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setScanning(true)
    setScanComplete(false)
    setActiveCheck(null)

    const checks = selectedDemo.results.map((r) => ({ ...r, passed: null }))
    setResults(checks)

    let i = 0
    intervalRef.current = setInterval(() => {
      if (i < selectedDemo.results.length) {
        setActiveCheck(selectedDemo.results[i].id)
        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i ? { ...r, passed: selectedDemo.results[i].passed } : r
          )
        )
        i++
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = null
        setScanning(false)
        setScanComplete(true)
        setActiveCheck(null)
      }
    }, 600)
  }

  const handleDemoSelect = (demo: typeof demoNotes[0]) => {
    if (cameraActive) stopCamera()
    setSelectedDemo(demo)
    setUploadedImage(null)
    setUploadedFileName(null)
    setScanComplete(false)
    setResults([])
    setActiveCheck(null)
  }

  const passedCount = results.filter((r) => r.passed === true).length
  const failedCount = results.filter((r) => r.passed === false).length
  const isAuthentic = passedCount >= 4 && failedCount === 0

  return (
    <div className="min-h-screen bg-et-bg">
      <TopNav />
      <div className="mx-auto max-w-[1280px] px-4 md:px-8 py-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="w-6 h-6 text-et-red" />
          <div>
            <h1 className="font-serif font-bold text-3xl text-et-text">Counterfeit Currency Scanner</h1>
            <p className="text-sm text-et-secondary mt-1">AI-powered analysis of currency notes — detects fake notes through 6 security feature checks</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-4 mb-6 text-xs text-et-secondary border-b border-et-divider pb-4">
          <span>Detected today: <span className="font-bold text-et-red">23</span></span>
          <span className="text-et-divider">|</span>
          <span>Accuracy rate: <span className="font-bold text-risk-low">99.2%</span></span>
          <span className="text-et-divider">|</span>
          <span>Supported: ₹10 – ₹2000</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Main Scan Area */}
          <div>
            {/* Image Drop Zone / Preview Card */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 rounded-sm overflow-hidden transition-all ${
                dragOver
                  ? 'border-et-red bg-et-red/5'
                  : cameraActive
                    ? 'border-et-divider bg-black'
                    : uploadedImage
                      ? 'border-et-divider bg-et-surface'
                      : 'border-dashed border-et-divider hover:border-et-text bg-et-surface'
              }`}
            >
              {/* Camera view */}
              {cameraActive ? (
                <div className="relative aspect-[2/1]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3">
                    <button
                      onClick={capturePhoto}
                      className="inline-flex items-center gap-2 bg-white text-et-text px-5 py-2.5 text-sm font-medium rounded-sm shadow-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      Capture Photo
                    </button>
                    <button
                      onClick={stopCamera}
                      className="inline-flex items-center gap-2 bg-white/80 text-et-text px-4 py-2.5 text-sm font-medium rounded-sm shadow-lg hover:bg-white transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : uploadedImage ? (
                <>
                  <div className="relative aspect-[2/1] bg-gray-100">
                    <img
                      src={uploadedImage}
                      alt="Uploaded note"
                      className="w-full h-full object-contain"
                    />
                    {/* Change / Remove overlay */}
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/90 hover:bg-white text-xs font-medium px-2.5 py-1.5 rounded-sm shadow-sm border border-et-divider transition-colors cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        onClick={() => { setUploadedImage(null); setUploadedFileName(null); setScanComplete(false); setResults([]) }}
                        className="bg-white/90 hover:bg-white text-xs font-medium px-2.5 py-1.5 rounded-sm shadow-sm border border-et-divider transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* Scanning overlay */}
                    {scanning && (
                      <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                        <div className="bg-white/90 px-6 py-3 rounded-sm shadow-sm flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-et-red border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm font-medium text-et-text">Running AI detection...</span>
                        </div>
                      </div>
                    )}
                    {/* Scan complete overlay */}
                    {scanComplete && (
                      <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-sm text-sm font-medium flex items-center gap-2 ${
                        isAuthentic ? 'bg-risk-low/10 text-risk-low' : 'bg-risk-high/10 text-risk-high'
                      }`}>
                        {isAuthentic ? (
                          <><CheckCircle className="w-4 h-4" /> Genuine Note</>
                        ) : (
                          <><XCircle className="w-4 h-4" /> Counterfeit Detected</>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-et-divider flex items-center justify-between">
                    <span className="text-xs text-et-secondary truncate">{uploadedFileName}</span>
                    <span className="text-[10px] text-et-secondary">{uploadedImage ? `${Math.round((uploadedImage.length * 3) / 4 / 1024)} KB` : ''}</span>
                  </div>
                </>
              ) : (
                /* Empty drop zone */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center py-16 px-6 cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full bg-et-red/5 flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-et-red" />
                  </div>
                  <p className="text-sm font-medium text-et-text mb-1">Drag & drop a note image here</p>
                  <p className="text-xs text-et-secondary mb-4">or click to browse files</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                      className="inline-flex items-center gap-1.5 border border-et-red text-et-red px-4 py-2 text-xs font-medium rounded-sm hover:bg-et-red/5 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Browse Files
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); startCamera() }}
                      className="inline-flex items-center gap-1.5 border border-et-divider text-et-text px-4 py-2 text-xs font-medium rounded-sm hover:border-et-text transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Use Camera
                    </button>
                  </div>
                  <p className="text-[10px] text-et-secondary mt-4">Supports JPEG, PNG, WEBP — up to 10 MB</p>
                </div>
              )}

              {/* Hidden inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Scan Button */}
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <button
                onClick={handleScan}
                disabled={scanning}
                className="inline-flex items-center gap-2 bg-et-red hover:bg-et-red-hover disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 text-sm font-medium rounded-sm transition-colors cursor-pointer"
              >
                <Scan className="w-4 h-4" />
                {scanning ? 'Scanning...' : scanComplete ? 'Rescan Note' : 'Run AI Analysis'}
              </button>
              {uploadedImage && !scanning && (
                <span className="text-[10px] text-et-secondary">
                  {scanComplete ? 'Click Rescan to re-analyze' : 'Click to analyze this note'}
                </span>
              )}
              {scanComplete && (
                <span className={`text-sm font-medium flex items-center gap-1.5 ${
                  isAuthentic ? 'text-risk-low' : 'text-risk-high'
                }`}>
                  {isAuthentic ? (
                    <><CheckCircle className="w-4 h-4" /> All security features verified</>
                  ) : (
                    <><XCircle className="w-4 h-4" /> {failedCount} security checks failed</>
                  )}
                </span>
              )}
            </div>

            {/* Progress bar during scan */}
            {scanning && (
              <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-et-red rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            )}
          </div>

          {/* Detection Results */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">
              Detection Checks {scanComplete && `(${passedCount}/${results.length} pass)`}
            </h3>

            {!scanComplete && results.length === 0 && (
              <div className="border border-et-divider bg-et-surface rounded-sm p-6 text-center">
                <Scan className="w-8 h-8 text-et-divider mx-auto mb-2" />
                <p className="text-sm text-et-secondary">Select a sample note and click "Run AI Analysis" to begin detection.</p>
              </div>
            )}

            {results.map((check) => (
              <div
                key={check.id}
                className={`border rounded-sm bg-et-surface transition-all duration-300 ${
                  activeCheck === check.id ? 'border-et-red ring-1 ring-et-red/30' : 'border-et-divider'
                } ${check.passed === null ? 'opacity-40' : 'opacity-100'}`}
              >
                <div className="flex items-start gap-3 p-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    check.passed === true ? 'bg-risk-low/10' :
                    check.passed === false ? 'bg-risk-high/10' :
                    'bg-gray-100'
                  }`}>
                    {check.passed === true ? (
                      <CheckCircle className="w-3.5 h-3.5 text-risk-low" />
                    ) : check.passed === false ? (
                      <XCircle className="w-3.5 h-3.5 text-risk-high" />
                    ) : activeCheck === check.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-et-red border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-et-text">{check.label}</p>
                      {check.passed !== null && (
                        <Badge variant={check.passed ? 'safe' : 'risk'} className="text-[8px] px-1 py-0 h-3.5">
                          {check.passed ? 'Pass' : 'Fail'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] text-et-secondary mt-0.5">{check.description}</p>
                    {check.passed !== null && (
                      <div className={`mt-1.5 text-[10px] leading-relaxed p-2 rounded-sm ${
                        check.passed ? 'bg-risk-low/5 text-risk-low' : 'bg-risk-high/5 text-risk-high'
                      }`}>
                        {check.details}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Guide Section */}
        <div className="mt-12 border border-et-divider bg-et-surface rounded-sm">
          <div className="px-6 py-4 border-b border-et-divider">
            <h3 className="text-xs font-bold text-et-text uppercase tracking-widest">Security Feature Guide</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {[
              { title: 'Security Thread', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/New_500_rupee_note.jpg/800px-New_500_rupee_note.jpg', desc: 'Windowed thread with RBI text. Color shifts from green to blue when tilted. Genuine thread is woven through the paper, not printed on top.' },
              { title: 'Microprint', img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/New_500_rupee_note.jpg/800px-New_500_rupee_note.jpg', desc: 'Microprinted "RBI" and denomination on Gandhi\'s collar and leaf patterns. Requires 10x magnification to read clearly.' },
              { title: 'UV Fluorescence', img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop', desc: 'Number panel fluoresces green under UV. Security thread appears yellow. Genuine paper does not glow (no optical brighteners).' },
            ].map((feature) => (
              <div key={feature.title} className="space-y-2">
                <div className="aspect-video bg-gray-100 rounded-sm overflow-hidden">
                  <img src={feature.img} alt={feature.title} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-sm font-semibold text-et-text">{feature.title}</h4>
                <p className="text-xs text-et-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
