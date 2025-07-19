import { useState, useEffect, useCallback } from 'react';
import { dietPlanService, DailyNutritionResponse } from '../services/dietPlanService';
import { DietPlan, CreateDietPlanRequest, DietPlanSearchQuery } from '../types';

interface UseDietPlansResult {
  dietPlans: DietPlan[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  fetchDietPlans: (params?: DietPlanSearchQuery) => Promise<void>;
  createDietPlan: (data: CreateDietPlanRequest) => Promise<DietPlan>;
  deleteDietPlan: (id: string) => Promise<void>;
  refreshDietPlans: () => Promise<void>;
}

interface UseActiveDietPlanResult {
  activePlan: DietPlan | null;
  loading: boolean;
  error: string | null;
  refreshActivePlan: () => Promise<void>;
  markMealCompleted: (mealId: string, completed?: boolean) => Promise<void>;
  getDailyNutrition: (dayOfWeek: number) => Promise<DailyNutritionResponse>;
}

interface UseDietPlanResult {
  dietPlan: DietPlan | null;
  loading: boolean;
  error: string | null;
  fetchDietPlan: (id: string) => Promise<void>;
  markMealCompleted: (mealId: string, completed?: boolean) => Promise<void>;
  getDailyNutrition: (dayOfWeek: number) => Promise<DailyNutritionResponse>;
}

// Hook for managing multiple diet plans
export const useDietPlans = (): UseDietPlansResult => {
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchDietPlans = useCallback(async (params: DietPlanSearchQuery = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dietPlanService.getDietPlans(params);
      setDietPlans(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch diet plans');
    } finally {
      setLoading(false);
    }
  }, []);

  const createDietPlan = useCallback(async (data: CreateDietPlanRequest): Promise<DietPlan> => {
    setLoading(true);
    setError(null);
    try {
      const newPlan = await dietPlanService.createDietPlan(data);
      await fetchDietPlans(); // Refresh the list
      return newPlan;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create diet plan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDietPlans]);

  const deleteDietPlan = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await dietPlanService.deleteDietPlan(id);
      await fetchDietPlans(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete diet plan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDietPlans]);

  const refreshDietPlans = useCallback(async () => {
    await fetchDietPlans();
  }, [fetchDietPlans]);

  return {
    dietPlans,
    loading,
    error,
    pagination,
    fetchDietPlans,
    createDietPlan,
    deleteDietPlan,
    refreshDietPlans,
  };
};

// Hook for managing active diet plan
export const useActiveDietPlan = (): UseActiveDietPlanResult => {
  const [activePlan, setActivePlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshActivePlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const plan = await dietPlanService.getActiveDietPlan();
      setActivePlan(plan);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch active diet plan');
    } finally {
      setLoading(false);
    }
  }, []);

  const markMealCompleted = useCallback(async (mealId: string, completed: boolean = true) => {
    if (!activePlan) return;
    
    setError(null);
    try {
      const updatedPlan = await dietPlanService.markMealCompleted(
        activePlan.id, 
        mealId, 
        completed
      );
      setActivePlan(updatedPlan);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update meal completion');
      throw err;
    }
  }, [activePlan]);

  const getDailyNutrition = useCallback(async (dayOfWeek: number): Promise<DailyNutritionResponse> => {
    if (!activePlan) {
      throw new Error('No active diet plan');
    }
    
    try {
      return await dietPlanService.getDailyNutrition(activePlan.id, dayOfWeek);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch daily nutrition');
      throw err;
    }
  }, [activePlan]);

  useEffect(() => {
    refreshActivePlan();
  }, [refreshActivePlan]);

  return {
    activePlan,
    loading,
    error,
    refreshActivePlan,
    markMealCompleted,
    getDailyNutrition,
  };
};

// Hook for managing a specific diet plan
export const useDietPlan = (): UseDietPlanResult => {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDietPlan = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const plan = await dietPlanService.getDietPlanById(id);
      setDietPlan(plan);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch diet plan');
    } finally {
      setLoading(false);
    }
  }, []);

  const markMealCompleted = useCallback(async (mealId: string, completed: boolean = true) => {
    if (!dietPlan) return;
    
    setError(null);
    try {
      const updatedPlan = await dietPlanService.markMealCompleted(
        dietPlan.id, 
        mealId, 
        completed
      );
      setDietPlan(updatedPlan);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update meal completion');
      throw err;
    }
  }, [dietPlan]);

  const getDailyNutrition = useCallback(async (dayOfWeek: number): Promise<DailyNutritionResponse> => {
    if (!dietPlan) {
      throw new Error('No diet plan loaded');
    }
    
    try {
      return await dietPlanService.getDailyNutrition(dietPlan.id, dayOfWeek);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch daily nutrition');
      throw err;
    }
  }, [dietPlan]);

  return {
    dietPlan,
    loading,
    error,
    fetchDietPlan,
    markMealCompleted,
    getDailyNutrition,
  };
};
