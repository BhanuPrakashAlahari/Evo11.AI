import { useState } from 'react'
import { 
  Plus, 
  Calendar,
  Sparkles
} from 'lucide-react'
import {
  WeatherWidget,
  GitHubWidget,
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
            className="btn-saas-secondary text-linear-purple border-linear-purple/30 bg-linear-purple/5 hover:bg-linear-purple/10 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Simulate Loading</span>
          </button>

          <button className="btn-saas-secondary">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last 24 Hours</span>
          </button>
          
          <button className="btn-saas-primary">
            <Plus className="h-3.5 w-3.5" />
            <span>Deploy Service</span>
          </button>
        </div>
      </div>

      {/* 2. Responsive CSS Grid Layout for Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GitHubWidget isLoading={isLoading} />
        <WeatherWidget isLoading={isLoading} />
        <CryptoWidget isLoading={isLoading} />
        <MetricsWidget isLoading={isLoading} />
      </div>
    </div>
  )
}
