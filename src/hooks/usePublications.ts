import { useState, useCallback } from 'react';
import { Publication } from '../types/publication';
import { publicationService } from '../services/publication';
import { AppError } from '../types/apiError';

export const usePublications = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await publicationService.getAll();
      setPublications(data);
    } catch (e) {
      setError(e as AppError);
    } finally {
      setLoading(false);
    }
  }, []);

  return { publications, loading, error, fetch };
};