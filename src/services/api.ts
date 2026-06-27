import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { parseAxiosError } from '../utils/errorMessages';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080/api/v1';

// Separate instance for refresh (no interceptor loop)
const refreshInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Shared promise to avoid concurrent refresh calls
let refreshPromise: Promise<{ accessToken: string; refreshToken: string }> | null = null;

// Callbacks set by AuthContext
let onSessionExpired: (() => void) | null = null;
export const setSessionExpiredCallback = (cb: () => void) => { onSessionExpired = cb; };

// ── Request interceptor: attach Bearer token ───────────────────────────────
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

// ── Response interceptor: handle 401 with single refresh ──────────────────
api.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(parseAxiosError(error));
    }
    original._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const rt = await SecureStore.getItemAsync('refreshToken');
          if (!rt) throw new Error('No refresh token');
          const res = await refreshInstance.post('/auth/refresh', { refreshToken: rt });
          const { accessToken, refreshToken } = res.data;
          await SecureStore.setItemAsync('accessToken', accessToken);
          await SecureStore.setItemAsync('refreshToken', refreshToken);
          return { accessToken, refreshToken };
        })();
      }
      const { accessToken } = await refreshPromise;
      refreshPromise = null;
      original.headers.set('Authorization', `Bearer ${accessToken}`);
      return api(original);
    } catch {
      refreshPromise = null;
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      onSessionExpired?.();
      return Promise.reject(parseAxiosError(error));
    }
  }
);

export default api;