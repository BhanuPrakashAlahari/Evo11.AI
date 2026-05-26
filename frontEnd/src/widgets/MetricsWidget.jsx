import { useState, useEffect, useMemo } from 'react'
import { Cpu, HardDrive, RefreshCw, Server, Activity, Clock } from 'lucide-react'
import { services } from '../services/api'
import { AreaChart, Area, Grid, XAxis, ChartTooltip } from '../components/ui/area-chart'

function formatUptime(seconds) {
  if (isNaN(seconds) || seconds === null) return 'N/A'
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  const parts = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  parts.push(`${s}s`)

  return parts.join(' ')
}
export default function MetricsWidget({ isLoading: isParentLoading }) {
  const [healthData, setHealthData] = useState(null)
  const [isLocalLoading, setIsLocalLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Always start fresh — never rely on stale localStorage history
  const [history, setHistory] = useState([])

  // Fetch telemetry from /api/health
  useEffect(() => {
    let isActive = true

    const addDataPoint = (data, prevHistory) => {
      if (!data?.success || !data?.performance) return prevHistory
      const cpu = parseFloat(data.performance.cpu?.usagePercent || 0)
      const memory = parseFloat(data.performance.memory?.usagePercent || 0)

      if (prevHistory.length === 0) {
        // Seed 30 baseline points with small natural jitter so chart is never flat
        const baseline = []
        const now = Date.now()
        for (let i = 29; i >= 0; i--) {
          const jitter = () => (Math.random() - 0.5) * 4
          baseline.push({
            date: new Date(now - i * 12000),
            cpu: Math.max(0, Math.min(100, cpu + jitter())),
            memory: Math.max(0, Math.min(100, memory + jitter()))
          })
        }
        return baseline
      }

      return [...prevHistory, { date: new Date(), cpu, memory }].slice(-30)
    }

    const fetchInitialMetrics = async () => {
      try {
        const data = await services.getHealth()
        if (isActive) {
          setHealthData(data)
          setHasError(false)
          setHistory(prev => addDataPoint(data, prev))
        }
      } catch (err) {
        console.warn('Metrics Widget - Backend server unreachable:', err)
        if (isActive) setHasError(true)
      } finally {
        if (isActive) setIsLocalLoading(false)
      }
    }

    const fetchIntervalMetrics = async () => {
      if (isActive) setIsFetching(true)
      try {
        const data = await services.getHealth()
        if (isActive) {
          setHealthData(data)
          setHasError(false)
          setHistory(prev => addDataPoint(data, prev))
        }
      } catch {
        if (isActive) setHasError(true)
      } finally {
        if (isActive) setIsFetching(false)
      }
    }

    fetchInitialMetrics()

    // Refresh telemetry every 12 seconds (exactly 5 requests per minute)
    const interval = setInterval(() => {
      fetchIntervalMetrics()
    }, 12000)

    return () => {
      isActive = false
      clearInterval(interval)
    }
  }, [])

  const showSkeleton = isParentLoading || isLocalLoading

  const isOnline = !hasError && healthData?.success
  const performance = healthData?.performance

  // Parse Uptime — strip trailing "s" suffix before parsing
  const uptimeRaw = healthData?.uptime
    ? parseFloat(String(healthData.uptime).replace(/[^0-9.]/g, ''))
    : null
  const uptimeString = isOnline ? formatUptime(uptimeRaw) : 'N/A'

  // Parse CPU metrics
  const cpuPercent = isOnline && performance?.cpu?.usagePercent !== undefined
    ? Math.round(performance.cpu.usagePercent)
    : 0
  const cpuModel = isOnline ? performance?.cpu?.model || 'Unknown' : 'N/A'
  const cpuCores = isOnline ? performance?.cpu?.cores || 0 : 0

  // Parse Memory metrics
  const memoryPercent = isOnline && performance?.memory?.usagePercent !== undefined
    ? Math.round(parseFloat(performance.memory.usagePercent))
    : 0
  
  const totalMemGb = isOnline && performance?.memory?.total
    ? (performance.memory.total / (1024 * 1024 * 1024)).toFixed(1)
    : '0.0'
  const usedMemGb = isOnline && performance?.memory?.used
    ? (performance.memory.used / (1024 * 1024 * 1024)).toFixed(1)
    : '0.0'

  // Parse Platform metrics
  const osArch = isOnline ? performance?.platform?.arch || '' : ''
  const osType = isOnline ? performance?.platform?.type || 'OS' : 'OS'

  // Format Platform display badge
  const platformLabel = isOnline 
    ? `${osType === 'Darwin' ? 'macOS' : osType} (${osArch})`
    : 'Unknown OS'

  // Memoized customized tooltip rows for double metric tracking
  const customRows = useMemo(() => {
    return (point) => [
      { color: '#5e6ad2', label: 'CPU Capacity', value: `${point.cpu}%` },
      { color: '#f43f5e', label: 'RAM Utilization', value: `${point.memory}%` }
    ]
  }, [])

  return (
    <div className="saas-card w-full relative overflow-hidden flex flex-col justify-between gap-0">
      {/* Background Accent glow */}
      <div className={`absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl transition-all duration-1000 ${
        isOnline 
          ? 'bg-linear-purple/5' 
          : 'bg-rose-500/5'
      }`} />

      {/* Header bar with padding */}
      <div className="flex justify-between items-center px-6 py-4 bg-zinc-950/40 border-b border-saas-border/60">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Activity className={`h-3.5 w-3.5 ${isOnline ? 'text-linear-purple' : 'text-zinc-500'}`} />
          Live System Telemetry Console
        </span>
        <div className="flex items-center gap-2">
          {isFetching && (
            <RefreshCw className="h-3.5 w-3.5 text-linear-purple animate-spin" />
          )}
          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border uppercase tracking-widest transition-all duration-300 ${
            isOnline 
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/25 text-rose-400 animate-pulse'
          }`}>
            {isOnline ? 'System Online' : 'Offline'}
          </span>
        </div>
      </div>

      {showSkeleton ? (
        /* Pulsing Inline Skeleton Body */
        <div className="p-6 bg-saas-card space-y-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="h-24 bg-zinc-950/40 border border-saas-border/60 rounded-xl" />
            <div className="h-24 bg-zinc-950/40 border border-saas-border/60 rounded-xl" />
            <div className="h-24 bg-zinc-950/40 border border-saas-border/60 rounded-xl" />
          </div>
          <div className="h-[240px] w-full bg-zinc-950/20 border border-saas-border/40 rounded-xl flex items-center justify-center">
            <span className="text-xs text-zinc-600 font-mono">Synchronizing performance metrics...</span>
          </div>
        </div>
      ) : (
        /* Actual Interactive Telemetry Blocks */
        <>
          {/* Main content grid of system stats */}
          <div className="p-6 bg-saas-card border-b border-saas-border/40">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Host & Platform Info Block */}
              <div className="flex flex-col justify-between p-4 rounded-xl bg-zinc-950/40 border border-saas-border/60 transition-colors">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Server className="h-3 w-3" /> System Architecture
                  </span>
                  <h4 className="text-sm font-bold text-zinc-200 truncate">
                    {isOnline ? healthData.performance?.platform?.hostname || 'localhost' : 'Offline'}
                  </h4>
                </div>
                <div className="mt-3 text-[11px] text-zinc-400 font-semibold flex items-center justify-between">
                  <span>{platformLabel}</span>
                  <span className="text-zinc-600 font-normal font-mono">
                    {isOnline ? healthData.performance?.platform?.release || '' : ''}
                  </span>
                </div>
              </div>

              {/* CPU Capacity Utilization Block */}
              <div className="p-4 rounded-xl bg-zinc-950/40 border border-saas-border/60 transition-colors space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-400 flex items-center gap-1">
                    <Cpu className="h-3.5 w-3.5 text-zinc-500" /> CPU Allocation
                  </span>
                  <span className="font-extrabold text-white font-mono text-sm">{cpuPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-900 border border-saas-border/50 overflow-hidden p-[1px]">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOnline ? 'bg-gradient-to-r from-linear-purple to-indigo-400' : 'bg-zinc-800'
                    }`}
                    style={{ width: `${cpuPercent}%` }}
                  />
                </div>
                {isOnline && (
                  <div className="text-[10px] text-zinc-500 truncate" title={`${cpuModel} (${cpuCores} Cores)`}>
                    {cpuModel.replace(/\(R\)|\(TM\)/g, '')} • {cpuCores} Cores
                  </div>
                )}
              </div>

              {/* Memory Utilization Block */}
              <div className="p-4 rounded-xl bg-zinc-950/40 border border-saas-border/60 transition-colors space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-400 flex items-center gap-1">
                    <HardDrive className="h-3.5 w-3.5 text-zinc-500" /> RAM utilization
                  </span>
                  <span className="font-extrabold text-white font-mono text-sm">{memoryPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-zinc-900 border border-saas-border/50 overflow-hidden p-[1px]">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOnline ? 'bg-gradient-to-r from-linear-purple to-indigo-400' : 'bg-zinc-800'
                    }`}
                    style={{ width: `${memoryPercent}%` }}
                  />
                </div>
                {isOnline && (
                  <div className="text-[10px] text-zinc-500 flex justify-between">
                    <span>{usedMemGb} GB / {totalMemGb} GB Used</span>
                    <span className="flex items-center gap-1 text-zinc-400 font-semibold">
                      <Clock className="h-3 w-3 text-zinc-500" /> Uptime: <span className="font-mono">{uptimeString}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section: Full-Width Real-Time Chart with padding inside */}
          <div className="w-full bg-zinc-950/20 p-6 relative overflow-hidden flex flex-col justify-end min-h-[240px]">
            {/* Neon chart backdrop glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-1/2 rounded-full bg-linear-purple/2.5 blur-[100px] pointer-events-none" />
            
            <div className="absolute top-6 left-6 z-10 flex items-center gap-4 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-linear-purple" /> CPU Capacity
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" /> RAM Utilization
              </span>
            </div>

            <div className="w-full mt-8 h-[160px]">
              {history.length > 0 ? (
                <AreaChart data={history} xDataKey="date" animationDuration={800} aspectRatio="4.2 / 1">
                  <Grid horizontal stroke="rgba(255, 255, 255, 0.03)" strokeDasharray="3,3" />
                  <Area
                    dataKey="cpu"
                    fadeEdges
                    fill="#5e6ad2"
                    fillOpacity={0.12}
                    stroke="#5e6ad2"
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="memory"
                    fadeEdges
                    fill="#f43f5e"
                    fillOpacity={0.08}
                    stroke="#f43f5e"
                    strokeWidth={1.5}
                  />
                  <XAxis numTicks={6} />
                  <ChartTooltip rows={customRows} />
                </AreaChart>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                  Awaiting telemetry synchronization...
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

