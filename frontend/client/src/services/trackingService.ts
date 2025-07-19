import axios from 'axios';
import { 
  FoodEntry, 
  CreateFoodEntryRequest, 
  FoodEntrySearchQuery,
  DailyNutritionSummary,
  TrackingStats,
  WaterIntake,
  CreateWaterIntakeRequest,
  DailyWaterSummary
} from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
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

export const trackingService = {
  // Food tracking
  async createFoodEntry(data: CreateFoodEntryRequest): Promise<FoodEntry> {
    const response = await api.post<ApiResponse<FoodEntry>>('/tracking/food', data);
    return response.data.data;
  },

  async getFoodEntries(params: FoodEntrySearchQuery = {}): Promise<PaginatedResponse<FoodEntry>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.date) queryParams.append('date', params.date);
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    if (params.mealType) queryParams.append('mealType', params.mealType);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await api.get<PaginatedResponse<FoodEntry>>(
      `/tracking/food?${queryParams.toString()}`
    );
    return response.data;
  },

  async deleteFoodEntry(id: string): Promise<void> {
    await api.delete(`/tracking/food/${id}`);
  },

  async getDailyNutrition(date: string): Promise<DailyNutritionSummary> {
    const response = await api.get<ApiResponse<DailyNutritionSummary>>(
      `/tracking/nutrition/daily/${date}`
    );
    return response.data.data;
  },

  async getTrackingStats(): Promise<TrackingStats> {
    const response = await api.get<ApiResponse<TrackingStats>>('/tracking/stats');
    return response.data.data;
  },

  // Water tracking
  async createWaterIntake(data: CreateWaterIntakeRequest): Promise<WaterIntake> {
    const response = await api.post<ApiResponse<WaterIntake>>('/tracking/water', data);
    return response.data.data;
  },

  async getDailyWaterIntake(date: string): Promise<DailyWaterSummary> {
    const response = await api.get<ApiResponse<DailyWaterSummary>>(
      `/tracking/water/daily/${date}`
    );
    return response.data.data;
  },

  // Helper functions
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  },

  getTodayDate(): string {
    return this.formatDate(new Date());
  },

  getYesterdayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.formatDate(yesterday);
  },

  getWeekRange(date: Date = new Date()): { start: string; end: string } {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay()); // Sunday
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Saturday
    
    return {
      start: this.formatDate(start),
      end: this.formatDate(end)
    };
  },

  getMealTypeColor(mealType: string): string {
    const colors: { [key: string]: string } = {
      breakfast: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      lunch: 'bg-blue-100 text-blue-800 border-blue-200',
      dinner: 'bg-purple-100 text-purple-800 border-purple-200',
      snack: 'bg-green-100 text-green-800 border-green-200',
      dessert: 'bg-pink-100 text-pink-800 border-pink-200',
      drink: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      appetizer: 'bg-orange-100 text-orange-800 border-orange-200',
      side_dish: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[mealType] || 'bg-gray-100 text-gray-800 border-gray-200';
  },

  getMealTypeIcon(mealType: string): string {
    const icons: { [key: string]: string } = {
      breakfast: '🍳',
      lunch: '🥗',
      dinner: '🍽️',
      snack: '🍎',
      dessert: '🍰',
      drink: '🥤',
      appetizer: '🥨',
      side_dish: '🥔'
    };
    return icons[mealType] || '🍽️';
  },

  formatMealTime(mealType: string): string {
    const times: { [key: string]: string } = {
      breakfast: '8:00 AM',
      lunch: '12:00 PM',
      dinner: '6:00 PM',
      snack: '3:00 PM',
      dessert: '8:00 PM',
      drink: 'Anytime',
      appetizer: '5:30 PM',
      side_dish: 'With meal'
    };
    return times[mealType] || 'Anytime';
  },

  calculateCalorieProgress(consumed: number, target: number): {
    percentage: number;
    status: 'under' | 'perfect' | 'over';
    remaining: number;
  } {
    const percentage = Math.round((consumed / target) * 100);
    let status: 'under' | 'perfect' | 'over' = 'under';
    
    if (percentage >= 95 && percentage <= 105) {
      status = 'perfect';
    } else if (percentage > 105) {
      status = 'over';
    }
    
    return {
      percentage: Math.min(percentage, 150), // Cap at 150% for display
      status,
      remaining: Math.max(0, target - consumed)
    };
  },

  calculateMacroBalance(nutrition: DailyNutritionSummary): {
    protein: number;
    carbs: number;
    fat: number;
    isBalanced: boolean;
  } {
    const totalCalories = nutrition.totalCalories;
    if (totalCalories === 0) {
      return { protein: 0, carbs: 0, fat: 0, isBalanced: false };
    }

    // Calculate percentages (protein and carbs = 4 cal/g, fat = 9 cal/g)
    const proteinPercentage = Math.round((nutrition.totalProtein * 4 / totalCalories) * 100);
    const carbsPercentage = Math.round((nutrition.totalCarbs * 4 / totalCalories) * 100);
    const fatPercentage = Math.round((nutrition.totalFat * 9 / totalCalories) * 100);

    // Check if balanced (rough guidelines: 15-25% protein, 45-65% carbs, 20-35% fat)
    const isBalanced = 
      proteinPercentage >= 15 && proteinPercentage <= 25 &&
      carbsPercentage >= 45 && carbsPercentage <= 65 &&
      fatPercentage >= 20 && fatPercentage <= 35;

    return {
      protein: proteinPercentage,
      carbs: carbsPercentage,
      fat: fatPercentage,
      isBalanced
    };
  },

  getWaterIntakeRecommendation(amount: number): {
    status: 'low' | 'good' | 'excellent';
    message: string;
    color: string;
  } {
    if (amount < 1500) {
      return {
        status: 'low',
        message: 'Drink more water to stay hydrated',
        color: 'text-red-600'
      };
    } else if (amount < 2500) {
      return {
        status: 'good',
        message: 'Good hydration level',
        color: 'text-green-600'
      };
    } else {
      return {
        status: 'excellent',
        message: 'Excellent hydration!',
        color: 'text-blue-600'
      };
    }
  },

  // Quick add presets
  getQuickAddWaterAmounts(): { amount: number; label: string; icon: string }[] {
    return [
      { amount: 250, label: 'Glass', icon: '🥛' },
      { amount: 500, label: 'Bottle', icon: '💧' },
      { amount: 350, label: 'Cup', icon: '☕' },
      { amount: 750, label: 'Large Bottle', icon: '🍼' }
    ];
  },

  getQuickAddFoodPresets(): CreateFoodEntryRequest[] {
    return [
      {
        customFood: {
          name: 'Apple',
          nutrition: {
            calories: 95,
            protein: 0.5,
            carbs: 25,
            fat: 0.3,
            fiber: 4,
            sugar: 19,
            sodium: 2
          },
          servingSize: { amount: 1, unit: 'medium apple' }
        },
        mealType: 'snack' as any,
        servings: 1
      },
      {
        customFood: {
          name: 'Banana',
          nutrition: {
            calories: 105,
            protein: 1.3,
            carbs: 27,
            fat: 0.4,
            fiber: 3,
            sugar: 14,
            sodium: 1
          },
          servingSize: { amount: 1, unit: 'medium banana' }
        },
        mealType: 'snack' as any,
        servings: 1
      }
    ];
  }
};
