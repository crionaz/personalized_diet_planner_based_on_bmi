import axios, { AxiosResponse } from 'axios';
import { LoginRequest, RegisterRequest, User, AuthResponse } from '@shared/index';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
class TokenManager {
  private accessToken: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
  }

  getAccessToken(): string | null {
    if (!this.accessToken) {
      this.accessToken = localStorage.getItem('accessToken');
    }
    return this.accessToken;
  }

  clearTokens() {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
  }
}

const tokenManager = new TokenManager();

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        
        const { token } = response.data.data;
        tokenManager.setAccessToken(token);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        tokenManager.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<any> = await apiClient.post('/auth/login', credentials);
      console.log('Client AuthService login response:', response.data);
      
      // Extract token from the nested data structure
      const token = response.data.data.token;
      tokenManager.setAccessToken(token);
      
      // Return the properly structured data
      return {
        user: response.data.data.user,
        token,
        refreshToken: response.data.data.refreshToken
      };
    } catch (error: any) {
      console.error('Client login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<any> = await apiClient.post('/auth/register', userData);
      console.log('Client AuthService register response:', response.data);
      
      // Extract token from the nested data structure
      const token = response.data.data.token;
      tokenManager.setAccessToken(token);
      
      // Return the properly structured data
      return {
        user: response.data.data.user,
        token,
        refreshToken: response.data.data.refreshToken
      };
    } catch (error: any) {
      console.error('Client register error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with local logout even if server request fails
      console.error('Logout request failed:', error);
    } finally {
      tokenManager.clearTokens();
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<any> = await apiClient.post('/auth/refresh-token');
      console.log('Client AuthService refreshToken response:', response.data);
      
      // Extract token from the nested data structure
      const token = response.data.data.token;
      tokenManager.setAccessToken(token);
      
      // Return the properly structured data
      return {
        user: response.data.data.user,
        token,
        refreshToken: response.data.data.refreshToken
      };
    } catch (error: any) {
      console.error('Client refreshToken error:', error);
      tokenManager.clearTokens();
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<any> = await apiClient.get('/auth/profile');
      console.log('Client AuthService getCurrentUser response:', response.data);
      return response.data.data.user; // Return the user from data.user
    } catch (error: any) {
      console.error('Client getCurrentUser error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get user profile');
    }
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const response: AxiosResponse<any> = await apiClient.put('/auth/profile', profileData);
      console.log('Client AuthService updateProfile response:', response.data);
      return response.data.data.user; // Return the user from data.user
    } catch (error: any) {
      console.error('Client updateProfile error:', error);
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<void> {
    try {
      await apiClient.put('/auth/password', passwordData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!tokenManager.getAccessToken();
  }
}

export const authService = new AuthService();
export { apiClient };
