import { useState, useEffect, useMemo } from 'react'
import { 
  GitCommit, 
  Star, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  Search, 
  BookOpen, 
  Code,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  GitBranch,
  X
} from 'lucide-react'
import { services } from '../services/api'

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

export default function GitHubConsole() {
  const [gitData, setGitData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('All')
  const [sortBy, setSortBy] = useState('stars') // 'stars' | 'updated' | 'name'

  const [token, setToken] = useState(() => localStorage.getItem('github_oauth_token'))
  const [username, setUsername] = useState(() => localStorage.getItem('github_oauth_username'))
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState(null)

  // Handle OAuth code exchange callback on mount
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      const exchangeCode = async () => {
        setIsAuthenticating(true)
        setIsLoading(true)
        try {
          const res = await services.exchangeGithubCode(code)
          if (res.success && res.access_token) {
            localStorage.setItem('github_oauth_token', res.access_token)
            localStorage.setItem('github_oauth_username', res.username)
            setToken(res.access_token)
            setUsername(res.username)
            setAuthError(null)
            // Strip the code parameter from the browser address bar
            window.history.replaceState({}, document.title, window.location.pathname)
          } else {
            setAuthError(res.error || 'Failed to exchange authentication token')
          }
        } catch (err) {
          setAuthError(err.message || 'Server connection failed during OAuth exchange')
        } finally {
          setIsAuthenticating(false)
          setIsLoading(false)
        }
      }
      exchangeCode()
    }
  }, [])

  const fetchGitTelemetry = async (showIndicator = false) => {
    if (!token) {
      setIsLoading(false)
      return
    }
    if (showIndicator) setIsFetching(true)
    try {
      const data = await services.getGithub(username, token)
      if (!localStorage.getItem('github_oauth_token')) return
      if (data.success) {
        setGitData(data)
        setHasError(false)
      } else {
        setHasError(true)
      }
    } catch (err) {
      if (!localStorage.getItem('github_oauth_token')) return
      console.warn('GitHub Console - Fetch telemetry failed:', err)
      setHasError(true)
    } finally {
      if (localStorage.getItem('github_oauth_token')) {
        setIsLoading(false)
        setIsFetching(false)
      }
    }
  }

  // Periodic polling only if authenticated
  useEffect(() => {
    if (!token) return

    fetchGitTelemetry()
    
    // Auto-update every 60 seconds
    const interval = setInterval(() => {
      fetchGitTelemetry(true)
    }, 60000)

    return () => {
      clearInterval(interval)
    }
  }, [token, username])

  const handleDisconnect = () => {
    localStorage.removeItem('github_oauth_token')
    localStorage.removeItem('github_oauth_username')
    setToken(null)
    setUsername(null)
    setGitData(null)
    setIsLoading(false)
    setIsFetching(false)
    setHasError(false)
  }

  const handleConnect = () => {
    // Dynamically pass the window.location.origin so the backend can construct the perfect redirect_uri!
    const originParam = encodeURIComponent(window.location.origin)
    window.location.href = `${import.meta.env.VITE_API_URL}/github/login?redirect_origin=${originParam}`
  }

  const { repos = [], commits = [], isMock = false } = gitData || {}

  // Compute developer telemetry aggregates
  const stats = useMemo(() => {
    if (repos.length === 0) return { totalRepos: 0, totalStars: 0, languages: [], primaryLang: 'N/A' }
    
    const totalStars = repos.reduce((acc, curr) => acc + (curr.stars || 0), 0)
    
    const langCounts = {}
    repos.forEach(repo => {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1
      }
    })
    
    const languages = Object.entries(langCounts)
      .map(([name, count]) => ({ name, count, percentage: Math.round((count / repos.length) * 100) }))
      .sort((a, b) => b.count - a.count)
      
    const primaryLang = languages[0]?.name || 'N/A'
    
    return {
      totalRepos: repos.length,
      totalStars,
      languages,
      primaryLang
    }
  }, [repos])

  // Filtering & Sorting of active projects
  const filteredAndSortedRepos = useMemo(() => {
    let result = [...repos]

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(repo => 
        repo.name.toLowerCase().includes(q) || 
        (repo.description && repo.description.toLowerCase().includes(q))
      )
    }

    // Language filter
    if (selectedLanguage !== 'All') {
      result = result.filter(repo => repo.language === selectedLanguage)
    }

    // Sort order
    result.sort((a, b) => {
      if (sortBy === 'stars') {
        return (b.stars || 0) - (a.stars || 0)
      }
      if (sortBy === 'updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      return 0
    })

    return result
  }, [repos, searchQuery, selectedLanguage, sortBy])

  // Extract unique languages for filter list
  const uniqueLanguages = useMemo(() => {
    const langs = new Set()
    repos.forEach(repo => {
      if (repo.language) langs.add(repo.language)
    })
    return ['All', ...Array.from(langs)]
  }, [repos])

  if (!token) {
    return (
      <div className="space-y-6 animate-fade-in p-1 max-w-4xl mx-auto pb-8 pt-12">
        <div className="saas-card p-12 text-center flex flex-col items-center justify-center space-y-6 overflow-hidden relative">
          {/* Glassmorphic glowing background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-1/2 rounded-full bg-linear-purple/5 blur-[100px] pointer-events-none" />
          
          <div className="h-16 w-16 flex items-center justify-center text-zinc-400 shrink-0 bg-transparent relative z-10">
            <GitBranch className="h-12 w-12 text-linear-purple animate-pulse" />
          </div>

          <div className="space-y-2 relative z-10 max-w-md">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Connect GitHub Workspace</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Link your GitHub account to access live repository diagnostics, track push events, search your code, and monitor development activities directly from your console.
            </p>
          </div>

          {authError && (
            <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2 relative z-10">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {isAuthenticating ? (
            <div className="flex items-center gap-2 text-zinc-300 text-xs font-semibold relative z-10 bg-zinc-950/60 border border-saas-border rounded-lg px-6 py-3">
              <RefreshCw className="h-4 w-4 text-linear-purple animate-spin" />
              <span>Authenticating with GitHub...</span>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="btn-saas-primary py-3 px-8 text-xs font-bold flex items-center gap-2.5 cursor-pointer relative z-10 shadow-lg"
            >
              <GitBranch className="h-4 w-4" />
              <span>Connect GitHub Account</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-1">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-zinc-800 rounded" />
            <div className="h-4 w-64 bg-zinc-800 rounded" />
          </div>
          <div className="h-10 w-24 bg-zinc-800 rounded-lg" />
        </div>

        {/* Stats row skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-900 rounded-xl border border-saas-border/40" />
          ))}
        </div>

        {/* Content section skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-12 bg-zinc-900 rounded-lg border border-saas-border/40" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-zinc-900 rounded-xl border border-saas-border/40" />
              ))}
            </div>
          </div>
          <div className="h-96 bg-zinc-900 rounded-xl border border-saas-border/40" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in p-1 max-w-[1600px] mx-auto pb-8">
      
      {/* 1. Header with dynamic badges */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient-saas">
            GitHub Workspace
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Real-time telemetry of repository metrics and recent push activities.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-saas-border text-zinc-300 shadow-sm">
            <img 
              src={`https://github.com/${username}.png`} 
              alt={username} 
              onError={(e) => { e.target.src = 'https://github.com/identicons/octocat.png' }}
              className="h-5 w-5 rounded-full border border-saas-border/80" 
            />
            <span className="font-mono text-xs font-semibold text-zinc-100">{username}</span>
          </div>

          <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
            isMock 
              ? 'bg-amber-950/20 border-amber-500/20 text-amber-400' 
              : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
          }`}>
            <ShieldCheck className="h-3.5 w-3.5" />
            {isMock ? 'Demo Mode' : 'Connected'}
          </span>

          <button
            onClick={() => fetchGitTelemetry(true)}
            disabled={isFetching}
            className="btn-saas-secondary py-2 px-3 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-saas-surface-raised"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-emerald-500' : 'text-zinc-400'}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleDisconnect}
            className="btn-saas-secondary text-rose-400 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 py-2 px-3 text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <X className="h-3.5 w-3.5" />
            <span>Disconnect</span>
          </button>
        </div>
      </div>

      {hasError ? (
        <div className="saas-card border-red-500/20 bg-red-950/5 flex flex-col items-center justify-center py-12 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-white">GitHub Connection Sync Lost</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              We experienced issues communicating with the GitHub Telemetry module. Please check your developer configuration parameters or force a reload.
            </p>
          </div>
          <button 
            onClick={() => fetchGitTelemetry(true)}
            className="btn-saas-primary py-2 px-6 flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Reconnecting</span>
          </button>
        </div>
      ) : (
        <>
          {/* 2. Stats Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Stat Item 1 */}
            <div className="saas-card p-5 flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center text-emerald-400 shrink-0">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Public Repositories</p>
                <h3 className="text-2xl font-bold text-white mt-0.5 tabular-nums">{stats.totalRepos}</h3>
              </div>
            </div>

            {/* Stat Item 2 */}
            <div className="saas-card p-5 flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center text-amber-400 shrink-0">
                <Star className="h-6 w-6 fill-amber-400/20" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Aggregated Stars</p>
                <h3 className="text-2xl font-bold text-white mt-0.5 tabular-nums">{stats.totalStars}</h3>
              </div>
            </div>

            {/* Stat Item 3 */}
            <div className="saas-card p-5 flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center text-indigo-400 shrink-0">
                <Code className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Primary Core Language</p>
                <h3 className="text-2xl font-bold text-white mt-0.5">{stats.primaryLang}</h3>
              </div>
            </div>

            {/* Stat Item 4 */}
            <div className="saas-card p-5 flex items-center gap-4">
              <div className="h-10 w-10 flex items-center justify-center text-pink-400 shrink-0">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Push Events Tracked</p>
                <h3 className="text-2xl font-bold text-white mt-0.5 tabular-nums">{commits.length}</h3>
              </div>
            </div>

          </div>

          {/* 3. Main Multi-Panel Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT 2 COLS: Interactive Repositories console */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Controls bar */}
              <div className="saas-card p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search public repos..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-zinc-950 border border-saas-border/60 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/40 transition-colors"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* Language filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Language:</span>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="bg-zinc-950 border border-saas-border/60 text-xs text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500/40"
                    >
                      {uniqueLanguages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>

                  {/* Sort filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-zinc-950 border border-saas-border/60 text-xs text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500/40"
                    >
                      <option value="stars">Highest Stars</option>
                      <option value="updated">Recent Push</option>
                      <option value="name">Alphabetical</option>
                    </select>
                  </div>

                </div>

              </div>

              {/* Repositories grid */}
              {filteredAndSortedRepos.length === 0 ? (
                <div className="saas-card text-center py-16 space-y-2 border-dashed">
                  <BookOpen className="h-8 w-8 text-zinc-600 mx-auto" />
                  <p className="text-sm font-semibold text-zinc-400">No repositories matched your filters</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedLanguage('All'); }}
                    className="text-xs text-emerald-500 hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAndSortedRepos.map((repo) => (
                    <a
                      key={repo.name}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="saas-card-interactive p-4 flex flex-col justify-between min-h-[140px] relative overflow-hidden group/repo cursor-pointer"
                    >
                      <div className="absolute -top-10 -right-10 h-20 w-20 rounded-full bg-emerald-500/0 group-hover/repo:bg-emerald-500/5 transition-all duration-300 blur-xl" />
                      
                      <div className="space-y-2">
                        {/* Title and External Icon */}
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-bold text-white group-hover/repo:text-emerald-400 transition-colors text-sm truncate pr-4">
                            {repo.name}
                          </h4>
                          <ExternalLink className="h-3.5 w-3.5 text-zinc-600 group-hover/repo:text-emerald-400 transition-colors shrink-0" />
                        </div>

                        {/* Description */}
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {repo.description || 'No description provided for this GitHub workspace project.'}
                        </p>
                      </div>

                      {/* Footer specs */}
                      <div className="flex items-center justify-between pt-4 border-t border-saas-border/30 mt-4 text-[10px]">
                        <div className="flex items-center gap-2.5">
                          {repo.language && (
                            <span className="font-bold text-zinc-300 bg-zinc-900 border border-saas-border/60 px-2 py-0.5 rounded-full">
                              {repo.language}
                            </span>
                          )}
                          <span className="text-zinc-500">Updated {getRelativeTime(repo.updatedAt)}</span>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-1 font-mono font-bold text-zinc-300">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
                          <span>{repo.stars}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Recent Push Activities Timeline */}
            <div className="saas-card flex flex-col h-fit overflow-hidden">
              <div className="px-6 py-4 bg-zinc-950/40 border-b border-saas-border/60 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <GitCommit className="h-4 w-4 text-emerald-500" />
                  Push Activities Log
                </h3>
                <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 border border-saas-border text-zinc-500 font-semibold font-mono">
                  UP TO 10
                </span>
              </div>

              <div className="p-6 bg-saas-card flex-1 flex flex-col">
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {commits.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                      <GitCommit className="h-8 w-8 text-zinc-700 mx-auto animate-pulse" />
                      <p className="text-xs text-zinc-500 italic">No recent push events discovered</p>
                    </div>
                  ) : (
                    commits.slice(0, 10).map((commit, idx) => (
                      <div key={idx} className="relative pl-6 pb-4 last:pb-0 group/timeline">
                        {/* Vertical line connector */}
                        {idx !== commits.slice(0, 10).length - 1 && (
                          <div className="absolute left-[9px] top-4 bottom-0 w-[1px] bg-zinc-800" />
                        )}
                        
                        {/* Timeline dot */}
                        <div className="absolute left-1.5 top-2.5 h-2.5 w-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/40" />

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-bold text-zinc-200">
                              {commit.repo}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-medium font-mono">
                              {getRelativeTime(commit.time)}
                            </span>
                          </div>
                          
                          <p className="text-xs text-zinc-400 font-medium leading-relaxed bg-zinc-950/30 p-3 rounded-lg border border-saas-border/60">
                            {commit.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Safe Sync Label */}
                <div className="pt-4 border-t border-saas-border/20 mt-6 flex items-center justify-between text-[9px] text-zinc-500 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    GitHub Integration Secure
                  </span>
                  <span>Port active 60s check</span>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  )
}
