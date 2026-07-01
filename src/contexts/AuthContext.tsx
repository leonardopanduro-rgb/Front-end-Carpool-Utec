import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types/user';
import { userService } from '../services/user';
import { setSessionExpiredCallback } from '../services/api';
import { tokenStorage } from '../services/storage';

export type AppMode = 'passenger' | 'driver';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Interfaz activa: pasajero (busca viajes) o conductor (ofrece/gestiona). */
  mode: AppMode;
  setMode: (mode: AppMode) => Promise<void>;
  /** True justo después de registrarse: muestra la pantalla de configurar vehículo. */
  pendingVehicleSetup: boolean;
  setPendingVehicleSetup: (value: boolean) => void;
  login: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

const MODE_KEY = 'activeMode';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setModeState] = useState<AppMode>('passenger');
  const [pendingVehicleSetup, setPendingVehicleSetup] = useState(false);

  const setMode = useCallback(async (next: AppMode) => {
    setModeState(next);
    await tokenStorage.setItemAsync(MODE_KEY, next);
  }, []);

  const logout = useCallback(async () => {
    await tokenStorage.deleteItemAsync('accessToken');
    await tokenStorage.deleteItemAsync('refreshToken');
    await tokenStorage.deleteItemAsync(MODE_KEY);
    setModeState('passenger');
    setPendingVehicleSetup(false);
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
        const token = await tokenStorage.getItemAsync('accessToken');
        if (token) {
          const me = await userService.getMe();
          setUser(me);
          const savedMode = await tokenStorage.getItemAsync(MODE_KEY);
          if (savedMode === 'driver' || savedMode === 'passenger') setModeState(savedMode);
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
    await tokenStorage.setItemAsync('accessToken', accessToken);
    await tokenStorage.setItemAsync('refreshToken', refreshToken);
    setUser(userData);
  };

  const refreshUser = async () => {
    const me = await userService.getMe();
    setUser(me);
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isLoading,
      mode, setMode, pendingVehicleSetup, setPendingVehicleSetup,
      login, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
