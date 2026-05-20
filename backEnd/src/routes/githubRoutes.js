import { Router } from 'express'
import { getGithubData } from '../controllers/githubController.js'

const router = Router()

/**
 * GitHub Telemetry Router.
 * GET /api/github
 */
router.get('/', getGithubData)

export default router
