import { useState, useEffect, useRef } from 'react'
import { Newspaper, ExternalLink, RefreshCw, AlertCircle, Clock, ChevronUp, ChevronDown } from 'lucide-react'
import { services } from '../services/api'

/**
 * Formats a UTC ISO date string into a concise relative time label (e.g. "2h ago", "3d ago").
 */
function formatRelativeTime(isoString) {
  const now = Date.now()
  const then = new Date(isoString).getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

// Source to accent color mapping for visual variety
const getSourceColor = (source = '') => {
  const s = source.toLowerCase()
  if (s.includes('techcrunch')) return 'text-orange-400 bg-orange-500/10 border-orange-500/20'
  if (s.includes('wired')) return 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  if (s.includes('verge')) return 'text-violet-400 bg-violet-500/10 border-violet-500/20'
  if (s.includes('ars')) return 'text-sky-400 bg-sky-500/10 border-sky-500/20'
  if (s.includes('github')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  if (s.includes('google') || s.includes('deepmind')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
  return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
}

export default function NewsWidget({ isLoading: isParentLoading }) {
  const [articles, setArticles] = useState([])
  const [isLocalLoading, setIsLocalLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isMock, setIsMock] = useState(false)
  const scrollRef = useRef(null)

  const fetchNews = async (showIndicator = false) => {
    if (showIndicator) setIsFetching(true)
    try {
      const res = await services.getNews()
      if (res.success) {
        setArticles(res.articles)
        setIsMock(res.isMock)
        setHasError(false)
      } else {
        setHasError(true)
      }
    } catch (err) {
      console.warn('News Widget - Fetch failed:', err)
      setHasError(true)
    } finally {
      setIsLocalLoading(false)
      setIsFetching(false)
    }
  }

  useEffect(() => {
    let isActive = true
    const run = async () => {
      if (isActive) {
        setIsLocalLoading(true)
        await fetchNews()
      }
    }
    run()
    return () => { isActive = false }
  }, [])

  const scrollBy = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ top: direction * 80, behavior: 'smooth' })
    }
  }

  const showSkeleton = isParentLoading || isLocalLoading

  // --- SKELETON STATE ---
  if (showSkeleton) {
    return (
      <div className="saas-card flex flex-col h-[230px] animate-pulse">
        <div className="flex justify-between items-center pb-3 border-b border-saas-border/40 shrink-0">
          <div className="h-4 w-24 bg-zinc-800 rounded" />
          <div className="h-3.5 w-3.5 bg-zinc-800 rounded" />
        </div>
        <div className="mt-4 space-y-3 overflow-hidden flex-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5 pb-3 border-b border-saas-border/10 last:border-0">
              <div className="h-3 bg-zinc-800 rounded w-full" />
              <div className="h-3 bg-zinc-800 rounded w-3/4" />
              <div className="flex gap-2 mt-1">
                <div className="h-2.5 w-16 bg-zinc-800 rounded" />
                <div className="h-2.5 w-10 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // --- ERROR STATE ---
  if (hasError) {
    return (
      <div className="saas-card flex flex-col justify-between h-[230px] border-red-500/20 bg-red-950/5">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
            <AlertCircle className="h-4 w-4" />
            <span>News Feed Offline</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Failed to load tech news feed. Backend service may be unavailable.
          </p>
        </div>
        <button
          onClick={() => fetchNews()}
          className="w-full btn-saas-secondary py-2 flex items-center justify-center gap-2 hover:bg-zinc-900 border-red-500/10 cursor-pointer text-xs"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Retry Feed</span>
        </button>
      </div>
    )
  }

  // --- MAIN WIDGET ---
  return (
    <div className="saas-card-interactive flex flex-col h-[230px] group/news">
      {/* Subtle glow accent */}
      <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-sky-500/5 group-hover/news:bg-sky-500/10 blur-xl transition-all duration-500" />

      {/* Header */}
      <div className="flex justify-between items-center pb-2.5 border-b border-saas-border/40 shrink-0">
        <div className="flex items-center gap-1.5">
          <Newspaper className="h-3.5 w-3.5 text-sky-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tech News</span>
          {isMock && (
            <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
              Demo
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isFetching && <RefreshCw className="h-3 w-3 text-zinc-500 animate-spin" />}
          {/* Scroll controls */}
          <button
            onClick={() => scrollBy(-1)}
            className="text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
            aria-label="Scroll up"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
            aria-label="Scroll down"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable Article Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto mt-2 space-y-0 pr-0.5 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {articles.map((article, idx) => (
          <a
            key={article.id || idx}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/article flex flex-col gap-1 py-2.5 px-2 -mx-2 rounded-lg border border-transparent
                       hover:border-saas-border/40 hover:bg-zinc-900/60 transition-all duration-200 cursor-pointer
                       border-b border-saas-border/10 last:border-b-0"
          >
            {/* Headline */}
            <p className="text-xs font-semibold text-zinc-300 group-hover/article:text-white leading-snug line-clamp-2 transition-colors">
              {article.title}
            </p>

            {/* Meta row: source badge + time + external link icon */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${getSourceColor(article.source)}`}>
                {article.source}
              </span>
              <div className="flex items-center gap-0.5 text-[9px] text-zinc-600">
                <Clock className="h-2.5 w-2.5" />
                <span>{formatRelativeTime(article.publishedAt)}</span>
              </div>
              <ExternalLink className="h-2.5 w-2.5 text-zinc-600 group-hover/article:text-sky-400 transition-colors ml-auto shrink-0" />
            </div>
          </a>
        ))}
      </div>

      {/* Bottom fade gradient indicator */}
      <div className="h-6 bg-gradient-to-t from-saas-card to-transparent shrink-0 -mt-2 pointer-events-none rounded-b-xl" />
    </div>
  )
}
