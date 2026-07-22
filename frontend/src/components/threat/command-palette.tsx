import { useEffect, useMemo, useState } from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { Search, ShieldAlert, ScanLine, Network, Sparkles, Map } from 'lucide-react'

type CommandItem = {
  id: string
  label: string
  shortcut: string
  icon: typeof Search
  href: string
}

const items: CommandItem[] = [
  { id: 'brief', label: 'Open Today’s Brief', shortcut: 'G B', icon: Sparkles, href: '/' },
  { id: 'map', label: 'Open Threat Map', shortcut: 'G M', icon: Map, href: '/threat-map' },
  { id: 'scam', label: 'Open Scam Analyzer', shortcut: 'G S', icon: ShieldAlert, href: '/scam-analyzer' },
  { id: 'counterfeit', label: 'Open Counterfeit Scanner', shortcut: 'G C', icon: ScanLine, href: '/counterfeit-scanner' },
  { id: 'network', label: 'Open Fraud Network', shortcut: 'G N', icon: Network, href: '/fraud-network' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const filteredItems = useMemo(() => {
    const normalized = query.toLowerCase()
    if (!normalized) return items
    return items.filter((item) => item.label.toLowerCase().includes(normalized))
  }, [query])

  const onSelect = (href: string) => {
    navigate(href)
    setOpen(false)
    setQuery('')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 rounded-sm border border-et-divider bg-et-bg px-3 py-2 text-[11px] text-et-secondary transition-colors hover:border-et-red hover:text-et-text"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Quick actions</span>
        <span className="ml-2 rounded-sm border border-et-divider bg-white px-1.5 py-0.5 text-[10px]">⌘K</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/20 px-4 pt-20">
          <div className="w-full max-w-xl rounded-sm border border-et-divider bg-white shadow-xl">
            <Command value={query} onValueChange={(value) => setQuery(value)} loop>
              <div className="flex items-center gap-2 border-b border-et-divider px-3 py-3">
                <Search className="h-4 w-4 text-et-secondary" />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Search modules..."
                  className="w-full border-0 bg-transparent text-sm outline-none"
                />
              </div>
              <Command.List className="max-h-72 overflow-auto">
                <Command.Empty className="px-4 py-6 text-sm text-et-secondary">No modules found.</Command.Empty>
                {filteredItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Command.Item
                      key={item.id}
                      value={item.label}
                      onSelect={() => onSelect(item.href)}
                      className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm text-et-text hover:bg-et-bg"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-et-red" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-et-secondary">{item.shortcut}</span>
                    </Command.Item>
                  )
                })}
              </Command.List>
            </Command>
          </div>
        </div>
      )}
    </>
  )
}
