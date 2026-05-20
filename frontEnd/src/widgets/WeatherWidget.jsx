import { Sun, CloudRain, Wind, Droplets } from 'lucide-react'

export default function WeatherWidget({ isLoading }) {
  if (isLoading) {
    return (
      <div className="saas-card flex flex-col justify-between h-[230px] animate-pulse">
        <div>
          <div className="flex justify-between items-center pb-3 border-b border-saas-border/40">
            <div className="h-4 w-28 bg-zinc-800 rounded" />
            <div className="h-5 w-5 bg-zinc-800 rounded-full" />
          </div>
          <div className="mt-5 flex items-center gap-4">
            <div className="h-12 w-12 bg-zinc-800 rounded-full" />
            <div className="space-y-2">
              <div className="h-7 w-20 bg-zinc-800 rounded" />
              <div className="h-3.5 w-32 bg-zinc-800 rounded" />
            </div>
          </div>
        </div>
        <div className="flex gap-4 pt-4 border-t border-saas-border/30">
          <div className="flex-1 h-3 bg-zinc-800 rounded" />
          <div className="flex-1 h-3 bg-zinc-800 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="saas-card-interactive flex flex-col justify-between h-[230px] group/weather">
      {/* Glow highlight */}
      <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-amber-500/5 group-hover/weather:bg-amber-500/10 blur-xl transition-all" />

      <div>
        <div className="flex justify-between items-center pb-3 border-b border-saas-border/40">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">San Francisco, CA</span>
          <Sun className="h-5 w-5 text-amber-500 group-hover/weather:rotate-45 transition-transform duration-500" />
        </div>
        
        <div className="mt-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <Sun className="h-7 w-7" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight">72°F</div>
            <div className="text-xs text-zinc-400 font-medium">Mostly Sunny • Humidity: 48%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-saas-border/30 text-xs">
        <div className="flex items-center gap-1 text-zinc-400">
          <Wind className="h-3.5 w-3.5 text-zinc-500" />
          <span>12 mph</span>
        </div>
        <div className="flex items-center gap-1 text-zinc-400">
          <Droplets className="h-3.5 w-3.5 text-zinc-500" />
          <span>0% precip</span>
        </div>
        <div className="flex items-center gap-1 text-zinc-400 justify-end">
          <CloudRain className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-emerald-500 font-medium">AQI: 24</span>
        </div>
      </div>
    </div>
  )
}
