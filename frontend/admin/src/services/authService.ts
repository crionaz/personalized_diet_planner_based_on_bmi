import axios from 'axios'
import { User } from '@shared/index'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  loginAdmin: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials)
    console.log('AuthService login response:', response.data)
    return response.data.data // Return the data field which contains user, token, refreshToken
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/profile')
    console.log('AuthService getCurrentUser response:', response.data)
    return response.data.data.user // Return the user from data.user
  },

  logout: async () => {
    await api.post('/auth/logout')
    localStorage.removeItem('adminToken')
  },
}
