import { Outlet } from 'react-router-dom'
import { TopNav } from './top-nav'

export function PageLayout() {
  return (
    <div className="min-h-screen bg-et-bg">
      <TopNav />
      <main className="mx-auto max-w-[1280px] px-8 md:px-16 py-10">
        <Outlet />
      </main>
    </div>
  )
}
