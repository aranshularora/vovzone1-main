import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { apiService } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'role' | 'status' | 'appliedAt' | 'approvedAt' | 'rejectedAt' | 'designer'> & { password: string; confirmPassword?: string; specialties: string[] }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User> & { specialties?: string[] }) => Promise<boolean>;
  approveDesigner: (designerId: string) => Promise<boolean>;
  rejectDesigner: (designerId: string) => Promise<boolean>;
  testDatabaseConnection: () => Promise<{ connected: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

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
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'role' | 'status' | 'appliedAt' | 'approvedAt' | 'rejectedAt' | 'designer'> & { password: string; confirmPassword?: string; specialties: string[] }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiService.register(userData);
      return { success: response.success, message: response.message };
    } catch (error: unknown) {
      if (error instanceof Error) {
        return { success: false, message: error.message || 'Registration failed. Please try again.' };
      }
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const approveDesigner = async (designerId: string): Promise<boolean> => {
    try {
      await apiService.approveDesigner(designerId);
      return true;
    } catch (error) {
      console.error('Error approving designer:', error);
      return false;
    }
  };

  const rejectDesigner = async (designerId: string): Promise<boolean> => {
    try {
      await apiService.rejectDesigner(designerId);
      return true;
    } catch (error) {
      console.error('Error rejecting designer:', error);
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

  const updateProfile = async (data: Partial<User> & { specialties?: string[] }): Promise<boolean> => {
    try {
      if (!authState.user || authState.user.role !== 'designer') return false;

      const updatedUser = {
        ...authState.user,
        name: data.name || authState.user.name,
        email: data.email || authState.user.email,
        designer: authState.user.designer ? {
          ...authState.user.designer,
          name: data.name || authState.user.designer.name,
          email: data.email || authState.user.designer.email,
          company: data.company || authState.user.designer.company,
          phone: data.phone || authState.user.designer.phone,
          website: data.website || authState.user.designer.website,
          bio: data.bio || authState.user.designer.bio,
          specialties: data.specialties || authState.user.designer.specialties,
        } : undefined,
      };

      // Update in approved designers list
      const approvedDesigners = JSON.parse(localStorage.getItem('approvedDesigners') || '[]');
      const userIndex = approvedDesigners.findIndex((u: User) => u.id === updatedUser.id);
      if (userIndex !== -1) {
        approvedDesigners[userIndex] = updatedUser;
        localStorage.setItem('approvedDesigners', JSON.stringify(approvedDesigners));
      }

      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      return true;
    } catch {
      return false;
    }
  };

  const testDatabaseConnection = async (): Promise<{ connected: boolean; message: string }> => {
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