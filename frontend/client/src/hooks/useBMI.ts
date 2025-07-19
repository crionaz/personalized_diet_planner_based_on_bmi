import { useState, useCallback } from 'react';
import { bmiService } from '../services/bmiService';
import { 
  BMIRecord, 
  CalculateBMIRequest, 
  RecordBMIRequest, 
  BMICalculationResult, 
  BMIStats,
  PaginatedResponse 
} from '@shared/index';

interface UseBMIResult {
  // State
  loading: boolean;
  error: string | null;
  bmiResult: BMICalculationResult | null;
  bmiRecords: BMIRecord[];
  latestBMI: BMIRecord | null;
  bmiStats: BMIStats | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;

  // Actions
  calculateBMI: (data: CalculateBMIRequest) => Promise<BMICalculationResult>;
  recordBMI: (data: RecordBMIRequest) => Promise<BMIRecord>;
  getBMIHistory: (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => Promise<void>;
  getLatestBMI: () => Promise<void>;
  getBMIStats: () => Promise<void>;
  deleteBMIRecord: (id: string) => Promise<void>;
  clearError: () => void;
  clearResults: () => void;
}

export const useBMI = (): UseBMIResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bmiResult, setBmiResult] = useState<BMICalculationResult | null>(null);
  const [bmiRecords, setBmiRecords] = useState<BMIRecord[]>([]);
  const [latestBMI, setLatestBMI] = useState<BMIRecord | null>(null);
  const [bmiStats, setBmiStats] = useState<BMIStats | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResults = useCallback(() => {
    setBmiResult(null);
    setBmiRecords([]);
    setLatestBMI(null);
    setBmiStats(null);
    setPagination(null);
  }, []);

  const calculateBMI = useCallback(async (data: CalculateBMIRequest): Promise<BMICalculationResult> => {
    try {
      setLoading(true);
      setError(null);
      const result = await bmiService.calculateBMI(data);
      setBmiResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'BMI calculation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const recordBMI = useCallback(async (data: RecordBMIRequest): Promise<BMIRecord> => {
    try {
      setLoading(true);
      setError(null);
      const record = await bmiService.recordBMI(data);
      // Add to the beginning of the records array
      setBmiRecords(prev => [record, ...prev]);
      setLatestBMI(record);
      return record;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'BMI recording failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBMIHistory = useCallback(async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bmiService.getBMIHistory(params);
      setBmiRecords(response.data);
      setPagination(response.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get BMI history';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getLatestBMI = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const record = await bmiService.getLatestBMI();
      setLatestBMI(record);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get latest BMI';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getBMIStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await bmiService.getBMIStats();
      setBmiStats(stats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get BMI statistics';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBMIRecord = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await bmiService.deleteBMIRecord(id);
      // Remove from records array
      setBmiRecords(prev => prev.filter(record => record.id !== id));
      // Clear latest BMI if it matches the deleted record
      if (latestBMI?.id === id) {
        setLatestBMI(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete BMI record';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [latestBMI]);

  return {
    // State
    loading,
    error,
    bmiResult,
    bmiRecords,
    latestBMI,
    bmiStats,
    pagination,

    // Actions
    calculateBMI,
    recordBMI,
    getBMIHistory,
    getLatestBMI,
    getBMIStats,
    deleteBMIRecord,
    clearError,
    clearResults,
  };
};
