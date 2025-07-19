import axios, { AxiosResponse } from 'axios';
import { 
  BMIRecord, 
  CalculateBMIRequest, 
  RecordBMIRequest, 
  BMICalculationResult, 
  BMIStats,
  ApiResponse,
  PaginatedResponse 
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

export class BMIService {
  /**
   * Calculate BMI without saving
   */
  async calculateBMI(data: CalculateBMIRequest): Promise<BMICalculationResult> {
    try {
      const response: AxiosResponse<ApiResponse<BMICalculationResult>> = await apiClient.post('/bmi/calculate', data);
      console.log('BMI calculation response:', response.data);
      return response.data.data!;
    } catch (error: any) {
      console.error('BMI calculation error:', error);
      throw new Error(error.response?.data?.message || 'BMI calculation failed');
    }
  }

  /**
   * Record BMI measurement
   */
  async recordBMI(data: RecordBMIRequest): Promise<BMIRecord> {
    try {
      const response: AxiosResponse<ApiResponse<{ bmiRecord: BMIRecord }>> = await apiClient.post('/bmi/record', data);
      console.log('BMI record response:', response.data);
      return response.data.data!.bmiRecord;
    } catch (error: any) {
      console.error('BMI record error:', error);
      throw new Error(error.response?.data?.message || 'BMI recording failed');
    }
  }

  /**
   * Get BMI history with pagination
   */
  async getBMIHistory(params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<PaginatedResponse<BMIRecord>> {
    try {
      const response: AxiosResponse<ApiResponse<PaginatedResponse<BMIRecord>>> = await apiClient.get('/bmi/history', { params });
      console.log('BMI history response:', response.data);
      return response.data.data!;
    } catch (error: any) {
      console.error('BMI history error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get BMI history');
    }
  }

  /**
   * Get latest BMI record
   */
  async getLatestBMI(): Promise<BMIRecord> {
    try {
      const response: AxiosResponse<ApiResponse<{ bmiRecord: BMIRecord }>> = await apiClient.get('/bmi/latest');
      console.log('Latest BMI response:', response.data);
      return response.data.data!.bmiRecord;
    } catch (error: any) {
      console.error('Latest BMI error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get latest BMI');
    }
  }

  /**
   * Get BMI statistics
   */
  async getBMIStats(): Promise<BMIStats> {
    try {
      const response: AxiosResponse<ApiResponse<BMIStats>> = await apiClient.get('/bmi/stats');
      console.log('BMI stats response:', response.data);
      return response.data.data!;
    } catch (error: any) {
      console.error('BMI stats error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get BMI statistics');
    }
  }

  /**
   * Delete BMI record
   */
  async deleteBMIRecord(id: string): Promise<void> {
    try {
      await apiClient.delete(`/bmi/record/${id}`);
      console.log('BMI record deleted successfully');
    } catch (error: any) {
      console.error('BMI delete error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete BMI record');
    }
  }
}

export const bmiService = new BMIService();
