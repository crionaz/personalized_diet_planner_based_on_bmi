import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@shared/index'
import { authService } from '../../services/authService'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('adminToken'),
  isLoading: false,
  error: null,
}

export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.loginAdmin(credentials)
      localStorage.setItem('adminToken', response.token)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed')
    }
  }
)

export const getCurrentAdmin = createAsyncThunk(
  'auth/getCurrentAdmin',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser()
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get current user')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      localStorage.removeItem('adminToken')
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(getCurrentAdmin.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCurrentAdmin.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(getCurrentAdmin.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.token = null
        localStorage.removeItem('adminToken')
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
