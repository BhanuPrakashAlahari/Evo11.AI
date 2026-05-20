import { Router } from 'express'
import { getHealth } from '../controllers/healthController.js'

const router = Router()

/**
 * Health Check API routing mapping.
 * GET /api/health
 */
router.get('/', getHealth)

export default router
