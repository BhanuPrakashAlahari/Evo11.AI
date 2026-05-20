import { useState, useEffect } from 'react'
import { Newspaper, ExternalLink, RefreshCw, AlertCircle, Clock, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { services } from '../services/api'

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

export default function TechNews() {
  const [articles, setArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [hasError, setHasError] = useState(false)

  const fetchNews = async (showIndicator = false) => {
    if (showIndicator) setIsFetching(true)
    try {
      const res = await services.getNews(showIndicator)
      if (res.success) {
        setArticles(res.articles || [])
        setHasError(false)
      } else {
        setHasError(true)
      }
    } catch (err) {
      console.warn('Tech News Page - Fetch failed:', err)
      setHasError(true)
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }

  useEffect(() => {
    let isActive = true
    const init = async () => {
      if (isActive) {
        await fetchNews()
      }
    }
    init()
    return () => {
      isActive = false
    }
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-saas-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
            <Link to="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="h-3 w-3" /> Console
            </Link>
            <span>•</span>
            <span className="text-sky-400 flex items-center gap-1">
              <Newspaper className="h-3 w-3" /> Live Feed
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gradient-saas flex items-center gap-2">
            Technical News & Insights
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Curated real-time feed tracking software engineering breakthroughs, open-source highlights, and global tech shifts.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() => fetchNews(true)}
            disabled={isFetching || isLoading}
            className="btn-saas-secondary flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Refreshing...' : 'Refresh Feed'}</span>
          </button>
        </div>
      </div>

      {/* Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="saas-card h-[180px] animate-pulse flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-zinc-800 rounded w-full" />
                <div className="h-4 bg-zinc-800 rounded w-5/6" />
              </div>
              <div className="flex gap-2">
                <div className="h-3.5 w-16 bg-zinc-800 rounded" />
                <div className="h-3.5 w-12 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : hasError ? (
        <div className="saas-card border-red-500/20 bg-red-950/5 py-12 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
          <h3 className="font-bold text-white text-base">News Feed Offline</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-md">
            Failed to download recent article telemetry. Please check your NewsAPI connection or internet parameters.
          </p>
          <button
            onClick={() => fetchNews(true)}
            className="btn-saas-primary mt-4 flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Connecting Again</span>
          </button>
        </div>
      ) : articles.length === 0 ? (
        <div className="saas-card py-12 flex flex-col items-center justify-center text-center">
          <Newspaper className="h-10 w-10 text-zinc-600 mb-3" />
          <h3 className="font-bold text-zinc-300 text-base">Feed Currently Empty</h3>
          <p className="text-xs text-zinc-500 mt-1">
            No active technical reports found at this time.
          </p>
        </div>
      ) : (
        /* Real Article Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, idx) => (
            <a
              key={article.id || idx}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="saas-card-interactive flex flex-col justify-between h-[180px] group/article relative overflow-hidden"
            >
              {/* Background accent glow */}
              <div className="absolute -top-10 -right-10 h-20 w-20 rounded-full bg-sky-500/5 group-hover/article:bg-sky-500/10 blur-xl transition-all duration-500" />

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span className={`font-bold px-2 py-0.5 rounded border shrink-0 ${getSourceColor(article.source)}`}>
                    {article.source}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(article.publishedAt)}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-zinc-200 group-hover/article:text-white leading-snug line-clamp-3 transition-colors">
                  {article.title}
                </h3>
              </div>

              <div className="pt-2.5 border-t border-saas-border/30 flex items-center justify-between text-[10px] text-zinc-500 font-semibold">
                <span className="text-zinc-600 truncate max-w-[150px]">By {article.author || 'Staff'}</span>
                <span className="text-sky-400 flex items-center gap-1 group-hover/article:translate-x-0.5 transition-transform duration-200">
                  Read Article
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
