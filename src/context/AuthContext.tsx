import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, ProfileUpdateData, RegisterData } from '../types';
import { apiService } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: ProfileUpdateData) => Promise<boolean>;
  approveDesigner: (designerId: string) => Promise<boolean>;
  rejectDesigner: (designerId: string) => Promise<boolean>;
  testDatabaseConnection: () => Promise<{ connected: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}



export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    // Check for stored user session and validate with API
    const initializeAuth = async () => {
      const isAuthenticated = apiService.isAuthenticated();
      
      if (isAuthenticated) {
        try {
          const user = await apiService.getCurrentUser();
          setAuthState({
            user,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          // Token might be expired or invalid
          console.warn('Failed to validate stored session:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
          setAuthState({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login({ email, password });
      
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        loading: false,
      });
      
      return true;
    } catch (_error) {
      // console.error is enough for now
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiService.register(userData);
      return { success: response.success, message: response.message };
    } catch (error) {
      if (error instanceof Error) {
        return { success: false, message: error.message };
      }
      return { success: false, message: 'An unknown error occurred during registration.' };
    }
  };

  const approveDesigner = async (designerId: string): Promise<boolean> => {
    try {
      await apiService.approveDesigner(designerId);
      return true;
    } catch (_error) {
      // console.error is enough for now
      return false;
    }
  };

  const rejectDesigner = async (designerId: string): Promise<boolean> => {
    try {
      await apiService.rejectDesigner(designerId);
      return true;
    } catch (_error) {
      // console.error is enough for now
      return false;
    }
  };

  const logout = () => {
    apiService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  };

  const updateProfile = async (data: ProfileUpdateData): Promise<boolean> => {
    try {
      if (!authState.user) {
        console.error('Cannot update profile: no user is authenticated.');
        return false;
      }

      const updatedUser = await apiService.updateUserProfile(data);

      // Update auth state and local storage with the confirmed data from the server
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      return true;
    } catch (_error) {
      // console.error is enough for now
      return false;
    }
  };

  const testDatabaseConnection = (): Promise<{ connected: boolean; message: string }> => {
    return apiService.testDatabaseConnection();
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    approveDesigner,
    rejectDesigner,
    testDatabaseConnection,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};