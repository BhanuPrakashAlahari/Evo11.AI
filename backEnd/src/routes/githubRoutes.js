import { Router } from 'express'
import { getGithubData, exchangeGithubCode, redirectToGithubAuth } from '../controllers/githubController.js'

const router = Router()

/**
 * GitHub Telemetry Router.
 * GET /api/github
 */
router.get('/', getGithubData)

/**
 * GET /api/github/login
 * Redirects user to GitHub OAuth login.
 */
router.get('/login', redirectToGithubAuth)

/**
 * POST /api/github/oauth
 * Exchange authorization code for access token.
 */
router.post('/oauth', exchangeGithubCode)

export default router
