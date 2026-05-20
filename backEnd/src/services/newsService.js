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
  async getLatestNews(bypassCache = false) {
    if (bypassCache) {
      console.log('[News Service] Manual refresh requested. Clearing cache to fetch fresh data.')
      cache.data = null
      cache.timestamp = null
    }

    const apiKey = config.newsApiKey ? config.newsApiKey.trim() : ''
    const isPlaceholder = !apiKey || apiKey === 'your_newsapi_key_here' || apiKey === 'placeholder'

    if (isPlaceholder) {
      console.log('[News Service] No API key configured. Returning curated fresh mock articles.')
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
    const pool = [
      {
        id: 'mock-1',
        title: 'OpenAI Releases GPT-5 with Enhanced Multi-Step Reasoning Capabilities',
        source: 'TechCrunch',
        publishedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
        url: 'https://techcrunch.com',
        description: 'The latest reasoning engine shows dramatic improvements in long-context coding and math tasks.'
      },
      {
        id: 'mock-2',
        title: 'Google DeepMind Achieves Breakthrough in Protein Structure Prediction',
        source: 'Wired',
        publishedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
        url: 'https://wired.com',
        description: 'AlphaFold 3 can now predict the structures and interactions of all life molecules.'
      },
      {
        id: 'mock-3',
        title: 'React 20 Shipped Globally with Built-in Server Components and Native Compiler',
        source: 'The Verge',
        publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
        url: 'https://theverge.com',
        description: 'Meta open-sources the next generation React compiler, optimizing components automatically.'
      },
      {
        id: 'mock-4',
        title: 'Rust Surpasses Go as the Most Loved Language in Stack Overflow Survey',
        source: 'Ars Technica',
        publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
        url: 'https://arstechnica.com',
        description: 'For the ninth year in a row, Rust tops developers charts for safety and speed.'
      },
      {
        id: 'mock-5',
        title: 'GitHub Copilot Now Supports Multi-File Editing and Full Workspace Awareness',
        source: 'GitHub Blog',
        publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
        url: 'https://github.blog',
        description: 'Copilot\'s new agentic architecture can refactor massive features across multiple directories.'
      },
      {
        id: 'mock-6',
        title: 'Kubernetes 2.0 Overhauls Cloud Orchestration with Native GitOps Support',
        source: 'InfoQ',
        publishedAt: new Date(Date.now() - 18 * 3600000).toISOString(),
        url: 'https://infoq.com',
        description: 'CNCF simplifies cloud configuration with dynamic schemas and zero-boilerplate manifests.'
      },
      {
        id: 'mock-7',
        title: 'TypeScript 6.0 Announces Advanced Flow Analysis and Turbo Compilation Speed',
        source: 'TechCrunch',
        publishedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        url: 'https://techcrunch.com',
        description: 'New compiler features resolve complex type checks up to 3 times faster.'
      },
      {
        id: 'mock-8',
        title: 'Apple Announces Vision Pro 2 with Spatial AI Gesture Navigation and Dual-M4 Chips',
        source: 'Wired',
        publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
        url: 'https://wired.com',
        description: 'Apple integrates a dedicated neural engine for fully immersive, high-resolution spatial processing.'
      },
      {
        id: 'mock-9',
        title: 'Vite 9.0 Ships with 50% Faster Hot Module Replacement (HMR) Benchmarks',
        source: 'Ars Technica',
        publishedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        url: 'https://arstechnica.com',
        description: 'The standard frontend tooling delivers dramatic speed increases for large-scale enterprise bundles.'
      },
      {
        id: 'mock-10',
        title: 'Tailwind CSS v5 Announces Next-Gen Wasm Engine and Zero-Config Build Steps',
        source: 'The Verge',
        publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
        url: 'https://theverge.com',
        description: 'WebAssembly engine generates utilities instantly on request, reducing development boot time.'
      },
      {
        id: 'mock-11',
        title: 'AWS Launches Q-Developer: Next-Generation Cloud Companion Assistant',
        source: 'GitHub Blog',
        publishedAt: new Date(Date.now() - 10 * 3600000).toISOString(),
        url: 'https://github.blog',
        description: 'AWS integrates context-aware coding assistant inside all console and local environments.'
      },
      {
        id: 'mock-12',
        title: 'Vercel Introduces v0: Fully Agentic Frontend UI Generation Powered by LLMs',
        source: 'TechCrunch',
        publishedAt: new Date(Date.now() - 14 * 3600000).toISOString(),
        url: 'https://techcrunch.com',
        description: 'AI model converts natural language descriptions into interactive, responsive frontend cards.'
      }
    ]

    // Shuffle the pool and select top 8 fresh items
    const shuffled = [...pool]
      .sort(() => 0.5 - Math.random())
      .map(item => ({
        ...item,
        // Make the timestamps live/relative to the click action
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 20) * 1000 * 60 * 15).toISOString()
      }))

    return {
      success: true,
      isMock: true,
      cached: false,
      articles: shuffled.slice(0, 8)
    }
  }
}

export const newsService = new NewsService()
