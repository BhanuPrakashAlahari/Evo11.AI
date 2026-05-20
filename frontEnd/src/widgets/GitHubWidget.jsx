import { GitBranch, GitCommit, ExternalLink } from 'lucide-react'
import { cn } from '../utils/cn'

export default function GitHubWidget({ isLoading }) {
  if (isLoading) {
    return (
      <div className="saas-card flex flex-col justify-between h-[230px] animate-pulse lg:col-span-2">
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-saas-border/40">
            <div className="h-4 w-36 bg-zinc-800 rounded" />
            <div className="h-4 w-12 bg-zinc-800 rounded" />
          </div>
          <div className="mt-5 flex gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-5/6 bg-zinc-800 rounded" />
              <div className="h-3 w-2/3 bg-zinc-800 rounded" />
            </div>
            <div className="h-10 w-24 bg-zinc-800 rounded" />
          </div>
        </div>
        <div className="h-12 bg-zinc-800 rounded mt-4" />
      </div>
    )
  }

  // Generate mock contribution grid cells
  const gridCells = Array.from({ length: 48 }, (_, i) => {
    // Generate different contribution levels for a visually authentic look
    const levels = [
      'bg-zinc-900 border-saas-border', 
      'bg-emerald-950 border-emerald-900/40', 
      'bg-emerald-800 border-emerald-700/40', 
      'bg-emerald-600 border-emerald-500/40', 
      'bg-emerald-500 border-emerald-400/40'
    ]
    const weight = [0, 0, 0, 1, 1, 1, 2, 2, 3, 4]
    const randomLevel = weight[Math.floor((i + 3) * 7) % weight.length]
    return levels[randomLevel]
  })

  return (
    <div className="saas-card-interactive flex flex-col justify-between h-[230px] lg:col-span-2 group/git">
      {/* Accent glow */}
      <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-emerald-500/5 group-hover/git:bg-emerald-500/10 blur-xl transition-all" />

      <div>
        <div className="flex justify-between items-center pb-3 border-b border-saas-border/40">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <GitBranch className="h-3.5 w-3.5 text-zinc-400" />
            GitHub Repository
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-950 border border-saas-border text-zinc-400 font-mono">
            evo11-core
          </span>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white flex items-center gap-1.5">
              <GitCommit className="h-4 w-4 text-emerald-500" />
              <span>refactor(api): modularize routes</span>
            </div>
            <p className="text-xs text-zinc-500">
              Committed by <span className="text-zinc-300">BhanuPrakash</span> • 3 hours ago
            </p>
          </div>
          <a 
            href="#github" 
            className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-400 hover:text-white bg-zinc-950 border border-saas-border rounded-lg px-2.5 py-1 transition-colors"
          >
            <span>Repository</span>
            <ExternalLink className="h-3 w-3 text-zinc-500" />
          </a>
        </div>
      </div>

      {/* Contribution Grid */}
      <div className="pt-4 border-t border-saas-border/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-zinc-500">84 commits in the last 6 weeks</span>
          <div className="flex items-center gap-1 text-[9px] text-zinc-600">
            <span>Less</span>
            <div className="h-2 w-2 rounded bg-zinc-900 border border-saas-border" />
            <div className="h-2 w-2 rounded bg-emerald-950 border border-emerald-900/40" />
            <div className="h-2 w-2 rounded bg-emerald-800" />
            <div className="h-2 w-2 rounded bg-emerald-500" />
            <span>More</span>
          </div>
        </div>
        
        {/* Actual grid visualizer */}
        <div className="grid grid-flow-col grid-rows-4 gap-1 auto-cols-max">
          {gridCells.map((style, idx) => (
            <div 
              key={idx} 
              className={cn("h-[10px] w-[10px] rounded-[2px] border transition-all duration-300 hover:scale-125 hover:z-10", style)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
