import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { parseAxiosError } from '../utils/errorMessages';
import { tokenStorage } from './storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error('EXPO_PUBLIC_API_URL is required. Configure it in your .env file.');
}

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
  const token = await tokenStorage.getItemAsync('accessToken');
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
          const rt = await tokenStorage.getItemAsync('refreshToken');
          if (!rt) throw new Error('No refresh token');
          const res = await refreshInstance.post('/auth/refresh', { refreshToken: rt });
          const { accessToken, refreshToken } = res.data;
          await tokenStorage.setItemAsync('accessToken', accessToken);
          await tokenStorage.setItemAsync('refreshToken', refreshToken);
          return { accessToken, refreshToken };
        })();
      }
      const { accessToken } = await refreshPromise;
      refreshPromise = null;
      original.headers.set('Authorization', `Bearer ${accessToken}`);
      return api(original);
    } catch {
      refreshPromise = null;
      await tokenStorage.deleteItemAsync('accessToken');
      await tokenStorage.deleteItemAsync('refreshToken');
      onSessionExpired?.();
      return Promise.reject(parseAxiosError(error));
    }
  }
);

export default api;
