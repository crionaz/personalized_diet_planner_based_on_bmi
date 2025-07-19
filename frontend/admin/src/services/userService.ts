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

export const userService = {
  getAllUsers: async (params: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get('/admin/users', { params })
    return response.data
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await api.post('/admin/users', userData)
    return response.data
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/admin/users/${id}`, data)
    return response.data
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`)
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get(`/admin/users/${id}`)
    return response.data
  },

  updateUserRole: async (id: string, role: string): Promise<User> => {
    const response = await api.patch(`/admin/users/${id}/role`, { role })
    return response.data
  },

  toggleUserStatus: async (id: string): Promise<User> => {
    const response = await api.patch(`/admin/users/${id}/toggle-status`)
    return response.data
  },
}
