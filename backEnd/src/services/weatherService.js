import { config } from '../config/env.js'

class WeatherService {
  /**
   * Fetches weather information for a specified city from OpenWeather API.
   * Seamlessly falls back to premium mock statistics if the API key is not configured or fails.
   */
  async getWeatherByCity(city = 'San Francisco') {
    const apiKey = config.openWeatherApiKey ? config.openWeatherApiKey.trim() : ''
    const isPlaceholder = !apiKey || apiKey === 'placeholder_api_key' || apiKey === 'your_openweather_api_key'

    if (isPlaceholder) {
      throw new Error('OpenWeather API Key is a placeholder. Please configure a valid API key in backEnd/.env')
    }

    try {
      // Query OpenWeather using imperial units for consistency with the visual layout (Fahrenheit)
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=imperial`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`OpenWeather API returned status: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        city: data.name,
        temp: Math.round(data.main.temp),
        humidity: data.main.humidity,
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        wind: Math.round(data.wind.speed),
        isMock: false
      }
    } catch (error) {
      console.error(`[Weather Service] Fetch failed for ${city}. Error:`, error)
      throw error
    }
  }
}

export const weatherService = new WeatherService()

