/**
 * React hook for API calls
 * Provides loading, error, and data states
 */

import { useState, useEffect } from 'react';
import { api, APIError } from '../api';

export function useAPI<T>(
  endpoint: string | null,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    dependencies?: any[];
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!endpoint) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // This is a simplified version - in practice, you'd call the specific API method
        // For now, we'll use a generic fetch approach
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_WP_API_URL || 'https://yoursite.com/wp-json/clearmeds/v1'}${endpoint}`,
          {
            method: options?.method || 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: options?.body ? JSON.stringify(options.body) : undefined,
          }
        );

        if (!response.ok) {
          throw new APIError(response.status, await response.text());
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, ...(options?.dependencies || [])]);

  const refetch = () => {
    setLoading(true);
    setError(null);
    // Trigger re-fetch by updating a dependency
  };

  return { data, loading, error, refetch };
}

