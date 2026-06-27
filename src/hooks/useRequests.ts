import { useState, useCallback } from 'react';
import { RequestPublication } from '../types/requestPublication';
import { requestPublicationService } from '../services/requestPublication';
import { AppError } from '../types/apiError';

export const useRequests = () => {
  const [requests, setRequests] = useState<RequestPublication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestPublicationService.getAll();
      setRequests(data);
    } catch (e) {
      setError(e as AppError);
    } finally {
      setLoading(false);
    }
  }, []);

  return { requests, setRequests, loading, error, fetch };
};