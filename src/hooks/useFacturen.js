// src/hooks/useFacturen.js
import { useState, useEffect, useCallback } from 'react';
import { getEntities, updateEntity } from '../api/client';

export function useFacturen(initialFilters = {}) {
  const [facturen, setFacturen] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFacturen = useCallback(async (filters) => {
    setLoading(true);
    try {
      const data = await getEntities('Factuur', filters);
      setFacturen(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFactuurStatus = useCallback(async (factuurnr, status) => {
    try {
      await updateEntity('Factuur', factuurnr, { status });
      await loadFacturen(); // herladen na update
    } catch (err) {
      setError(err.message);
    }
  }, [loadFacturen]);

  useEffect(() => {
    loadFacturen(initialFilters);
  }, [loadFacturen, initialFilters]);

  return { facturen, loading, error, updateFactuurStatus, reload: loadFacturen };
}