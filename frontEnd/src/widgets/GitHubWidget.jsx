import { useState, useEffect } from 'react'
import { GitBranch, GitCommit, Star, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react'
import { services } from '../services/api'

// Helper function to format ISO dates into premium relative durations (e.g. "12m ago", "3d ago")
const getRelativeTime = (isoString) => {
  if (!isoString) return 'N/A'
  try {
    const parsed = new Date(isoString)
    const diffMs = Date.now() - parsed.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  } catch {
    return 'recently'
  }
}

export default function GitHubWidget({ isLoading: isParentLoading }) {
  const [gitData, setGitData] = useState(null)
  const [isLocalLoading, setIsLocalLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Asynchronous API query trigger
  const fetchGitTelemetry = async (showIndicator = false) => {
    if (showIndicator) setIsFetching(true)
    try {
      const data = await services.getGithub()
      if (data.success) {
        setGitData(data)
        setHasError(false)
      } else {
        setHasError(true)
      }
    } catch (err) {
      console.warn('GitHub Widget - Fetch telemetry failed:', err)
      setHasError(true)
    } finally {
      setIsLocalLoading(false)
      setIsFetching(false)
    }
  }

  // Load telemetry on mount and check again every 60 seconds
  useEffect(() => {
    let isActive = true

    const runInitialFetch = async () => {
      if (isActive) {
        setIsLocalLoading(true)
        await fetchGitTelemetry()
      }
    }

    runInitialFetch()

    const interval = setInterval(() => {
      if (isActive) fetchGitTelemetry(true)
    }, 60000)

    return () => {
      isActive = false
      clearInterval(interval)
    }
  }, [])

  const showSkeleton = isParentLoading || isLocalLoading

  if (showSkeleton) {
    return (
      <div className="saas-card flex flex-col justify-between h-[230px] animate-pulse lg:col-span-2">
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-saas-border/40">
            <div className="h-4 w-36 bg-zinc-800 rounded" />
            <div className="h-4 w-12 bg-zinc-800 rounded" />
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="h-8 bg-zinc-800 rounded" />
              <div className="h-8 bg-zinc-800 rounded" />
              <div className="h-8 bg-zinc-800 rounded" />
            </div>
            <div className="space-y-3">
              <div className="h-10 bg-zinc-800 rounded" />
              <div className="h-10 bg-zinc-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="saas-card flex flex-col justify-between h-[230px] lg:col-span-2 border-red-500/20 bg-red-950/5">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
            <AlertCircle className="h-4 w-4" />
            <span>GitHub Sync Error</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Failed to contact telemetry API. Verify server port active parameters or rate thresholds.
          </p>
        </div>
        <button 
          onClick={() => fetchGitTelemetry()}
          className="w-full btn-saas-secondary py-2 flex items-center justify-center gap-2 hover:bg-zinc-900 border-red-500/10 cursor-pointer text-xs"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Force Resync</span>
        </button>
      </div>
    )
  }

  const { repos = [], commits = [], username, isMock } = gitData || {}

  return (
    <div className="saas-card-interactive flex flex-col justify-between h-[230px] lg:col-span-2 group/git">
      {/* Accent subtle glow */}
      <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-emerald-500/5 group-hover/git:bg-emerald-500/10 blur-xl transition-all" />

      <div>
        {/* Header telemetry description */}
        <div className="flex justify-between items-center pb-2.5 border-b border-saas-border/40">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <GitBranch className="h-3.5 w-3.5 text-zinc-400" />
            GitHub Workspace
          </span>
          <div className="flex items-center gap-2">
            {isFetching && <RefreshCw className="h-3 w-3 text-zinc-500 animate-spin" />}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-950 border border-saas-border text-zinc-400 font-mono">
              {username} • {isMock ? 'Demo Mode' : 'Live'}
            </span>
          </div>
        </div>

        {/* Double-column grid system */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-3.5">
          
          {/* LEFT: Clickable Repositories List */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 flex justify-between">
              <span>Active Projects</span>
              <span className="text-[9px] lowercase font-normal italic">click to visit</span>
            </h4>
            
            <div className="space-y-2 max-h-[110px] overflow-y-auto pr-1 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {repos.map((repo) => (
                <a
                  key={repo.name}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-saas-border/40 hover:border-emerald-500/30 hover:bg-saas-surface-raised transition-all duration-300 group/repo-item cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-[11px] font-bold text-zinc-200 group-hover/repo-item:text-white truncate flex items-center gap-1">
                      <span>{repo.name}</span>
                      <ExternalLink className="h-2.5 w-2.5 text-zinc-600 opacity-0 group-hover/repo-item:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-[9px] text-zinc-500 flex items-center gap-2 mt-0.5">
                      <span className="font-semibold text-zinc-400">{repo.language}</span>
                      <span>•</span>
                      <span>{getRelativeTime(repo.updatedAt)}</span>
                    </div>
                  </div>
                  
                  {/* Stars Indicator */}
                  <div className="flex items-center gap-0.5 text-[10px] text-zinc-400 font-mono font-bold shrink-0">
                    <Star className="h-3 w-3 text-amber-500" />
                    <span>{repo.stars}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* RIGHT: Recent Activities Log */}
          <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-saas-border/40 pt-4 sm:pt-0 sm:pl-5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
              Recent Push Events
            </h4>
            
            <div className="space-y-2.5 max-h-[110px] overflow-y-auto pr-1 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {commits.length === 0 ? (
                <div className="text-zinc-500 text-[10px] italic">No recent push events logged.</div>
              ) : (
                commits.slice(0, 10).map((commit, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[10px]">
                      <span className="font-bold text-zinc-400 truncate max-w-[90px]">{commit.repo}</span>
                      <span className="text-[9px] text-zinc-600 shrink-0 font-mono">{getRelativeTime(commit.time)}</span>
                    </div>
                    <p className="text-[10.5px] font-medium text-zinc-300 flex items-start gap-1 line-clamp-2 leading-relaxed">
                      <GitCommit className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{commit.message}</span>
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer bar */}
      <div className="pt-2 border-t border-saas-border/20 text-right flex items-center justify-between text-[9px] text-zinc-500">
        <span>Public APIs queried safely</span>
        <span className="text-emerald-500 font-medium">Telemetry Connected</span>
      </div>
    </div>
  )
}
