import { useState, useEffect, useCallback } from 'react';
import { trackingService } from '../services/trackingService';
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

interface UseFoodTrackingResult {
  foodEntries: FoodEntry[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  fetchFoodEntries: (params?: FoodEntrySearchQuery) => Promise<void>;
  createFoodEntry: (data: CreateFoodEntryRequest) => Promise<FoodEntry>;
  deleteFoodEntry: (id: string) => Promise<void>;
  refreshEntries: () => Promise<void>;
}

interface UseDailyNutritionResult {
  nutrition: DailyNutritionSummary | null;
  loading: boolean;
  error: string | null;
  fetchDailyNutrition: (date: string) => Promise<void>;
  refreshNutrition: () => Promise<void>;
  currentDate: string;
  setCurrentDate: (date: string) => void;
}

interface UseWaterTrackingResult {
  waterIntake: DailyWaterSummary | null;
  loading: boolean;
  error: string | null;
  addWaterIntake: (amount: number, notes?: string) => Promise<void>;
  fetchDailyWater: (date: string) => Promise<void>;
  refreshWater: () => Promise<void>;
  currentDate: string;
  setCurrentDate: (date: string) => void;
}

interface UseTrackingStatsResult {
  stats: TrackingStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

// Hook for food tracking
export const useFoodTracking = (): UseFoodTrackingResult => {
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const fetchFoodEntries = useCallback(async (params: FoodEntrySearchQuery = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await trackingService.getFoodEntries(params);
      setFoodEntries(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch food entries');
    } finally {
      setLoading(false);
    }
  }, []);

  const createFoodEntry = useCallback(async (data: CreateFoodEntryRequest): Promise<FoodEntry> => {
    setError(null);
    try {
      const newEntry = await trackingService.createFoodEntry(data);
      await fetchFoodEntries(); // Refresh the list
      return newEntry;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create food entry');
      throw err;
    }
  }, [fetchFoodEntries]);

  const deleteFoodEntry = useCallback(async (id: string): Promise<void> => {
    setError(null);
    try {
      await trackingService.deleteFoodEntry(id);
      await fetchFoodEntries(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete food entry');
      throw err;
    }
  }, [fetchFoodEntries]);

  const refreshEntries = useCallback(async () => {
    await fetchFoodEntries();
  }, [fetchFoodEntries]);

  return {
    foodEntries,
    loading,
    error,
    pagination,
    fetchFoodEntries,
    createFoodEntry,
    deleteFoodEntry,
    refreshEntries,
  };
};

// Hook for daily nutrition tracking
export const useDailyNutrition = (): UseDailyNutritionResult => {
  const [nutrition, setNutrition] = useState<DailyNutritionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>(trackingService.getTodayDate());

  const fetchDailyNutrition = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await trackingService.getDailyNutrition(date);
      setNutrition(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch daily nutrition');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshNutrition = useCallback(async () => {
    await fetchDailyNutrition(currentDate);
  }, [fetchDailyNutrition, currentDate]);

  useEffect(() => {
    fetchDailyNutrition(currentDate);
  }, [currentDate, fetchDailyNutrition]);

  return {
    nutrition,
    loading,
    error,
    fetchDailyNutrition,
    refreshNutrition,
    currentDate,
    setCurrentDate,
  };
};

// Hook for water tracking
export const useWaterTracking = (): UseWaterTrackingResult => {
  const [waterIntake, setWaterIntake] = useState<DailyWaterSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string>(trackingService.getTodayDate());

  const fetchDailyWater = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await trackingService.getDailyWaterIntake(date);
      setWaterIntake(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch water intake');
    } finally {
      setLoading(false);
    }
  }, []);

  const addWaterIntake = useCallback(async (amount: number, notes?: string) => {
    setError(null);
    try {
      await trackingService.createWaterIntake({ amount, notes });
      await fetchDailyWater(currentDate); // Refresh
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add water intake');
      throw err;
    }
  }, [fetchDailyWater, currentDate]);

  const refreshWater = useCallback(async () => {
    await fetchDailyWater(currentDate);
  }, [fetchDailyWater, currentDate]);

  useEffect(() => {
    fetchDailyWater(currentDate);
  }, [currentDate, fetchDailyWater]);

  return {
    waterIntake,
    loading,
    error,
    addWaterIntake,
    fetchDailyWater,
    refreshWater,
    currentDate,
    setCurrentDate,
  };
};

// Hook for tracking statistics
export const useTrackingStats = (): UseTrackingStatsResult => {
  const [stats, setStats] = useState<TrackingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trackingService.getTrackingStats();
      setStats(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tracking stats');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
    refreshStats,
  };
};
