import api from './api';
import { RequestPublication, RequestPublicationRequest, AcceptRequest } from '../types/requestPublication';
import { parseAxiosError } from '../utils/errorMessages';

export const requestPublicationService = {
  create: async (publicationId: number, data: RequestPublicationRequest): Promise<RequestPublication> => {
    try { const r = await api.post<RequestPublication>(`/publications/${publicationId}/requests`, data); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  getAll: async (): Promise<RequestPublication[]> => {
    try { const r = await api.get<RequestPublication[]>('/request-publications'); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  getById: async (id: number): Promise<RequestPublication> => {
    try { const r = await api.get<RequestPublication>(`/request-publications/${id}`); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  cancel: async (id: number): Promise<RequestPublication> => {
    try { const r = await api.patch<RequestPublication>(`/request-publications/${id}/cancel`); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  accept: async (id: number, data: AcceptRequest): Promise<RequestPublication> => {
    try { const r = await api.patch<RequestPublication>(`/request-publications/${id}/accept`, data); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
  reject: async (id: number): Promise<RequestPublication> => {
    try { const r = await api.patch<RequestPublication>(`/request-publications/${id}/reject`); return r.data; }
    catch (e) { throw parseAxiosError(e); }
  },
};