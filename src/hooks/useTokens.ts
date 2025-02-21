import { useState, useEffect } from 'react';
import { Token } from '@/lib/types';

interface UseTokensOptions {
  status?: string;
  page?: number;
  limit?: number;
}

export function useTokens(options: UseTokensOptions = {}) {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          ...(options.status && { status: options.status }),
          ...(options.page && { page: options.page.toString() }),
          ...(options.limit && { limit: options.limit.toString() })
        });

        const response = await fetch(`/api/tokens?${queryParams}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tokens');
        }

        const data = await response.json();
        setTokens(data);
      } catch (err) {
        console.error('Error fetching tokens:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tokens');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [options.status, options.page, options.limit]);

  return { tokens, loading, error };
} 