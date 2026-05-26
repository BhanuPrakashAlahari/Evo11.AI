import { githubService } from '../services/githubService.js'
import { config } from '../config/env.js'

/**
 * Exposes simplified GitHub repository statistics and commit history.
 * GET /api/github
 */
export async function getGithubData(req, res, next) {
  try {
    let username = req.headers['x-github-username'] || req.query.username || null
    if (username === 'null' || username === 'undefined' || username === '') {
      username = null
    }

    let token = req.headers['x-github-token'] || null
    if (token === 'null' || token === 'undefined' || token === '') {
      token = null
    }

    const data = await githubService.getTelemetry(username, token)
    res.status(200).json(data)
  } catch (error) {
    next(error)
  }
}

/**
 * Redirects user to GitHub OAuth login.
 * GET /api/github/login
 */
export async function redirectToGithubAuth(req, res, next) {
  try {
    const clientId = config.githubClientId ? config.githubClientId.trim() : ''
    if (!clientId || clientId === 'your_github_client_id') {
      return res.status(400).send('GitHub Client ID is not configured in backEnd/.env')
    }

    const clientUrl = (config.clientUrl || 'http://localhost:5173').trim().replace(/\/+$/, '')
    const redirectUri = `${clientUrl}/gitHub`
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user,repo&prompt=select_account&redirect_uri=${encodeURIComponent(redirectUri)}`
    
    res.redirect(githubAuthUrl)
  } catch (error) {
    next(error)
  }
}

/**
 * Exchanges GitHub authorization code for an access token.
 * POST /api/github/oauth
 */
export async function exchangeGithubCode(req, res, next) {
  try {
    const { code } = req.body
    if (!code) {
      return res.status(400).json({ success: false, error: 'Authorization code is required' })
    }

    const data = await githubService.exchangeCodeForToken(code)
    res.status(200).json(data)
  } catch (error) {
    next(error)
  }
}
