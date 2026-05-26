import { useState, useEffect, useRef } from 'react'
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
  AlertCircle,
  Search,
  X
} from 'lucide-react'
import { services } from '../services/api'

// Helper function to map OpenWeather weather states dynamically to Lucide icons
const getWeatherIcon = (condition = '', iconCode = '') => {
  const cond = condition.toLowerCase()
  const icon = iconCode.slice(0, 2) // Strip day/night indicator 'd' or 'n'

  if (cond.includes('clear') || icon === '01') {
    return <Sun className="h-16 w-16 text-amber-500 animate-pulse" />
  }
  if (cond.includes('thunder') || icon === '11') {
    return <CloudLightning className="h-16 w-16 text-yellow-400" />
  }
  if (cond.includes('rain') || cond.includes('drizzle') || icon === '09' || icon === '10') {
    return <CloudRain className="h-16 w-16 text-indigo-400" />
  }
  if (cond.includes('snow') || icon === '13') {
    return <Snowflake className="h-16 w-16 text-sky-300" />
  }
  if (cond.includes('mist') || cond.includes('fog') || cond.includes('haze') || icon === '50') {
    return <CloudFog className="h-16 w-16 text-zinc-400" />
  }
  
  // Fallback to standard Cloud indicator (e.g. Clouds, scattered clouds, etc.)
  return <Cloud className="h-16 w-16 text-zinc-300" />
}

// Popular locations list for dynamic keyup autocomplete filtering
const POPULAR_LOCATIONS = [
  { city: 'London', country: 'United Kingdom' },
  { city: 'New York', country: 'United States' },
  { city: 'Tokyo', country: 'Japan' },
  { city: 'Paris', country: 'France' },
  { city: 'Berlin', country: 'Germany' },
  { city: 'Mumbai', country: 'India' },
  { city: 'Sydney', country: 'Australia' },
  { city: 'Toronto', country: 'Canada' },
  { city: 'Singapore', country: 'Singapore' },
  { city: 'Dubai', country: 'United Arab Emirates' },
  { city: 'Rome', country: 'Italy' },
  { city: 'Cairo', country: 'Egypt' },
  { city: 'Seoul', country: 'South Korea' },
  { city: 'Brazil', country: 'Brazil' },
  { city: 'Cape Town', country: 'South Africa' },
  { city: 'Chicago', country: 'United States' }
]

