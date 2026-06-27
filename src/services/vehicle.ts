import api from './api';
import { Vehicle, VehicleRequest } from '../types/vehicle';
import { parseAxiosError } from '../utils/errorMessages';

export const vehicleService = {
  getAll: async (): Promise<Vehicle[]> => {
    try { const r = await api.get<Vehicle[]>('/vehicles'); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  getById: async (id: number): Promise<Vehicle> => {
    try { const r = await api.get<Vehicle>(`/vehicles/${id}`); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  create: async (data: VehicleRequest): Promise<Vehicle> => {
    try { const r = await api.post<Vehicle>('/vehicles', data); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  update: async (id: number, data: VehicleRequest): Promise<Vehicle> => {
    try { const r = await api.put<Vehicle>(`/vehicles/${id}`, data); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  remove: async (id: number): Promise<void> => {
    try { await api.delete(`/vehicles/${id}`); }
    catch (e) { throw parseAxiosError(e); }
  },
};