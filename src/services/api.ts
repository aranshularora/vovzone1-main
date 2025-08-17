import axios from 'axios';
import { User, ProfileUpdateData, RegisterData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      globalThis.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
  message: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  applicationId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  // Authentication methods
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post('/auth/login', credentials);
      const { user, token } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Login failed');
      }
      throw new Error('An unknown error occurred during login.');
    }
  }

  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Registration failed');
      }
      throw new Error('An unknown error occurred during registration.');
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (_error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed, proceeding with local logout');
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/auth/profile');
      return response.data.user;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to fetch user profile');
      }
      throw new Error('An unknown error occurred while fetching user profile.');
    }
  }

  // Admin methods
  async getPendingApplications(): Promise<User[]> {
    try {
      const response = await api.get('/admin/applications/pending');
      return response.data.applications;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to fetch pending applications');
      }
      throw new Error('An unknown error occurred while fetching applications.');
    }
  }

  async approveDesigner(userId: string): Promise<void> {
    try {
      await api.post(`/admin/applications/${userId}/approve`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to approve designer');
      }
      throw new Error('An unknown error occurred while approving designer.');
    }
  }

  async rejectDesigner(userId: string): Promise<void> {
    try {
      await api.post(`/admin/applications/${userId}/reject`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to reject designer');
      }
      throw new Error('An unknown error occurred while rejecting designer.');
    }
  }

  async updateUserProfile(profileData: ProfileUpdateData): Promise<User> {
    try {
      const response = await api.put<{ user: User }>('/designer/profile', profileData);
      return response.data.user;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to update profile');
      }
      throw new Error('An unknown error occurred while updating profile.');
    }
  }

  // Designer methods
  async getDesignerDashboard(): Promise<unknown> {
    try {
      const response = await api.get('/designer/dashboard');
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Failed to fetch dashboard data');
      }
      throw new Error('An unknown error occurred while fetching dashboard data.');
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/health');
      return response.data.status === 'ok';
    } catch (_error) {
      return false;
    }
  }

  // Utility methods
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    return !!(token && user);
  }

  getCurrentUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (_error) {
      return null;
    }
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Database connection test
  async testDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const isHealthy = await this.healthCheck();
      return {
        connected: isHealthy,
        message: isHealthy ? 'Database connected successfully' : 'Database connection failed'
      };
    } catch (_error) {
      return {
        connected: false,
        message: 'Failed to connect to database server'
      };
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export default
export default apiService;