export default function WeatherWidget({ isLoading: isParentLoading }) {
  const [city, setCity] = useState('San Francisco')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [weather, setWeather] = useState(null)
  const [isLocalLoading, setIsLocalLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const [hasError, setHasError] = useState(false)
  const containerRef = useRef(null)

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
      setIsFetching(false)
    }
  }

  // Handle initial fetch on mount and establish standard 5-minute refreshes
  useEffect(() => {
    let isActive = true

    const runInitialFetch = async () => {
      if (isActive) {
        if (!weather) {
          setIsLocalLoading(true)
        } else {
          setIsFetching(true)
        }
        await fetchWeather(city)
        if (isActive) setIsLocalLoading(false)
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

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter preset locations based on search query for autocomplete dropdown
  const filteredLocations = searchQuery.trim()
    ? POPULAR_LOCATIONS.filter(loc => 
        loc.city.toLowerCase().includes(searchQuery.toLowerCase()) || 
        loc.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const showSkeleton = isParentLoading || isLocalLoading

  if (showSkeleton) {
    return (
      <div className="saas-card flex flex-col justify-between h-[360px] animate-pulse overflow-hidden">
        <div className="flex justify-between items-center px-6 py-3.5 bg-zinc-950/40 border-b border-saas-border/40">
          <div className="h-4 w-28 bg-zinc-900 rounded" />
          <div className="h-4 w-4 bg-zinc-900 rounded" />
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between bg-saas-card">
          <div className="flex flex-col items-center justify-center flex-1 space-y-4">
            <div className="h-12 w-12 bg-zinc-900 rounded-full" />
            <div className="space-y-2 flex flex-col items-center">
              <div className="h-7 w-20 bg-zinc-900 rounded" />
              <div className="h-3.5 w-32 bg-zinc-900 rounded" />
            </div>
          </div>
          <div className="flex gap-4 pt-4 border-t border-saas-border/30">
            <div className="h-3 w-16 bg-zinc-900 rounded" />
            <div className="h-3 w-16 bg-zinc-900 rounded" />
          </div>
        </div>
      </div>
    )
  }

  // Error boundary response display
  if (hasError) {
    return (
      <div className="saas-card flex flex-col justify-between h-[360px] border-red-500/20 bg-red-950/5 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-3.5 bg-red-950/10 border-b border-red-500/10 text-red-400 font-bold text-xs uppercase tracking-wider">
          <AlertCircle className="h-4 w-4" />
          <span>Location Offline</span>
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between bg-saas-card">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Failed to query weather diagnostics for "{city}". Make sure the city name is valid and connected to a real OpenWeather network.
          </p>
          <button 
            onClick={() => { 
              setCity('San Francisco')
              setSearchQuery('')
              setHasError(false)
            }}
            className="w-full btn-saas-secondary py-2 flex items-center justify-center gap-2 hover:bg-zinc-900 border-red-500/10 cursor-pointer text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reset to San Francisco</span>
          </button>
        </div>
      </div>
    )
  }

  const { temp, humidity, condition, description, wind } = weather || {}

  return (
    <div className="saas-card flex flex-col justify-between h-[360px] overflow-hidden relative">
      
      {/* 1. Header with live filtering search box */}
      <div 
        ref={containerRef}
        className="flex items-center justify-between px-6 py-3 bg-zinc-950/40 border-b border-saas-border/60 relative z-20 gap-3"
      >
        <div className="relative flex-1 max-w-[210px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search city/country..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                setCity(searchQuery.trim())
                setShowDropdown(false)
              }
            }}
            className="w-full pl-8 pr-7 py-1.5 text-[10px] font-semibold rounded-lg bg-zinc-950 border border-saas-border/60 text-white placeholder-zinc-500 focus:outline-none focus:border-linear-purple/60 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('')
                setShowDropdown(false)
              }}
              className="absolute right-2 top-2 p-0.5 rounded-full hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}

          {/* Autocomplete dynamic floating dropdown */}
          {showDropdown && filteredLocations.length > 0 && (
            <div className="absolute left-0 right-0 top-[34px] max-h-[160px] overflow-y-auto bg-zinc-950/95 border border-saas-border rounded-lg shadow-2xl z-30 py-1 no-scrollbar backdrop-blur-md">
              {filteredLocations.map((loc) => (
                <button
                  key={`${loc.city}-${loc.country}`}
                  onClick={() => {
                    setCity(loc.city)
                    setSearchQuery(loc.city)
                    setShowDropdown(false)
                  }}
                  className="w-full text-left px-3 py-2 text-[10px] text-zinc-400 hover:text-white hover:bg-zinc-900/80 transition-colors cursor-pointer flex justify-between items-center border-b border-saas-border/10 last:border-0"
                >
                  <span className="font-bold">{loc.city}</span>
                  <span className="text-zinc-600 text-[9px] font-medium">{loc.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isFetching && <RefreshCw className="h-3 w-3 text-zinc-400 animate-spin" />}
          <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">Live Weather</span>
        </div>
      </div>
      
      {/* 2. Main Content Body */}
      <div className="flex-1 p-6 flex flex-col justify-between bg-saas-card relative z-10">
        
        {isFetching ? (
          /* Sleek Centered Weather In-Place Skeleton */
          <div className="flex flex-col items-center justify-center flex-1 py-3 text-center space-y-4 animate-pulse">
            <div className="h-16 w-16 bg-zinc-900 rounded-full" />
            <div className="space-y-3 flex flex-col items-center">
              <div className="h-8 w-20 bg-zinc-900 rounded" />
              <div className="h-4.5 w-28 bg-zinc-900 rounded" />
              <div className="h-3.5 w-36 bg-zinc-900 rounded" />
            </div>
          </div>
        ) : (
          /* Large Centered Weather Presentation with completely transparent icon wrapper */
          <div className="flex flex-col items-center justify-center flex-1 py-3 text-center space-y-4">
            <div className="h-16 w-16 flex items-center justify-center bg-transparent">
              {getWeatherIcon(condition, weather?.icon)}
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white tracking-tight flex items-baseline justify-center gap-1 font-mono">
                <span>{temp}°F</span>
              </div>
              <div className="text-sm font-extrabold text-zinc-200 capitalize mt-1">
                in {weather?.city || city}
              </div>
              <div className="text-xs text-zinc-500 font-bold capitalize mt-1.5 flex items-center justify-center gap-1.5">
                <span>{condition}</span>
                <span>•</span>
                <span className="text-zinc-600">{description}</span>
              </div>
            </div>
          </div>
        )}

        {/* Sub-metrics section */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-saas-border/30 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-400 font-semibold">
            <Wind className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            <span>{wind} mph</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400 font-semibold">
            <Droplets className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            <span>{humidity}% hum</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-500 justify-end font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono">Auto-5m</span>
          </div>
        </div>
      </div>
    </div>
  )
}
