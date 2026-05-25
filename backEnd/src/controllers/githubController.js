import { githubService } from '../services/githubService.js'

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
