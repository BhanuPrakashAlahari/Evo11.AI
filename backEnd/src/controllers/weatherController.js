import { weatherService } from '../services/weatherService.js'

/**
 * Handles weather inquiries for the frontend dashboard.
 * GET /api/weather?city=San+Francisco
 */
export async function getWeather(req, res, next) {
  try {
    const city = req.query.city || 'San Francisco'
    const weatherData = await weatherService.getWeatherByCity(city)
    
    // Disable client caching for real-time weather stats
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.status(200).json(weatherData)
  } catch (error) {
    next(error)
  }
}
