import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { services } from '../services/api'

// Custom styling helper to map crypto currencies to their theme colors
const getCryptoConfig = (symbol) => {
  switch (symbol.toUpperCase()) {

    case 'BTC':
      return {
        icon: '₿',
        color: 'text-amber-500 border-amber-500/25 bg-amber-500/10'
      }
    case 'ETH':
      return {
        icon: 'Ξ',
        color: 'text-indigo-400 border-indigo-500/25 bg-indigo-500/10'
      }
    case 'SOL':
      return {
        icon: '◎',
        color: 'text-purple-400 border-purple-500/25 bg-purple-500/10'
      }
    default:
      return {
        icon: '¤',
        color: 'text-zinc-400 border-zinc-500/25 bg-zinc-500/10'
      }
  }
}

export default function CryptoWidget({ isLoading: isParentLoading }) {
  const [cryptoData, setCryptoData] = useState([])
  const [isLocalLoading, setIsLocalLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Asynchronous query pull
  const fetchCryptoRates = async (showIndicator = false) => {
    if (showIndicator) setIsFetching(true)
    try {
      const res = await services.getCrypto()
      if (res.success) {
        setCryptoData(res.data)
        setHasError(false)
      } else {
        setHasError(true)
      }
    } catch (err) {
      console.warn('Crypto Widget - Telemetry failed:', err)
      setHasError(true)
    } finally {
      setIsLocalLoading(false)
      setIsFetching(false)
    }
  }

  // Handle initial fetch on mount and establish standard 30-second refreshes
  useEffect(() => {
    let isActive = true

    const runInitialFetch = async () => {
      if (isActive) {
        setIsLocalLoading(true)
        await fetchCryptoRates()
      }
    }

    runInitialFetch()

    // Query live prices every 30 seconds
    const interval = setInterval(() => {
      if (isActive) fetchCryptoRates(true)
    }, 30000)

    return () => {
      isActive = false
      clearInterval(interval)
    }
  }, [])

  const showSkeleton = isParentLoading || isLocalLoading

  if (showSkeleton) {
    return (
      <div className="saas-card flex flex-col justify-between h-[230px] animate-pulse">
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-saas-border/40">
            <div className="h-4 w-28 bg-zinc-800 rounded" />
            <div className="h-4 w-4 bg-zinc-800 rounded" />
          </div>
          <div className="mt-5 space-y-4">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 bg-zinc-800 rounded-full" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-10 bg-zinc-800 rounded" />
                    <div className="h-2 w-6 bg-zinc-800 rounded" />
                  </div>
                </div>
                <div className="h-4 w-24 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="saas-card flex flex-col justify-between h-[230px] border-red-500/20 bg-red-950/5">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
            <AlertCircle className="h-4 w-4" />
            <span>Crypto Offline</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Failed to load crypto statistics. Rate limits on public simple indexes may be exceeded.
          </p>
        </div>
        <button
          onClick={() => fetchCryptoRates()}
          className="w-full btn-saas-secondary py-2 flex items-center justify-center gap-2 hover:bg-zinc-900 border-red-500/10 cursor-pointer text-xs"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Force Reload</span>
        </button>
      </div>
    )
  }

  return (
    <div className="saas-card-interactive flex flex-col justify-between h-[230px] group/crypto">
      {/* Accent glow */}
      <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-linear-purple/5 group-hover/crypto:bg-linear-purple/10 blur-xl transition-all" />

      <div>
        <div className="flex justify-between items-center pb-2.5 border-b border-saas-border/40">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            Asset Tracker
          </span>
          <div className="flex items-center gap-2">
            {isFetching && <RefreshCw className="h-3 w-3 text-zinc-500 animate-spin" />}
            <span className="text-[10px] font-bold text-zinc-500 font-mono">Live • 30s</span>
          </div>
        </div>

        {/* Crypto List */}
        <div className="mt-3.5 space-y-2.5">
          {cryptoData.slice(0, 3).map((coin) => {
            const config = getCryptoConfig(coin.symbol)
            const isPositive = coin.change24h >= 0

            return (
              <div
                key={coin.id}
                className="flex items-center justify-between py-1.5 border-b border-saas-border/10 last:border-0 pb-2"
              >
                {/* Symbol logo info */}
                <div className="flex items-center gap-2.5 min-w-[90px]">
                  <div className={`h-7.5 w-7.5 rounded-lg border flex items-center justify-center font-bold text-sm font-mono ${config.color}`}>
                    {config.icon}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white">{coin.symbol} / USD</div>
                    <div className="text-[9px] text-zinc-500 truncate max-w-[50px]">{coin.name}</div>
                  </div>
                </div>

                {/* Recharts Mini Trend Chart Sparkline */}
                <div className="w-[70px] h-[22px] flex items-center shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={coin.sparkline}>
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={isPositive ? '#10b981' : '#f43f5e'}
                        strokeWidth={1.5}
                        dot={false}
                        animationDuration={500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Price and volatility stats */}
                <div className="text-right pl-2">
                  <div className="text-[11px] font-bold text-white font-mono">
                    ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-[9px] font-bold flex items-center gap-0.5 justify-end font-mono ${isPositive ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                    {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                    <span>{isPositive ? '+' : ''}{coin.change24h}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
