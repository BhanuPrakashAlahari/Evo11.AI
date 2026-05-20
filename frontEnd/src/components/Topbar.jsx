import { Menu } from 'lucide-react'

export default function Topbar({ 
  openMobile
}) {
  return (
    <header className="fixed top-0 right-0 left-0 z-30 flex h-16 items-center justify-between border-b border-saas-border bg-saas-bg/80 backdrop-blur-md px-6 transition-all duration-300">
      {/* Left side actions */}
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger toggle */}
        <button
          onClick={openMobile}
          className="flex items-center justify-center rounded-lg p-2 text-zinc-500 hover:bg-saas-surface-raised hover:text-white lg:hidden transition-colors focus:outline-none focus:ring-1 focus:ring-linear-purple cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-4">
        {/* Quick System Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          Telemetry Online
        </div>
      </div>
    </header>
  )
}
