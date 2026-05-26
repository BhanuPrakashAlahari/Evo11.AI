import axios from 'axios'

// 1. DYNAMIC API CONFIGURATION & RETRIEVAL
const API_BASE_URL = import.meta.env.VITE_API_URL

/**
 * Centered Axios Client Instance.
 * Custom configured with timeouts, headers, and standard cross-origin credentials.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
})

// 2. REQUEST INTERCEPTOR (e.g. Attaching dynamic auth tokens)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 3. RESPONSE INTERCEPTOR (Centralized error boundary/response parsing)
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.error || error.message || 'API request failed',
      status: error.response?.status || 500,
      originalError: error
    }
    console.error('[Axios Interceptor] Response Error:', customError)
    return Promise.reject(customError)
  }
)

// 4. MODULAR SERVICE ENDPOINTS
export const services = {
  /**
   * Performs an asynchronous GET request to check system diagnostic health.
   * Target endpoint: GET /api/health
   */
  getHealth: () => apiClient.get('/health'),

  /**
   * Queries the weather API endpoint for current conditions in a city.
   * Target endpoint: GET /api/weather?city={city}
   */
  getWeather: (city) => apiClient.get('/weather', { params: { city } }),

  getGithub: (username, token) => {
    const headers = {}
    if (username) headers['x-github-username'] = username
    if (token) headers['x-github-token'] = token
    return apiClient.get('/github', { headers })
  },

  exchangeGithubCode: (code) => apiClient.post('/github/oauth', { code }),

  /**
   * Queries the Crypto price tracking telemetry API endpoint.
   * Target endpoint: GET /api/crypto
   */
  getCrypto: () => apiClient.get('/crypto'),

  /**
   * Queries the Tech News API endpoint for latest AI/software articles.
   * Target endpoint: GET /api/news
   */
  getNews: (refresh = false) => apiClient.get('/news', { params: { refresh } }),

  // --- Task Management ---
  getTasks: () => apiClient.get('/tasks'),
  createTask: (data) => apiClient.post('/tasks', data),
  updateTask: (id, data) => apiClient.patch(`/tasks/${id}`, data),
  deleteTask: (id) => apiClient.delete(`/tasks/${id}`)
}

export default services
