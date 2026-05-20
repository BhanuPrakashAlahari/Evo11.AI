import { useState } from 'react'
import { 
  Plus, 
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import {
  WeatherWidget,
  GitHubWidget,
  CryptoWidget,
  NewsWidget,
  TasksWidget,
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
        {/* Column Span 2 on Desktop to make GitHub visualizer outstanding */}
        <GitHubWidget isLoading={isLoading} />
        
        <WeatherWidget isLoading={isLoading} />
        
        <CryptoWidget isLoading={isLoading} />
        
        <TasksWidget isLoading={isLoading} />
        
        <MetricsWidget isLoading={isLoading} />
        
        <NewsWidget isLoading={isLoading} />
      </div>

      {/* 3. Deep Telemetry Engine Section (Aesthetics Placeholder) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Large Analytics / Charts Container */}
        <div className="lg:col-span-2 saas-card flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Analytical Engine</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Primary pipeline aggregation and status logging.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-linear-purple shadow-[0_0_10px_var(--color-linear-purple)] animate-pulse" />
                <span className="text-xs font-semibold text-zinc-400">Telemetry Live</span>
              </div>
            </div>
            
            {/* Clean empty canvas for widgets/charts */}
            <div className="mt-6 flex-1 border border-dashed border-saas-border rounded-lg flex flex-col items-center justify-center p-8 min-h-[200px] bg-saas-bg/40">
              <div className="rounded-full bg-zinc-950 border border-saas-border p-3 text-zinc-500">
                <TrendingUp className="h-6 w-6 text-linear-purple" />
              </div>
              <p className="mt-3 text-sm font-semibold text-zinc-300">Chart Visualization Shell</p>
              <p className="text-xs text-zinc-500 mt-1 text-center max-w-sm">
                Clean canvas structured. Drag widgets or register analytic nodes to start processing visual rendering.
              </p>
            </div>
          </div>
        </div>

        {/* Side Panel: Active Log / Service Feed */}
        <div className="saas-card flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between pb-4 border-b border-saas-border">
            <div>
              <h3 className="font-bold text-base text-white">Console Output</h3>
              <p className="text-xs text-zinc-500 mt-0.5">System status and daemon logs.</p>
            </div>
            <button className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Activity Logs */}
          <div className="flex-1 mt-4 space-y-4 overflow-y-auto pr-1">
            {[
              { id: '1', title: 'Route gateway initialized', sub: 'Status: 200 OK', time: '2m ago' },
              { id: '2', title: 'Database connection stabilized', sub: 'Pool Size: 15 active', time: '14m ago' },
              { id: '3', title: 'Deploy job #492 finished', sub: 'Build finished in 218ms', time: '1h ago' }
            ].map((item) => (
              <div key={item.id} className="group/item flex gap-3 text-xs border-b border-saas-border/40 pb-3 last:border-0 last:pb-0">
                <div className="h-2 w-2 rounded-full bg-linear-purple/60 group-hover/item:bg-linear-purple mt-1.5 shrink-0 transition-colors" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-300 group-hover/item:text-white transition-colors">{item.title}</span>
                    <span className="text-[10px] text-zinc-600 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-mono">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-dashed border-saas-border mt-auto">
            <button className="w-full btn-saas-secondary py-1.5 text-xs text-center flex items-center justify-center gap-1.5 cursor-pointer">
              <span>View Logs Interface</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-zinc-500" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Footer Status Panel */}
      <div className="rounded-xl bg-gradient-to-r from-saas-card via-saas-card to-linear-glow/20 border border-saas-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-linear-purple/10 border border-linear-purple/20 flex items-center justify-center text-linear-purple">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Multi-Service Architecture Active</h4>
            <p className="text-xs text-zinc-400 mt-0.5 font-normal">
              Modular directory layouts configured (utils, services, components, pages) successfully isolated.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto text-xs text-zinc-400">
          <span className="font-semibold text-zinc-400">Client Engine Version</span>
          <span className="bg-zinc-950 border border-saas-border text-zinc-300 px-2.5 py-0.5 rounded font-mono">v1.1.0-alpha</span>
        </div>
      </div>
    </div>
  )
}
