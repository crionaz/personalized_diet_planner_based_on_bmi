import axios from 'axios';
import { 
  Meal, 
  CreateMealRequest, 
  MealSearchQuery, 
  ApiResponse, 
  PaginatedResponse,
  NutritionInfo,
  MealCategory 
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class MealService {
  /**
   * Get meals with filtering and pagination
   */
  static async getMeals(query?: MealSearchQuery): Promise<PaginatedResponse<Meal>> {
    const params = new URLSearchParams();
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await api.get<ApiResponse<Meal[]>>(`/meals?${params.toString()}`);
    return response.data as any; // Cast to match pagination structure
  }

  /**
   * Get meal by ID
   */
  static async getMealById(id: string): Promise<Meal> {
    const response = await api.get<ApiResponse<Meal>>(`/meals/${id}`);
    return response.data.data!;
  }

  /**
   * Create a new meal
   */
  static async createMeal(mealData: CreateMealRequest): Promise<Meal> {
    const response = await api.post<ApiResponse<Meal>>('/meals', mealData);
    return response.data.data!;
  }

  /**
   * Update existing meal
   */
  static async updateMeal(id: string, mealData: Partial<CreateMealRequest>): Promise<Meal> {
    const response = await api.put<ApiResponse<Meal>>(`/meals/${id}`, mealData);
    return response.data.data!;
  }

  /**
   * Delete meal
   */
  static async deleteMeal(id: string): Promise<void> {
    await api.delete(`/meals/${id}`);
  }

  /**
   * Get current user's meals
   */
  static async getMyMeals(page = 1, limit = 10): Promise<PaginatedResponse<Meal>> {
    const response = await api.get<ApiResponse<Meal[]>>(`/meals/my?page=${page}&limit=${limit}`);
    return response.data as any;
  }

  /**
   * Get meal categories
   */
  static async getMealCategories(): Promise<MealCategory[]> {
    const response = await api.get<ApiResponse<MealCategory[]>>('/meals/categories');
    return response.data.data!;
  }

  /**
   * Get nutrition information per serving
   */
  static async getNutritionPerServing(id: string): Promise<NutritionInfo> {
    const response = await api.get<ApiResponse<NutritionInfo>>(`/meals/${id}/nutrition-per-serving`);
    return response.data.data!;
  }

  /**
   * Search meals by term
   */
  static async searchMeals(searchTerm: string, filters?: Partial<MealSearchQuery>): Promise<PaginatedResponse<Meal>> {
    return this.getMeals({
      search: searchTerm,
      ...filters
    });
  }

  /**
   * Get meals by category
   */
  static async getMealsByCategory(category: MealCategory, query?: Partial<MealSearchQuery>): Promise<PaginatedResponse<Meal>> {
    return this.getMeals({
      category,
      ...query
    });
  }

  /**
   * Get meals by difficulty
   */
  static async getMealsByDifficulty(difficulty: 'easy' | 'medium' | 'hard', query?: Partial<MealSearchQuery>): Promise<PaginatedResponse<Meal>> {
    return this.getMeals({
      difficulty,
      ...query
    });
  }

  /**
   * Get meals compatible with diet type
   */
  static async getMealsForDiet(dietType: string, query?: Partial<MealSearchQuery>): Promise<PaginatedResponse<Meal>> {
    return this.getMeals({
      dietType,
      ...query
    });
  }

  /**
   * Get meals within calorie range
   */
  static async getMealsByCalories(
    caloriesMin?: number, 
    caloriesMax?: number, 
    query?: Partial<MealSearchQuery>
  ): Promise<PaginatedResponse<Meal>> {
    return this.getMeals({
      caloriesMin,
      caloriesMax,
      ...query
    });
  }

  /**
   * Get quick meals (under 30 minutes total time)
   */
  static async getQuickMeals(query?: Partial<MealSearchQuery>): Promise<PaginatedResponse<Meal>> {
    return this.getMeals({
      prepTimeMax: 15,
      cookTimeMax: 15,
      ...query
    });
  }

  /**
   * Get featured public meals
   */
  static async getFeaturedMeals(limit = 6): Promise<PaginatedResponse<Meal>> {
    return this.getMeals({
      isPublic: true,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  }
}

export default MealService;
