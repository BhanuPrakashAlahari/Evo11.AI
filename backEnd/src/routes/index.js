import { Router } from 'express'
import healthRoutes from './healthRoutes.js'

const router = Router()

/**
 * Root Router Registry.
 * Mounts all sub-modules under structured endpoints.
 */
router.use('/health', healthRoutes)

export default router
