import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
const navItems = [
  { label: "Today's Brief", path: '/' },
  { label: 'Threat Map', path: '/threat-map' },
  { label: 'Scam Detector', path: '/scam-analyzer' },
  { label: 'Counterfeit', path: '/counterfeit-scanner' },
  { label: 'Networks', path: '/fraud-network' },
  { label: 'Shield', path: '/citizen-shield' },
]

export function TopNav() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-et-surface border-b border-et-divider">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-1">
              <span className="font-serif font-bold text-xl tracking-tight">
                <span className="text-et-text">TRUST</span>
                <span className="text-et-red">NOW</span>
              </span>
            </Link>
            <span className="hidden md:inline text-[10px] text-et-secondary">National Digital Public Safety Intelligence Platform</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'text-sm transition-colors duration-150 py-1 border-b-2',
                  (location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path)))
                    ? 'text-et-text font-medium border-et-red'
                    : 'text-et-text border-transparent hover:border-et-divider'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-et-text cursor-pointer"
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {menuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-et-divider bg-et-surface">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'block px-3 py-2 text-sm rounded-sm transition-colors duration-150',
                  location.pathname === item.path
                    ? 'text-et-red font-medium bg-et-red/5'
                    : 'text-et-secondary hover:text-et-text'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
