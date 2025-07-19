import axios, { AxiosResponse } from 'axios';
import { 
  User, 
  UpdateHealthMetricsRequest, 
  UpdateDietaryPreferencesRequest, 
  UpdateGoalsRequest,
  UpdateProfileRequest,
  ApiResponse 
} from '@shared/index';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class UserService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User }>> = await apiClient.get('/users/profile');
      console.log('Get profile response:', response.data);
      return response.data.data!.user;
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User }>> = await apiClient.put('/users/profile', data);
      console.log('Update profile response:', response.data);
      return response.data.data!.user;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  /**
   * Update health metrics
   */
  async updateHealthMetrics(data: UpdateHealthMetricsRequest): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User }>> = await apiClient.put('/users/health-metrics', data);
      console.log('Update health metrics response:', response.data);
      return response.data.data!.user;
    } catch (error: any) {
      console.error('Update health metrics error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update health metrics');
    }
  }

  /**
   * Update dietary preferences
   */
  async updateDietaryPreferences(data: UpdateDietaryPreferencesRequest): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User }>> = await apiClient.put('/users/preferences', data);
      console.log('Update dietary preferences response:', response.data);
      return response.data.data!.user;
    } catch (error: any) {
      console.error('Update dietary preferences error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update dietary preferences');
    }
  }

  /**
   * Update goals
   */
  async updateGoals(data: UpdateGoalsRequest): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User }>> = await apiClient.put('/users/goals', data);
      console.log('Update goals response:', response.data);
      return response.data.data!.user;
    } catch (error: any) {
      console.error('Update goals error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update goals');
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    try {
      await apiClient.delete('/users/account');
      console.log('Account deleted successfully');
    } catch (error: any) {
      console.error('Delete account error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete account');
    }
  }
}

export const userService = new UserService();
