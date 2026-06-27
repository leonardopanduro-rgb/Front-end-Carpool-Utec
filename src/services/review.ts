import api from './api';
import { Review, ReviewRequest } from '../types/review';
import { parseAxiosError } from '../utils/errorMessages';

export const reviewService = {
  getAll: async (): Promise<Review[]> => {
    try { const r = await api.get<Review[]>('/reviews'); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  getById: async (id: number): Promise<Review> => {
    try { const r = await api.get<Review>(`/reviews/${id}`); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  create: async (data: ReviewRequest): Promise<Review> => {
    try { const r = await api.post<Review>('/reviews', data); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  update: async (id: number, data: Partial<ReviewRequest>): Promise<Review> => {
    try { const r = await api.put<Review>(`/reviews/${id}`, data); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  remove: async (id: number): Promise<void> => {
    try { await api.delete(`/reviews/${id}`); }
    catch (e) { throw parseAxiosError(e); }
  },
};