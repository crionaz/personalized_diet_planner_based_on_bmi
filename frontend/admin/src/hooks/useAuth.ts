import { useDispatch } from 'react-redux'
import { AppDispatch } from '../store'
import { loginAdmin, logout as logoutAction } from '../store/slices/authSlice'
import { authService } from '../services/authService'

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>()

  const login = async (credentials: { email: string; password: string }) => {
    return dispatch(loginAdmin(credentials)).unwrap()
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Even if the API call fails, we still want to log out locally
      console.error('Logout error:', error)
    } finally {
      dispatch(logoutAction())
    }
  }

  return {
    login,
    logout,
  }
}
