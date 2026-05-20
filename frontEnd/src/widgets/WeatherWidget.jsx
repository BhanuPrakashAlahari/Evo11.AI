import { useState, useEffect } from 'react'
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Snowflake, 
  CloudFog, 
  Wind, 
  Droplets,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { services } from '../services/api'

// Helper function to map OpenWeather weather states dynamically to Lucide icons
const getWeatherIcon = (condition = '', iconCode = '') => {
  const cond = condition.toLowerCase()
  const icon = iconCode.slice(0, 2) // Strip day/night indicator 'd' or 'n'

  if (cond.includes('clear') || icon === '01') {
    return <Sun className="h-7 w-7 text-amber-500 group-hover/weather:rotate-45 transition-transform duration-500" />
  }
  if (cond.includes('thunder') || icon === '11') {
    return <CloudLightning className="h-7 w-7 text-yellow-400" />
  }
  if (cond.includes('rain') || cond.includes('drizzle') || icon === '09' || icon === '10') {
    return <CloudRain className="h-7 w-7 text-indigo-400" />
  }
  if (cond.includes('snow') || icon === '13') {
    return <Snowflake className="h-7 w-7 text-sky-300" />
  }
  if (cond.includes('mist') || cond.includes('fog') || cond.includes('haze') || icon === '50') {
    return <CloudFog className="h-7 w-7 text-zinc-400" />
  }
  
  // Fallback to standard Cloud indicator (e.g. Clouds, scattered clouds, etc.)
  return <Cloud className="h-7 w-7 text-zinc-300" />
}

export default function WeatherWidget({ isLoading: isParentLoading }) {
  const [city, setCity] = useState('San Francisco')
  const [weather, setWeather] = useState(null)
  const [isLocalLoading, setIsLocalLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Function to pull weather parameters from backend
  const fetchWeather = async (targetCity, showIndicator = false) => {
    if (showIndicator) setIsFetching(true)
    try {
      const data = await services.getWeather(targetCity)
      if (data.success) {
        setWeather(data)
        setHasError(false)
      } else {
        setHasError(true)
      }
    } catch (err) {
      console.warn(`Weather Widget - Fetch failed for ${targetCity}:`, err)
      setHasError(true)
    } finally {
      setIsLocalLoading(false)
      setIsFetching(false)
    }
  }

  // Handle initial fetch on mount and establish standard 5-minute refreshes
  useEffect(() => {
    let isActive = true

    const runInitialFetch = async () => {
      if (isActive) {
        setIsLocalLoading(true)
        await fetchWeather(city)
      }
    }

    runInitialFetch()

    // Refresh every 5 minutes (300,000 milliseconds)
    const refreshInterval = setInterval(() => {
      if (isActive) fetchWeather(city, true)
    }, 300000)

    return () => {
      isActive = false
      clearInterval(refreshInterval)
    }
  }, [city]) // Triggers reload when the selected city changes

  const showSkeleton = isParentLoading || isLocalLoading

  if (showSkeleton) {
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

  // Error boundary response display
  if (hasError) {
    return (
      <div className="saas-card flex flex-col justify-between h-[230px] border-red-500/20 bg-red-950/5">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
            <AlertCircle className="h-4 w-4" />
            <span>Telemetry Lost</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Failed to load weather diagnostics from host server. Verify API configurations.
          </p>
        </div>
        <button 
          onClick={() => fetchWeather(city)}
          className="w-full btn-saas-secondary py-2 flex items-center justify-center gap-2 hover:bg-zinc-900 border-red-500/10 cursor-pointer text-xs"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Retry Connection</span>
        </button>
      </div>
    )
  }

  const { temp, humidity, condition, description, wind, icon } = weather || {}

  return (
    <div className="saas-card-interactive flex flex-col justify-between h-[230px] group/weather">
      {/* Dynamic color glow based on weather condition */}
      <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-amber-500/5 group-hover/weather:bg-amber-500/10 blur-xl transition-all" />

      <div>
        {/* City selection tabs for visual premium interactive utility */}
        <div className="flex justify-between items-center pb-2.5 border-b border-saas-border/40">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
            {['SF', 'NYC', 'LDN', 'TYO'].map((abbr) => {
              const fullCityMap = { SF: 'San Francisco', NYC: 'New York', LDN: 'London', TYO: 'Tokyo' }
              const isSelected = city === fullCityMap[abbr]
              return (
                <button
                  key={abbr}
                  onClick={() => setCity(fullCityMap[abbr])}
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-linear-purple/10 border border-linear-purple/20 text-white' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  {abbr}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            {isFetching && <RefreshCw className="h-3 w-3 text-zinc-500 animate-spin" />}
            <span className="text-[10px] font-bold text-zinc-500 font-mono">Refreshed</span>
          </div>
        </div>
        
        {/* Weather data fields */}
        <div className="mt-4.5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
            {getWeatherIcon(condition, icon)}
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1">
              <span>{temp}°F</span>
              <span className="text-xs text-zinc-400 font-normal">in {weather.city}</span>
            </div>
            <div className="text-xs text-zinc-400 font-medium capitalize mt-0.5">
              {condition} • {description}
            </div>
          </div>
        </div>
      </div>

      {/* Weather sub metrics panel */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-saas-border/30 text-xs">
        <div className="flex items-center gap-1 text-zinc-400">
          <Wind className="h-3.5 w-3.5 text-zinc-500" />
          <span>{wind} mph</span>
        </div>
        <div className="flex items-center gap-1 text-zinc-400">
          <Droplets className="h-3.5 w-3.5 text-zinc-500" />
          <span>{humidity}% hum</span>
        </div>
        <div className="flex items-center gap-1 text-zinc-400 justify-end">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-zinc-500 text-[10px]">Auto-5m</span>
        </div>
      </div>
    </div>
  )
}
