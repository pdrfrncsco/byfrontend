import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
client.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth:token')
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
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear auth and redirect to login
      localStorage.removeItem('auth:token')
      localStorage.removeItem('auth:user')
      window.location.href = '/login'
    }

    if (error.response?.status === 403) {
      // Handle forbidden
      console.error('Access forbidden')
    }

    return Promise.reject(error)
  },
)

export default client
