import axios from 'axios';
import { 
  DietPlan, 
  CreateDietPlanRequest, 
  DietPlanSearchQuery,
  NutritionalTargets
} from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DailyNutritionResponse {
  dayOfWeek: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
  };
  targets: NutritionalTargets;
}

export const dietPlanService = {
  // Create a new diet plan
  async createDietPlan(data: CreateDietPlanRequest): Promise<DietPlan> {
    const response = await api.post<ApiResponse<DietPlan>>('/diet-plans', data);
    return response.data.data;
  },

  // Get user's diet plans
  async getDietPlans(params: DietPlanSearchQuery = {}): Promise<PaginatedResponse<DietPlan>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get<PaginatedResponse<DietPlan>>(
      `/diet-plans?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get active diet plan
  async getActiveDietPlan(): Promise<DietPlan | null> {
    try {
      const response = await api.get<ApiResponse<DietPlan>>('/diet-plans/active');
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Get diet plan by ID
  async getDietPlanById(id: string): Promise<DietPlan> {
    const response = await api.get<ApiResponse<DietPlan>>(`/diet-plans/${id}`);
    return response.data.data;
  },

  // Mark meal as completed
  async markMealCompleted(
    dietPlanId: string, 
    mealId: string, 
    completed: boolean = true
  ): Promise<DietPlan> {
    const response = await api.patch<ApiResponse<DietPlan>>(
      `/diet-plans/${dietPlanId}/meals/${mealId}/complete`,
      { completed }
    );
    return response.data.data;
  },

  // Get daily nutrition for specific day
  async getDailyNutrition(dietPlanId: string, dayOfWeek: number): Promise<DailyNutritionResponse> {
    const response = await api.get<ApiResponse<DailyNutritionResponse>>(
      `/diet-plans/${dietPlanId}/nutrition/${dayOfWeek}`
    );
    return response.data.data;
  },

  // Delete diet plan
  async deleteDietPlan(id: string): Promise<void> {
    await api.delete(`/diet-plans/${id}`);
  },

  // Helper: Get week days
  getWeekDays(): { value: number; label: string; short: string }[] {
    return [
      { value: 0, label: 'Sunday', short: 'Sun' },
      { value: 1, label: 'Monday', short: 'Mon' },
      { value: 2, label: 'Tuesday', short: 'Tue' },
      { value: 3, label: 'Wednesday', short: 'Wed' },
      { value: 4, label: 'Thursday', short: 'Thu' },
      { value: 5, label: 'Friday', short: 'Fri' },
      { value: 6, label: 'Saturday', short: 'Sat' }
    ];
  },

  // Helper: Get meal type color
  getMealTypeColor(mealType: string): string {
    const colors: { [key: string]: string } = {
      breakfast: 'bg-yellow-100 text-yellow-800',
      lunch: 'bg-blue-100 text-blue-800',
      dinner: 'bg-purple-100 text-purple-800',
      snack: 'bg-green-100 text-green-800',
      dessert: 'bg-pink-100 text-pink-800',
      drink: 'bg-cyan-100 text-cyan-800',
      appetizer: 'bg-orange-100 text-orange-800',
      side_dish: 'bg-gray-100 text-gray-800'
    };
    return colors[mealType] || 'bg-gray-100 text-gray-800';
  }
};
