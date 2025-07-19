import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { User } from '@shared/index'
import { userService } from '../../services/userService'

interface UserState {
  users: User[]
  selectedUser: User | null
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
}

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: { page?: number; limit?: number; search?: string }, { rejectWithValue }) => {
    try {
      const response = await userService.getAllUsers(params)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch users')
    }
  }
)

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await userService.createUser(userData)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create user')
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }: { id: string; data: Partial<User> }, { rejectWithValue }) => {
    try {
      const response = await userService.updateUser(id, data)
      return response
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update user')
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await userService.deleteUser(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete user')
    }
  }
)

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = action.payload.users
        state.pagination = action.payload.pagination
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.users.unshift(action.payload)
        state.pagination.total += 1
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.users.findIndex(user => user.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = state.users.filter(user => user.id !== action.payload)
        state.pagination.total -= 1
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setSelectedUser, clearSelectedUser, clearError } = userSlice.actions
export default userSlice.reducer
