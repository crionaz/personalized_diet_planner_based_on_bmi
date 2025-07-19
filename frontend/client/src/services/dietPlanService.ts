import axios from 'axios';
import { 
  DietPlan, 
  CreateDietPlanRequest, 
  DietPlanStats,
  DietPlanSearchQuery,
  NutritionalTargets
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

  // Helper: Calculate nutritional targets based on user data
  calculateNutritionalTargets(
    weight: number,
    height: number,
    age: number,
    gender: 'male' | 'female',
    activityLevel: string,
    goal: string,
    dietType: string = 'regular'
  ): NutritionalTargets {
    // Base metabolic rate calculation (Mifflin-St Jeor equation)
    let bmr = 0;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    // Activity level multiplier
    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    const activityMultiplier = activityMultipliers[activityLevel] || 1.2;
    let dailyCalories = Math.round(bmr * activityMultiplier);

    // Adjust based on goals
    if (goal === 'weight_loss') {
      dailyCalories -= 500; // 500 calorie deficit
    } else if (goal === 'weight_gain') {
      dailyCalories += 500; // 500 calorie surplus
    } else if (goal === 'muscle_gain') {
      dailyCalories += 300; // Moderate surplus
    }

    // Ensure minimum calories
    dailyCalories = Math.max(dailyCalories, 1200);

    // Macronutrient distribution based on diet type
    let proteinPercentage = 20;
    let carbsPercentage = 50;
    let fatPercentage = 30;

    switch (dietType) {
      case 'keto':
        proteinPercentage = 20;
        carbsPercentage = 10;
        fatPercentage = 70;
        break;
      case 'paleo':
        proteinPercentage = 25;
        carbsPercentage = 35;
        fatPercentage = 40;
        break;
      case 'mediterranean':
        proteinPercentage = 18;
        carbsPercentage = 45;
        fatPercentage = 37;
        break;
      case 'vegan':
      case 'vegetarian':
        proteinPercentage = 15;
        carbsPercentage = 60;
        fatPercentage = 25;
        break;
    }

    // Calculate macronutrients in grams
    const dailyProtein = Math.round((dailyCalories * proteinPercentage / 100) / 4); // 4 cal per gram
    const dailyCarbs = Math.round((dailyCalories * carbsPercentage / 100) / 4); // 4 cal per gram
    const dailyFat = Math.round((dailyCalories * fatPercentage / 100) / 9); // 9 cal per gram

    return {
      dailyCalories,
      dailyProtein,
      dailyCarbs,
      dailyFat,
      dailyFiber: Math.round(dailyCalories / 1000 * 14), // 14g per 1000 calories
      dailySodium: 2300, // WHO recommendation
      proteinPercentage,
      carbsPercentage,
      fatPercentage
    };
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

  // Helper: Calculate diet plan stats
  calculateDietPlanStats(dietPlan: DietPlan) {
    const totalMeals = dietPlan.meals.length;
    const completedMeals = dietPlan.meals.filter(meal => meal.isCompleted).length;
    const completionRate = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;

    // Calculate average daily nutrition
    const weekDays = [0, 1, 2, 3, 4, 5, 6];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSodium = 0;

    weekDays.forEach(day => {
      const dayMeals = dietPlan.meals.filter(meal => meal.dayOfWeek === day);
      dayMeals.forEach(meal => {
        if (meal.meal) {
          const nutrition = meal.meal.nutrition;
          const servings = meal.servings;
          totalCalories += nutrition.calories * servings;
          totalProtein += nutrition.protein * servings;
          totalCarbs += nutrition.carbs * servings;
          totalFat += nutrition.fat * servings;
          totalFiber += (nutrition.fiber || 0) * servings;
          totalSodium += (nutrition.sodium || 0) * servings;
        }
      });
    });

    const avgCalories = Math.round(totalCalories / 7);
    const avgProtein = Math.round(totalProtein / 7);
    const avgCarbs = Math.round(totalCarbs / 7);
    const avgFat = Math.round(totalFat / 7);
    const avgFiber = Math.round(totalFiber / 7);
    const avgSodium = Math.round(totalSodium / 7);

    // Calculate days left
    const now = new Date();
    const endDate = new Date(dietPlan.endDate);
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      totalPlans: 1,
      activePlans: dietPlan.isActive ? 1 : 0,
      completedMeals,
      totalMeals,
      averageCalories: avgCalories,
      nutritionalProgress: {
        calories: avgCalories,
        protein: avgProtein,
        carbs: avgCarbs,
        fat: avgFat,
        percentage: completionRate
      },
      weeklyProgress: [],
      extraStats: {
        daysLeft,
        isExpired: daysLeft === 0 && endDate < now,
        averageNutrition: {
          calories: avgCalories,
          protein: avgProtein,
          carbs: avgCarbs,
          fat: avgFat,
          fiber: avgFiber,
          sodium: avgSodium
        }
      }
    };
  },

  // Helper: Format meal time
  formatMealTime(mealType: string): string {
    const mealTimes: { [key: string]: string } = {
      breakfast: '8:00 AM',
      lunch: '12:00 PM',
      dinner: '6:00 PM',
      snack: '3:00 PM',
      dessert: '8:00 PM',
      drink: 'Anytime',
      appetizer: '5:30 PM',
      side_dish: 'With meal'
    };
    return mealTimes[mealType] || 'Anytime';
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
