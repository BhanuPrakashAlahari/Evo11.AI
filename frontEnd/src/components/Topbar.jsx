import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  ChevronDown
} from 'lucide-react'

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

        {/* Global Search Interface */}
        <div className="hidden md:flex items-center relative w-72 lg:w-96">
          <Search className="absolute left-3 h-4 w-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search dashboard or logs..."
            className="w-full rounded-lg bg-saas-bg/60 border border-saas-border py-1.5 pl-10 pr-12 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-linear-purple/80 focus:ring-1 focus:ring-linear-purple/80 transition-all font-sans"
          />
          <kbd className="absolute right-3 hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-saas-border bg-saas-card px-1.5 font-mono text-[10px] font-medium text-zinc-500">
            <span>⌘</span>K
          </kbd>
        </div>
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

        {/* Notification Button */}
        <button 
          className="relative rounded-lg p-2 text-zinc-500 hover:bg-saas-surface-raised hover:text-white transition-colors focus:outline-none cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {/* Notification Glow Dot */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-linear-purple border border-saas-bg animate-pulse" />
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-saas-border" />

        {/* Quick Settings/Profile Dropdown */}
        <button 
          className="flex items-center gap-2 group rounded-lg p-1.5 hover:bg-saas-surface-raised transition-colors focus:outline-none cursor-pointer"
        >
          <div className="h-8 w-8 rounded-lg bg-linear-purple/10 border border-linear-purple/20 flex items-center justify-center text-linear-purple group-hover:bg-linear-purple group-hover:text-white transition-colors">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline-block text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
            Account
          </span>
          <ChevronDown className="hidden sm:inline-block h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
        </button>
      </div>
    </header>
  )
}
