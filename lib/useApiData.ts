import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for fetching data from an API endpoint with error handling.
 * @template T - The type of data expected from the API.
 * @param endpoint - The API endpoint to fetch data from.
 * @param options - Optional fetch options.
 * @returns An object containing the data, loading state, error, and a refetch function.
 */
export function useApiData<T>(endpoint: string, options?: RequestInit) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, options);
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [endpoint, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
