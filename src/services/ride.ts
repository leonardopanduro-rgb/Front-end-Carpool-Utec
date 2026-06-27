import api from './api';
import { Ride } from '../types/ride';
import { parseAxiosError } from '../utils/errorMessages';

export const rideService = {
  getAll: async (): Promise<Ride[]> => {
    try { const r = await api.get<Ride[]>('/rides'); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  getById: async (id: number): Promise<Ride> => {
    try { const r = await api.get<Ride>(`/rides/${id}`); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
};