import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types/user';
import { userService } from '../services/user';
import { setSessionExpiredCallback } from '../services/api';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    setUser(null);
  }, []);

  // Register logout callback for 401 auto-logout
  useEffect(() => {
    setSessionExpiredCallback(logout);
  }, [logout]);

  // Restore session on app start
  useEffect(() => {
    const restore = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
          const me = await userService.getMe();
          setUser(me);
        }
      } catch {
        // Token invalid or expired and refresh failed — stay logged out
        await logout();
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, [logout]);

  const login = async (accessToken: string, refreshToken: string, userData: User) => {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
    setUser(userData);
  };

  const refreshUser = async () => {
    const me = await userService.getMe();
    setUser(me);
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isLoading, login, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};