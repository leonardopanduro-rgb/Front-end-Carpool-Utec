import api from './api';
import { PublicUser, User } from '../types/user';
import { parseAxiosError } from '../utils/errorMessages';

export const userService = {
  getMe: async (): Promise<User> => {
    try {
      const res = await api.get<User>('/users/me');
      return res.data;
    } catch (e) { throw parseAxiosError(e); }
  },
  getPublicProfile: async (id: number): Promise<PublicUser> => {
    try {
      const res = await api.get<PublicUser>(`/users/${id}/public`);
      return res.data;
    } catch (e) { throw parseAxiosError(e); }
  },
};
