import axios from 'axios'

// 1. DYNAMIC API CONFIGURATION & RETRIEVAL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

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
  getHealth: () => apiClient.get('/health')
}

export default services
