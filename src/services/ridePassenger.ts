import api from './api';
import { RidePassenger } from '../types/ridePassenger';
import { parseAxiosError } from '../utils/errorMessages';

export const ridePassengerService = {
  getAll: async (): Promise<RidePassenger[]> => {
    try { const r = await api.get<RidePassenger[]>('/ride-passengers'); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  getById: async (id: number): Promise<RidePassenger> => {
    try { const r = await api.get<RidePassenger>(`/ride-passengers/${id}`); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
};