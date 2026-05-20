import { Router } from 'express'
import { getWeather } from '../controllers/weatherController.js'

const router = Router()

/**
 * Weather API routing mapping.
 * GET /api/weather
 */
router.get('/', getWeather)

export default router
