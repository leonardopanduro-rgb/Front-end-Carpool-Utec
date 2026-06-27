import api from './api';
import { Publication, PublicationRequest } from '../types/publication';
import { parseAxiosError } from '../utils/errorMessages';

export const publicationService = {
  getAll: async (): Promise<Publication[]> => {
    try { const r = await api.get<Publication[]>('/publications'); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  getById: async (id: number): Promise<Publication> => {
    try { const r = await api.get<Publication>(`/publications/${id}`); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  create: async (data: PublicationRequest): Promise<Publication> => {
    try { const r = await api.post<Publication>('/publications', data); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  getRequests: async (publicationId: number) => {
    try { const r = await api.get(`/publications/${publicationId}/requests`); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
};