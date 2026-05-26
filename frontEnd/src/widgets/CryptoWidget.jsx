import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle, Coins } from 'lucide-react'
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer
} from 'recharts'
import { services } from '../services/api'

// Colors for price direction
const upColor = "#10b981" // emerald-500
const downColor = "#ef4444" // red-500

// Simple custom Tabs component
function Tabs({ value, onChange, options }) {
  return (
    <div className="inline-flex items-center rounded-full bg-zinc-950/60 p-1 border border-saas-border/40">
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 text-[10px] rounded-full font-bold uppercase tracking-wider transition-all cursor-pointer ${
              active
                ? "bg-linear-purple/15 border border-linear-purple/35 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// Simple custom Switch component
function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
        checked ? "bg-emerald-500/80" : "bg-zinc-800"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-4.5" : "translate-x-1"
        }`}
      />
    </button>
  )
}

// Custom Tooltip for Recharts
function ChartTooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const price = payload[0]?.value
  return (
    <div className="rounded-lg border border-saas-border bg-zinc-950/95 p-3 text-xs text-white shadow-xl backdrop-blur-md">
      <div className="font-semibold text-zinc-500 font-mono">
        {label ? new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
      </div>
      <div className="font-extrabold text-white mt-1 font-mono">${price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    </div>
  )
}

export default function CryptoWidget({ isLoading: isParentLoading }) {
  const [coin, setCoin] = useState('BTC')
  const [chartType, setChartType] = useState('line')
  const [isRunning, setIsRunning] = useState(true)
  const [cryptoData, setCryptoData] = useState([])
  const [history, setHistory] = useState([])
  const [isLocalLoading, setIsLocalLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Asynchronous query for initial baseline setup
  const fetchInitialData = async () => {
    if (history.length === 0) {
      setIsLocalLoading(true)
    } else {
      setIsFetching(true)
    }
    try {
      const res = await services.getCrypto()
      if (res.success && res.data) {
        setCryptoData(res.data)
        const targetCoin = res.data.find(c => c.symbol.toUpperCase() === coin.toUpperCase())
        if (targetCoin && targetCoin.sparkline) {
          // Re-hydrate last 24 items as initial timeline baseline points
          const initialHistory = targetCoin.sparkline.map((pt, idx) => ({
            time: new Date(Date.now() - (targetCoin.sparkline.length - idx) * 4000).toISOString(),
            price: pt.price,
            isNew: false
          }))
          setHistory(initialHistory)
        }
        setHasError(false)
      } else {
        setHasError(true)
      }
    } catch (err) {
      console.warn('Crypto initial telemetry failed:', err)
      setHasError(true)
    } finally {
      setIsLocalLoading(false)
      setIsFetching(false)
    }
  }

  // Handle baseline setup on selected coin change
  useEffect(() => {
    fetchInitialData()
  }, [coin])

  // Periodic polling every 4 seconds
  useEffect(() => {
    if (!isRunning) return

    const poll = async () => {
      setIsFetching(true)
      try {
        const res = await services.getCrypto()
        if (res.success && res.data) {
          setCryptoData(res.data)
          const targetCoin = res.data.find(c => c.symbol.toUpperCase() === coin.toUpperCase())
          if (targetCoin) {
            const newPrice = targetCoin.price
            setHistory(prev => {
              const updated = prev.map(p => ({ ...p, isNew: false }))
              // Keep last 25 items for smooth scrolling
              return [...updated.slice(-24), {
                time: new Date().toISOString(),
                price: newPrice,
                isNew: true
              }]
            })
          }
          setHasError(false)
        }
      } catch (err) {
        console.warn('Crypto polling query failed:', err)
      } finally {
        setIsFetching(false)
      }
    }

    const intervalId = setInterval(poll, 60000)
    return () => clearInterval(intervalId)
  }, [coin, isRunning])

  const showSkeleton = isParentLoading || isLocalLoading

  const selectedCoinData = cryptoData.find(c => c.symbol.toUpperCase() === coin.toUpperCase())
  const latestPrice = selectedCoinData?.price || 0
  const change24h = selectedCoinData?.change24h || 0
  const isPriceUp = change24h >= 0

  // Custom pulsed dot animations
  const CustomDot = (props) => {
    const { cx, cy, payload } = props
    if (!payload || !payload.isNew) return null
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={isPriceUp ? upColor : downColor}
        stroke="none"
        className="animate-pulse"
      />
    )
  }

  const CustomActiveDot = (props) => {
    const { cx, cy } = props
    return (
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={isPriceUp ? upColor : downColor}
        stroke="#ffffff"
        strokeWidth={1.5}
      />
    )
  }

  if (showSkeleton) {
    return (
      <div className="saas-card flex flex-col justify-between h-[360px] animate-pulse overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 bg-zinc-950/40 border-b border-saas-border/40">
          <div className="h-4 w-28 bg-zinc-900 rounded" />
          <div className="h-4 w-12 bg-zinc-900 rounded" />
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between bg-saas-card">
          <div className="space-y-4">
            <div className="h-8 w-32 bg-zinc-900 rounded" />
            <div className="h-4 w-24 bg-zinc-900 rounded" />
          </div>
          <div className="h-36 w-full bg-zinc-950/30 border border-saas-border rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="saas-card flex flex-col justify-between h-[360px] border-red-500/20 bg-red-950/5 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 bg-red-950/10 border-b border-red-500/10 text-red-400 font-bold text-xs uppercase tracking-wider">
          <AlertCircle className="h-4 w-4" />
          <span>Crypto Telemetry Offline</span>
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between bg-saas-card">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Failed to query crypto statistics from host engine. Verify API server or database connections.
          </p>
          <button
            onClick={fetchInitialData}
            className="w-full btn-saas-secondary py-2 flex items-center justify-center gap-2 hover:bg-zinc-900 border-red-500/10 cursor-pointer text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Force Reconnect</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="saas-card flex flex-col justify-between h-[360px] overflow-hidden relative">
      {/* Header bar with coin selection and controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-3.5 bg-zinc-950/40 border-b border-saas-border/60 relative z-10 gap-3">
        <div className="flex items-center gap-2">
          {/* Transparent icon */}
          <div className="text-linear-purple shrink-0">
            <Coins className="h-5 w-5" />
          </div>
          {/* Selection drop down directly in place of title for perfect alignment! */}
          <select
            value={coin}
            onChange={(e) => setCoin(e.target.value)}
            className="bg-transparent border-transparent text-sm text-white focus:outline-none font-extrabold uppercase cursor-pointer"
          >
            <option value="BTC" className="bg-zinc-950 text-white">BTC / USD</option>
            <option value="ETH" className="bg-zinc-950 text-white">ETH / USD</option>
            <option value="SOL" className="bg-zinc-950 text-white">SOL / USD</option>
          </select>
        </div>

        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Live</span>
            <Switch checked={isRunning} onChange={setIsRunning} />
          </div>
          <Tabs
            value={chartType}
            onChange={(v) => setChartType(v)}
            options={[
              { value: "line", label: "Line" },
              { value: "area", label: "Area" },
            ]}
          />
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 p-6 bg-saas-card flex flex-col justify-between gap-4 relative z-10">
        {/* Ticker rates */}
        <div className="flex items-end justify-between gap-4">
          {isFetching ? (
            /* Pulsing Inline Price Skeleton */
            <div className="space-y-2.5 animate-pulse py-1">
              <div className="h-8 w-44 bg-zinc-900 rounded" />
              <div className="h-4.5 w-24 bg-zinc-900 rounded" />
            </div>
          ) : (
            <div>
              <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
                ${latestPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-xs font-bold flex items-center gap-1 mt-1 font-mono ${
                isPriceUp ? "text-emerald-400" : "text-rose-400"
              }`}>
                <span>{isPriceUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}</span>
                <span>{isPriceUp ? "+" : ""}{change24h}% (24h)</span>
              </div>
            </div>
          )}
        </div>

        {/* Recharts Canvas */}
        <div className="w-full h-[160px] relative">
          {isFetching ? (
            /* Pulsing Inline Graph Canvas Skeleton */
            <div className="w-full h-full bg-zinc-950/40 border border-saas-border rounded-xl animate-pulse flex flex-col items-center justify-center text-[10px] text-zinc-500 font-semibold font-mono tracking-wider">
              <RefreshCw className="h-4 w-4 mb-2 animate-spin text-linear-purple/80" />
              <span>Fetching Real-Time Telemetry...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "line" ? (
                <LineChart data={history} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <XAxis
                    dataKey="time"
                    tick={false}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 10, fill: "#71717a" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  />
                  <ReTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={isPriceUp ? upColor : downColor}
                    strokeWidth={2}
                    dot={(props) => <CustomDot {...props} />}
                    activeDot={(props) => <CustomActiveDot {...props} />}
                    isAnimationActive={false}
                  />
                </LineChart>
              ) : (
                <AreaChart data={history} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <XAxis
                    dataKey="time"
                    tick={false}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 10, fill: "#71717a" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  />
                  <ReTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={isPriceUp ? upColor : downColor}
                    fill={isPriceUp ? upColor : downColor}
                    fillOpacity={0.06}
                    strokeWidth={2}
                    dot={(props) => <CustomDot {...props} />}
                    activeDot={(props) => <CustomActiveDot {...props} />}
                    isAnimationActive={false}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-3.5 border-t border-saas-border/30 mt-1 font-semibold font-sans">
          <span className="flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${isFetching ? 'bg-linear-purple animate-spin' : 'bg-emerald-500 animate-pulse'}`} />
            Live Sync • 60s poll
          </span>
          <span>Evo11 Telemetry engine</span>
        </div>
      </div>
    </div>
  )
}
