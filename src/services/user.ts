import api from './api';
import { User } from '../types/user';
import { parseAxiosError } from '../utils/errorMessages';

export const userService = {
  getMe: async (): Promise<User> => {
    try {
      const res = await api.get<User>('/users/me');
      return res.data;
    } catch (e) { throw parseAxiosError(e); }
  },
};