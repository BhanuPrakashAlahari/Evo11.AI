import { Router } from 'express'
import healthRoutes from './healthRoutes.js'
import weatherRoutes from './weatherRoutes.js'
import githubRoutes from './githubRoutes.js'
import cryptoRoutes from './cryptoRoutes.js'
import newsRoutes from './newsRoutes.js'
import taskRoutes from './taskRoutes.js'

const router = Router()

router.use('/health', healthRoutes)
router.use('/weather', weatherRoutes)
router.use('/github', githubRoutes)
router.use('/crypto', cryptoRoutes)
router.use('/news', newsRoutes)
router.use('/tasks', taskRoutes)

export default router
