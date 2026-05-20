import { githubService } from '../services/githubService.js'

/**
 * Exposes simplified GitHub repository statistics and commit history.
 * GET /api/github
 */
export async function getGithubData(req, res, next) {
  try {
    const data = await githubService.getTelemetry()
    res.status(200).json(data)
  } catch (error) {
    next(error)
  }
}
