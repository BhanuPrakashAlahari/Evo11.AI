import { newsService } from '../services/newsService.js'

/**
 * Returns the latest AI and software engineering news articles.
 * GET /api/news
 */
export async function getNews(req, res, next) {
  try {
    const data = await newsService.getLatestNews()

    // Allow short-term browser caching only for cached responses (reduces latency)
    if (data.cached) {
      res.set('Cache-Control', 'public, max-age=300') // 5 min browser cache for already-cached data
    } else {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    }

    res.status(200).json(data)
  } catch (error) {
    next(error)
  }
}
