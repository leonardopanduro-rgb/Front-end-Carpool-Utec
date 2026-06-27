import api from './api';
import { AuthResponse, LoginRequest, RegisterRequest, RefreshRequest } from '../types/auth';
import { parseAxiosError } from '../utils/errorMessages';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const res = await api.post<AuthResponse>('/auth/login', data);
      return res.data;
    } catch (e) { throw parseAxiosError(e); }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const res = await api.post<AuthResponse>('/auth/register', data);
      return res.data;
    } catch (e) { throw parseAxiosError(e); }
  },

  refresh: async (data: RefreshRequest): Promise<AuthResponse> => {
    try {
      const res = await api.post<AuthResponse>('/auth/refresh', data);
      return res.data;
    } catch (e) { throw parseAxiosError(e); }
  },
};