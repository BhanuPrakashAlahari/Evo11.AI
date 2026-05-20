import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import { useSidebar } from '../hooks/useSidebar'
import { cn } from '../utils/cn'

export default function DashboardLayout({ children }) {
  const {
    isMobileOpen,
    isCollapsed,
    closeMobile,
    openMobile,
    toggleCollapsed
  } = useSidebar()

  return (
    <div className="min-h-screen bg-saas-bg text-zinc-100 antialiased flex">
      <Sidebar 
        isCollapsed={isCollapsed}
        toggleCollapsed={toggleCollapsed}
        isMobileOpen={isMobileOpen}
        closeMobile={closeMobile}
      />

      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <div 
          className={cn(
            "fixed top-0 right-0 z-35 transition-all duration-300 ease-in-out",
            isCollapsed ? "left-0 lg:left-20" : "left-0 lg:left-64"
          )}
        >
          <Topbar openMobile={openMobile} />
        </div>

        <main className="flex-1 pt-16 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
