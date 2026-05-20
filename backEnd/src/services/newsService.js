import { config } from '../config/env.js'

// In-memory cache to avoid hammering the NewsAPI free tier (100 req/day limit)
const cache = {
  data: null,
  timestamp: null,
  TTL_MS: 30 * 60 * 1000 // 30 minutes
}

class NewsService {
  /**
   * Fetches the latest AI and software engineering tech news.
   * Results are cached in-memory for 30 minutes to stay well within free tier limits.
   * Falls back to curated mock articles if no API key is provided.
   */
  async getLatestNews() {
    const apiKey = config.newsApiKey ? config.newsApiKey.trim() : ''
    const isPlaceholder = !apiKey || apiKey === 'your_newsapi_key_here' || apiKey === 'placeholder'

    if (isPlaceholder) {
      console.log('[News Service] No API key configured. Returning curated mock articles.')
      return this.getMockNews()
    }

    // Return cached data if still fresh
    if (cache.data && cache.timestamp && (Date.now() - cache.timestamp < cache.TTL_MS)) {
      const ageMinutes = Math.round((Date.now() - cache.timestamp) / 60000)
      console.log(`[News Service] Returning cached news (${ageMinutes}m old, TTL: 30m)`)
      return { ...cache.data, cached: true }
    }

    try {
      const query = encodeURIComponent('artificial intelligence OR software engineering OR developer tools OR open source')
      const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`

      const response = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Evo11Dashboard/1.0' }
      })

      if (response.status === 401) {
        console.warn('[News Service] NewsAPI returned 401 — invalid key. Falling back to mocks.')
        return this.getMockNews()
      }

      if (response.status === 429) {
        console.warn('[News Service] NewsAPI rate limit hit. Returning cached or mock data.')
        return cache.data || this.getMockNews()
      }

      if (!response.ok) {
        throw new Error(`NewsAPI responded with status: ${response.status}`)
      }

      const json = await response.json()

      // Filter out articles with [Removed] content and map to compact shape
      const articles = (json.articles || [])
        .filter(a => a.title && a.title !== '[Removed]' && a.url)
        .slice(0, 8)
        .map(a => ({
          id: Buffer.from(a.url).toString('base64').slice(0, 16),
          title: a.title,
          source: a.source?.name || 'Unknown Source',
          publishedAt: a.publishedAt,
          url: a.url,
          description: a.description || '',
          urlToImage: a.urlToImage || null
        }))

      const result = { success: true, articles, isMock: false, cached: false }

      // Store in cache
      cache.data = result
      cache.timestamp = Date.now()
      console.log(`[News Service] Fetched ${articles.length} fresh articles from NewsAPI. Cached for 30m.`)

      return result
    } catch (error) {
      console.error('[News Service] Fetch failed. Falling back to mocks. Error:', error.message)
      return cache.data || this.getMockNews()
    }
  }

  /**
   * Curated high-fidelity mock articles for when API key is not yet configured.
   */
  getMockNews() {
    return {
      success: true,
      isMock: true,
      cached: false,
      articles: [
        {
          id: 'mock-1',
          title: 'OpenAI Releases GPT-5 with Enhanced Reasoning Capabilities',
          source: 'TechCrunch',
          publishedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
          url: 'https://techcrunch.com',
          description: 'The latest model shows dramatic improvements in multi-step reasoning and code generation tasks.'
        },
        {
          id: 'mock-2',
          title: 'Google DeepMind Achieves Breakthrough in Protein Structure Prediction',
          source: 'Wired',
          publishedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
          url: 'https://wired.com',
          description: 'AlphaFold 3 can now predict the structure of all molecules of life with unprecedented accuracy.'
        },
        {
          id: 'mock-3',
          title: 'React 20 Announced with Built-in Server Components and AI Hooks',
          source: 'The Verge',
          publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
          url: 'https://theverge.com',
          description: 'Meta open-sources the next major version of React, shipping with native AI capabilities.'
        },
        {
          id: 'mock-4',
          title: 'Rust Surpasses Go as the Most Loved Language in Stack Overflow Survey',
          source: 'Ars Technica',
          publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
          url: 'https://arstechnica.com',
          description: 'For the ninth year in a row, Rust tops the most-loved programming languages list.'
        },
        {
          id: 'mock-5',
          title: 'GitHub Copilot Now Supports Multi-File Editing and Workspace Awareness',
          source: 'GitHub Blog',
          publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
          url: 'https://github.blog',
          description: 'Copilot\'s new workspace mode can refactor across entire codebases using natural language.'
        },
        {
          id: 'mock-6',
          title: 'Kubernetes 2.0 Ships with Simplified Developer Experience',
          source: 'InfoQ',
          publishedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
          url: 'https://infoq.com',
          description: 'The CNCF overhauls Kubernetes with a dramatically simplified API and built-in GitOps support.'
        }
      ]
    }
  }
}

export const newsService = new NewsService()
