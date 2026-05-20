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
      console.log(`[Weather Service] Key is placeholder. Generating high-fidelity mock weather for: ${city}`)
      return this.generateMockWeather(city)
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
      console.error(`[Weather Service] Fetch failed for ${city}. Falling back to mocks. Error:`, error)
      return this.generateMockWeather(city)
    }
  }

  /**
   * Generates highly realistic, responsive mock statistics based on the city requested.
   */
  generateMockWeather(city) {
    const normalizedCity = city.toLowerCase().trim()
    
    // Custom parameters per standard cities for visual accuracy
    if (normalizedCity.includes('london')) {
      return {
        success: true,
        city: 'London',
        temp: 54,
        humidity: 82,
        condition: 'Rain',
        description: 'light intensity drizzle',
        icon: '09d',
        wind: 15,
        isMock: true
      }
    } else if (normalizedCity.includes('new york')) {
      return {
        success: true,
        city: 'New York',
        temp: 68,
        humidity: 50,
        condition: 'Clear',
        description: 'clear sky',
        icon: '01d',
        wind: 8,
        isMock: true
      }
    } else if (normalizedCity.includes('tokyo')) {
      return {
        success: true,
        city: 'Tokyo',
        temp: 70,
        humidity: 60,
        condition: 'Clouds',
        description: 'scattered clouds',
        icon: '03d',
        wind: 5,
        isMock: true
      }
    }

    // Default fallback mock parameters (resembles San Francisco metrics)
    return {
      success: true,
      city: city.charAt(0).toUpperCase() + city.slice(1),
      temp: 72,
      humidity: 48,
      condition: 'Clear',
      description: 'sunny skies',
      icon: '01d',
      wind: 12,
      isMock: true
    }
  }
}

export const weatherService = new WeatherService()
