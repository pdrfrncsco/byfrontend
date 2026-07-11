import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise: Promise<string | null> | null = null

function clearSession() {
  localStorage.removeItem('bolayetu_token')
  localStorage.removeItem('bolayetu_user')
  localStorage.removeItem('bolayetu_refresh')
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('bolayetu_refresh')

  if (!refreshToken) {
    return null
  }

  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<{ data: { access: string } }>('/auth/token/refresh/', {
        refresh: refreshToken,
      })
      .then(response => {
        const accessToken = response.data.data.access
        localStorage.setItem('bolayetu_token', accessToken)
        return accessToken
      })
      .catch(() => {
        clearSession()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

// Request interceptor - add auth token
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('bolayetu_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error),
)

// Response interceptor - handle errors
client.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true

      const accessToken = await refreshAccessToken()
      if (accessToken) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return client(originalRequest)
      }

      clearSession()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    if (error.response?.status === 403) {
      // Handle forbidden
      console.error('Access forbidden')
    }

    return Promise.reject(error)
  },
)

export default client
