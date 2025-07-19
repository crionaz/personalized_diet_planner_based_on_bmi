import { useState, useEffect, useCallback } from 'react';
import { 
  Meal, 
  CreateMealRequest, 
  MealSearchQuery, 
  PaginatedResponse, 
  NutritionInfo, 
  MealCategory 
} from '../types';
import { MealService } from '../services/mealService';

interface UseMealReturn {
  // State
  meals: Meal[];
  currentMeal: Meal | null;
  myMeals: Meal[];
  categories: MealCategory[];
  nutritionPerServing: NutritionInfo | null;
  pagination: PaginatedResponse<Meal>['pagination'] | null;
  loading: boolean;
  error: string | null;

  // Actions
  getMeals: (query?: MealSearchQuery) => Promise<void>;
  getMealById: (id: string) => Promise<void>;
  createMeal: (mealData: CreateMealRequest) => Promise<Meal | null>;
  updateMeal: (id: string, mealData: Partial<CreateMealRequest>) => Promise<Meal | null>;
  deleteMeal: (id: string) => Promise<boolean>;
  getMyMeals: (page?: number, limit?: number) => Promise<void>;
  searchMeals: (searchTerm: string, filters?: Partial<MealSearchQuery>) => Promise<void>;
  getMealsByCategory: (category: MealCategory, query?: Partial<MealSearchQuery>) => Promise<void>;
  getMealsByDifficulty: (difficulty: 'easy' | 'medium' | 'hard', query?: Partial<MealSearchQuery>) => Promise<void>;
  getMealsForDiet: (dietType: string, query?: Partial<MealSearchQuery>) => Promise<void>;
  getFeaturedMeals: (limit?: number) => Promise<void>;
  getNutritionPerServing: (id: string) => Promise<void>;
  clearError: () => void;
  clearCurrentMeal: () => void;
}

export const useMeal = (): UseMealReturn => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [currentMeal, setCurrentMeal] = useState<Meal | null>(null);
  const [myMeals, setMyMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<MealCategory[]>([]);
  const [nutritionPerServing, setNutritionPerServing] = useState<NutritionInfo | null>(null);
  const [pagination, setPagination] = useState<PaginatedResponse<Meal>['pagination'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories on hook initialization
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await MealService.getMealCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Failed to load meal categories:', err);
      }
    };
    loadCategories();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCurrentMeal = useCallback(() => {
    setCurrentMeal(null);
    setNutritionPerServing(null);
  }, []);

  const getMeals = useCallback(async (query?: MealSearchQuery) => {
    try {
      setLoading(true);
      setError(null);
      const response = await MealService.getMeals(query);
      setMeals(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch meals');
    } finally {
      setLoading(false);
    }
  }, []);

  const getMealById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const meal = await MealService.getMealById(id);
      setCurrentMeal(meal);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch meal');
    } finally {
      setLoading(false);
    }
  }, []);

  const createMeal = useCallback(async (mealData: CreateMealRequest): Promise<Meal | null> => {
    try {
      setLoading(true);
      setError(null);
      const newMeal = await MealService.createMeal(mealData);
      
      // Add to meals list if it's a public meal
      if (newMeal.isPublic) {
        setMeals(prev => [newMeal, ...prev]);
      }
      
      // Add to user's meals
      setMyMeals(prev => [newMeal, ...prev]);
      
      return newMeal;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create meal');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMeal = useCallback(async (
    id: string, 
    mealData: Partial<CreateMealRequest>
  ): Promise<Meal | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedMeal = await MealService.updateMeal(id, mealData);
      
      // Update in meals list
      setMeals(prev => prev.map(meal => 
        meal.id === id ? updatedMeal : meal
      ));
      
      // Update in user's meals
      setMyMeals(prev => prev.map(meal => 
        meal.id === id ? updatedMeal : meal
      ));
      
      // Update current meal if it's the same
      if (currentMeal?.id === id) {
        setCurrentMeal(updatedMeal);
      }
      
      return updatedMeal;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update meal');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentMeal]);

  const deleteMeal = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await MealService.deleteMeal(id);
      
      // Remove from meals list
      setMeals(prev => prev.filter(meal => meal.id !== id));
      
      // Remove from user's meals
      setMyMeals(prev => prev.filter(meal => meal.id !== id));
      
      // Clear current meal if it's the deleted one
      if (currentMeal?.id === id) {
        setCurrentMeal(null);
        setNutritionPerServing(null);
      }
      
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete meal');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentMeal]);

  const getMyMeals = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const response = await MealService.getMyMeals(page, limit);
      setMyMeals(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch your meals');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchMeals = useCallback(async (
    searchTerm: string, 
    filters?: Partial<MealSearchQuery>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await MealService.searchMeals(searchTerm, filters);
      setMeals(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search meals');
    } finally {
      setLoading(false);
    }
  }, []);

  const getMealsByCategory = useCallback(async (
    category: MealCategory, 
    query?: Partial<MealSearchQuery>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await MealService.getMealsByCategory(category, query);
      setMeals(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch meals by category');
    } finally {
      setLoading(false);
    }
  }, []);

  const getMealsByDifficulty = useCallback(async (
    difficulty: 'easy' | 'medium' | 'hard', 
    query?: Partial<MealSearchQuery>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await MealService.getMealsByDifficulty(difficulty, query);
      setMeals(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch meals by difficulty');
    } finally {
      setLoading(false);
    }
  }, []);

  const getMealsForDiet = useCallback(async (
    dietType: string, 
    query?: Partial<MealSearchQuery>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await MealService.getMealsForDiet(dietType, query);
      setMeals(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch meals for diet');
    } finally {
      setLoading(false);
    }
  }, []);

  const getFeaturedMeals = useCallback(async (limit = 6) => {
    try {
      setLoading(true);
      setError(null);
      const response = await MealService.getFeaturedMeals(limit);
      setMeals(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch featured meals');
    } finally {
      setLoading(false);
    }
  }, []);

  const getNutritionPerServing = useCallback(async (id: string) => {
    try {
      setError(null);
      const nutrition = await MealService.getNutritionPerServing(id);
      setNutritionPerServing(nutrition);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch nutrition information');
    }
  }, []);

  return {
    // State
    meals,
    currentMeal,
    myMeals,
    categories,
    nutritionPerServing,
    pagination,
    loading,
    error,

    // Actions
    getMeals,
    getMealById,
    createMeal,
    updateMeal,
    deleteMeal,
    getMyMeals,
    searchMeals,
    getMealsByCategory,
    getMealsByDifficulty,
    getMealsForDiet,
    getFeaturedMeals,
    getNutritionPerServing,
    clearError,
    clearCurrentMeal,
  };
};

export default useMeal;
