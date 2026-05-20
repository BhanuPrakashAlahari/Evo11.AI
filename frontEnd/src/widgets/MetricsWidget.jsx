import { useState, useEffect } from 'react'
import { Cpu, HardDrive, RefreshCw } from 'lucide-react'
import { services } from '../services/api'

export default function MetricsWidget({ isLoading: isParentLoading }) {
  const [healthData, setHealthData] = useState(null)
  const [isLocalLoading, setIsLocalLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Handle immediate mount fetch and establish telemetry interval
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

    // Trigger initial load asynchronously to prevent effect set-state cascades
    fetchInitialMetrics()
    
    // Periodically fetch server health diagnostics every 5 seconds
    const interval = setInterval(() => {
      fetchIntervalMetrics()
    }, 5000)

    return () => {
      isActive = false
      clearInterval(interval)
    }
  }, [])

  // Enforce skeleton load if either the parent simulated load or immediate local mount load is active
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

  // Derive display parameters from diagnostic health data
  const isOnline = !hasError && healthData?.success
  const uptime = isOnline ? healthData.uptime : 'N/A'
  
  // Extract CPU Loadavg and convert to approximate relative percent (e.g. multiplier of cores)
  const rawCpuLoad = isOnline && healthData.performance?.cpuLoad ? healthData.performance.cpuLoad[0] : 0
  const cpuPercent = isOnline ? Math.min(Math.round(rawCpuLoad * 12.5), 100) : 0
  
  // Extract Memory utilization percentage
  const memoryPercent = isOnline && healthData.performance?.memory ? Math.round(parseFloat(healthData.performance.memory.usagePercent)) : 0
  
  // Convert OS total/free bytes into readable Gigabyte sizes for storage/memory labels
  const totalMemGb = isOnline && healthData.performance?.memory 
    ? (healthData.performance.memory.total / (1024 * 1024 * 1024)).toFixed(0) 
    : 'N/A'

  return (
    <div className="saas-card-interactive flex flex-col justify-between h-[230px] group/metrics">
      {/* Glow highlight based on server connectivity status */}
      <div className={`absolute -top-10 -right-10 h-24 w-24 rounded-full blur-xl transition-all ${
        isOnline 
          ? 'bg-linear-purple/5 group-hover/metrics:bg-linear-purple/10' 
          : 'bg-red-500/5 group-hover/metrics:bg-red-500/10'
      }`} />

      <div>
        <div className="flex justify-between items-center pb-3 border-b border-saas-border/40">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-zinc-400" />
            Core Host Metrics
          </span>
          <div className="flex items-center gap-2">
            {isFetching && (
              <RefreshCw className="h-3 w-3 text-zinc-500 animate-spin" />
            )}
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider transition-colors ${
              isOnline 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Real-time system metrics progress bars */}
        <div className="mt-4 space-y-4">
          {/* CPU Load Metric */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-400">Processor Capacity</span>
              <span className="font-bold text-white font-mono">{cpuPercent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-950 border border-saas-border overflow-hidden p-[1px]">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  isOnline 
                    ? 'bg-gradient-to-r from-linear-purple to-indigo-400' 
                    : 'bg-zinc-800'
                }`}
                style={{ width: `${cpuPercent}%` }}
              />
            </div>
          </div>

          {/* Memory Utilization Metric */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-400">Memory Utilization</span>
              <span className="font-bold text-white font-mono">{memoryPercent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-zinc-950 border border-saas-border overflow-hidden p-[1px]">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  isOnline 
                    ? 'bg-gradient-to-r from-linear-purple to-indigo-400' 
                    : 'bg-zinc-800'
                }`}
                style={{ width: `${memoryPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-saas-border/20 flex items-center justify-between text-[10px] text-zinc-500">
        <span className="flex items-center gap-1">
          <HardDrive className="h-3 w-3" />
          <span>RAM: {totalMemGb} GB allocated</span>
        </span>
        <span>Uptime: {uptime}</span>
      </div>
    </div>
  )
}
