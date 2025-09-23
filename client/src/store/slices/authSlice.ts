import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IAuthState, ILoginCredentials, ILoginResponse, IUser } from '../../types';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Async thunk for login
export const loginUser = createAsyncThunk<
  ILoginResponse,
  ILoginCredentials,
  { rejectValue: string }
>(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, credentials);
      
      // Extract data from response structure: { success: true, data: { user, token, refreshToken } }
      if (response.data.success && response.data.data) {
        const { user, token, refreshToken } = response.data.data;
        
        // Store token in localStorage
        if (token) {
          localStorage.setItem('token', token);
          // Set default authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        
        return { user, token, refreshToken };
      } else {
        throw new Error('Invalid login response structure');
      }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/v1/auth/logout`);
    } catch (error) {
      // Continue with logout even if server request fails
      console.warn('Logout request failed, continuing with local logout');
    }
    
    // Clear local storage and axios headers
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    
    return;
  }
);

// Async thunk for token verification
export const verifyToken = createAsyncThunk<
  IUser,
  void,
  { rejectValue: string }
>(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      // Set authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get(`${API_BASE_URL}/api/v1/auth/me`);
      
      // Extract user from the response data structure: { success: true, data: { user: {...} } }
      if (response.data.success && response.data.data && response.data.data.user) {
        return response.data.data.user;
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error: any) {
      // Clear invalid token
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      
      return rejectWithValue(
        error.response?.data?.message || 'Token verification failed'
      );
    }
  }
);

const initialState: IAuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = (action.payload as string) || 'Login failed';
      })
      
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      
      // Token verification cases
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = localStorage.getItem('token');
        state.error = null;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = (action.payload as string) || 'Token verification failed';
      });
  },
});

export const { clearError, setLoading } = authSlice.actions;
export default authSlice.reducer;
