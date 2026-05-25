import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Layers,
  CheckSquare,
  Newspaper,
  GitBranch
} from 'lucide-react'
import { cn } from '../utils/cn'

const navigationItems = [
  { name: 'Overview', icon: LayoutDashboard, to: '/' },
  { name: 'Tasks',    icon: CheckSquare,     to: '/tasks' },
  { name: 'Tech News',icon: Newspaper,       to: '/technews' },
  { name: 'GitHub',   icon: GitBranch,       to: '/gitHub' },
]

export default function Sidebar({ 
  isCollapsed, 
  toggleCollapsed, 
  isMobileOpen, 
  closeMobile
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-saas-card border-r border-saas-border text-zinc-400 transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:w-20" : "lg:w-64",
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-saas-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-purple text-white shadow-md shadow-linear-purple/30">
              <Layers className="h-5 w-5" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <span className="font-extrabold text-sm tracking-wider uppercase text-white whitespace-nowrap">
                EVO<span className="text-linear-purple">11</span>
              </span>
            )}
          </div>
          <button 
            onClick={closeMobile} 
            className="flex lg:hidden rounded-lg p-1.5 text-zinc-500 hover:bg-saas-surface-raised hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.to === '/'}
                onClick={closeMobile}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 w-full",
                    isActive
                      ? "bg-linear-purple/10 text-linear-purple border-l-2 border-linear-purple pl-2.5"
                      : "hover:bg-saas-surface-raised hover:text-zinc-200 text-zinc-400"
                  )
                }
                title={isCollapsed ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                      isActive ? "text-linear-purple" : "text-zinc-500 group-hover:text-zinc-200"
                    )} />
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate">{item.name}</span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-saas-border bg-saas-card/50 flex flex-col items-center">
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex w-full items-center justify-center rounded-lg py-2 text-zinc-500 hover:bg-saas-surface-raised hover:text-zinc-200 transition-all duration-200 cursor-pointer"
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
