import axios from 'axios'

// Priority:
//   1. window.APP_CONFIG.API_URL  — runtime config injected by config.js (set at serve time)
//   2. VITE_API_URL env var       — baked in at build time by Vite
//   3. /api/v1                    — relative fallback (only works behind a reverse proxy)
const API_URL = window.APP_CONFIG?.API_URL || import.meta.env.VITE_API_URL || '/api/v1'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Singleton refresh promise — prevents the thundering-herd race where
// N concurrent 401 responses each try to exchange the refresh token,
// causing all but the first to fail (token already consumed) and log
// the user out unexpectedly.
let _refreshPromise = null

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        if (!_refreshPromise) {
          _refreshPromise = axios
            .post(`${API_URL}/auth/refresh`, { refresh_token: refresh })
            .then(({ data }) => {
              localStorage.setItem('access_token', data.access_token)
              if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
              return data.access_token
            })
            .catch((err) => {
              localStorage.removeItem('access_token')
              localStorage.removeItem('refresh_token')
              window.dispatchEvent(new CustomEvent('auth:expired'))
              throw err
            })
            .finally(() => {
              _refreshPromise = null
            })
        }
        try {
          const newToken = await _refreshPromise
          original.headers.Authorization = `Bearer ${newToken}`
          return apiClient(original)
        } catch {
          return Promise.reject(error)
        }
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
