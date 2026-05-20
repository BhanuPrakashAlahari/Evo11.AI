import { useState, useEffect } from 'react'
import { Cpu, HardDrive, RefreshCw, Server, Activity } from 'lucide-react'
import { services } from '../services/api'

/**
 * Format system uptime (seconds) into a highly readable string.
 */
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

  // Fetch telemetry from /api/health
  useEffect(() => {
    let isActive = true

    const fetchInitialMetrics = async () => {
      try {
        const data = await services.getHealth()
        if (isActive) {
          setHealthData(data)
          setHasError(false)
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
        }
      } catch {
        if (isActive) setHasError(true)
      } finally {
        if (isActive) setIsFetching(false)
      }
    }

    fetchInitialMetrics()
    
    // Refresh telemetry every 3 seconds for super live, real-time feel
    const interval = setInterval(() => {
      fetchIntervalMetrics()
    }, 3000)

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
            <div className="space-y-1.5">
              <div className="h-3 w-16 bg-zinc-800 rounded" />
              <div className="h-2 w-full bg-zinc-800 rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-16 bg-zinc-800 rounded" />
              <div className="h-2 w-full bg-zinc-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isOnline = !hasError && healthData?.success
  const performance = healthData?.performance

  // Parse Uptime
  const uptimeRaw = healthData?.uptime ? parseFloat(healthData.uptime) : null
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

  return (
    <div className="saas-card-interactive flex flex-col justify-between h-[230px] group/metrics overflow-hidden relative">
      {/* Background Decorative Blur */}
      <div className={`absolute -top-12 -right-12 h-24 w-24 rounded-full blur-2xl transition-all duration-700 ${
        isOnline 
          ? 'bg-linear-purple/10 group-hover/metrics:bg-linear-purple/20' 
          : 'bg-rose-500/10 group-hover/metrics:bg-rose-500/20'
      }`} />

      {/* Header */}
      <div>
        <div className="flex justify-between items-center pb-2.5 border-b border-saas-border/40">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Activity className={`h-3.5 w-3.5 ${isOnline ? 'text-linear-purple' : 'text-zinc-500'}`} />
            System Metrics
          </span>
          <div className="flex items-center gap-2">
            {isFetching && (
              <RefreshCw className="h-3 w-3 text-linear-purple animate-spin" />
            )}
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider transition-all duration-300 ${
              isOnline 
                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/25 text-rose-400 animate-pulse'
            }`}>
              {isOnline ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Real-time progress bars */}
        <div className="mt-3.5 space-y-3.5">
          {/* CPU Capacity Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-400 flex items-center gap-1">
                <Cpu className="h-3 w-3 text-zinc-500" />
                CPU Capacity
              </span>
              <span className="font-bold text-white font-mono">{cpuPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-950/80 border border-saas-border overflow-hidden p-[1px]">
              <div 
                className={`h-full rounded-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
                  isOnline 
                    ? 'bg-gradient-to-r from-linear-purple to-indigo-400' 
                    : 'bg-zinc-800'
                }`}
                style={{ width: `${cpuPercent}%` }}
              />
            </div>
            {isOnline && (
              <div className="text-[9px] text-zinc-500 truncate" title={`${cpuModel} (${cpuCores} Cores)`}>
                {cpuModel.replace(/\(R\)|\(TM\)/g, '')} • {cpuCores} Cores
              </div>
            )}
          </div>

          {/* Memory Utilization Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-400 flex items-center gap-1">
                <HardDrive className="h-3 w-3 text-zinc-500" />
                RAM Allocation
              </span>
              <span className="font-bold text-white font-mono">{memoryPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-950/80 border border-saas-border overflow-hidden p-[1px]">
              <div 
                className={`h-full rounded-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
                  isOnline 
                    ? 'bg-gradient-to-r from-linear-purple to-indigo-400' 
                    : 'bg-zinc-800'
                }`}
                style={{ width: `${memoryPercent}%` }}
              />
            </div>
            {isOnline && (
              <div className="text-[9px] text-zinc-500 flex justify-between">
                <span>{usedMemGb} GB / {totalMemGb} GB Used</span>
                <span className="text-[9px] text-zinc-600 font-mono">{platformLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="pt-2 border-t border-saas-border/20 flex items-center justify-between text-[10px] text-zinc-500">
        <span className="flex items-center gap-1">
          <Server className="h-3 w-3 text-zinc-600" />
          <span className="truncate max-w-[120px]">{isOnline ? healthData.performance?.platform?.hostname || 'localhost' : 'Offline'}</span>
        </span>
        <span className="font-semibold text-zinc-400">
          Uptime: <span className="font-mono text-zinc-300">{uptimeString}</span>
        </span>
      </div>
    </div>
  )
}
