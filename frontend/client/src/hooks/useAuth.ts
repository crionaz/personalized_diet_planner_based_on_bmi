import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  login as loginThunk, 
  register as registerThunk, 
  logout as logoutThunk,
  refreshToken as refreshTokenThunk,
  updateProfile as updateProfileThunk
} from '../store/slices/authSlice';
import { LoginCredentials, RegisterData, User } from '../../../shared/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector(state => state.auth);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      await dispatch(loginThunk(credentials)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const register = useCallback(async (userData: RegisterData) => {
    try {
      await dispatch(registerThunk(userData)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const refreshToken = useCallback(async () => {
    try {
      await dispatch(refreshTokenThunk()).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    try {
      await dispatch(updateProfileThunk(profileData)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
  };
};
