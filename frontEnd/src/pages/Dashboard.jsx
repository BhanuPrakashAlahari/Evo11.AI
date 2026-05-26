import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import {
  WeatherWidget,
  CryptoWidget,
  MetricsWidget
} from '../widgets/placeholder'

export default function Dashboard() {
  // A local load simulator toggle to easily demonstrate premium skeleton transitions
  const [isLoading, setIsLoading] = useState(false)

  const triggerSimulateLoad = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-saas-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient-saas">
            System Console
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time operations, analytical insights, and service monitoring dashboard.
          </p>
        </div>

        {/* Universal Actions Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Skeleton Load simulator toggle */}
          <button
            onClick={triggerSimulateLoad}
            className="btn-saas-secondary text-xs sm:text-sm py-2.5 px-5 text-linear-purple border-linear-purple/30 bg-linear-purple/5 hover:bg-linear-purple/10 flex items-center gap-2 cursor-pointer rounded-xl font-bold shadow-md"
          >
            <Sparkles className={`h-4.5 w-4.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Overview</span>
          </button>
        </div>
      </div>

      {/* 2. Responsive CSS Grid Layout for Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeatherWidget isLoading={isLoading} />
        <CryptoWidget isLoading={isLoading} />
      </div>

      {/* 3. Full-Width System Performance & Historical Telemetry */}
      <div className="w-full pt-2">
        <MetricsWidget isLoading={isLoading} />
      </div>
    </div>
  )
}
