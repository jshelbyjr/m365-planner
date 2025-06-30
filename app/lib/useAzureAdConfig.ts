import { useEffect, useState } from 'react';

export interface AzureAdConfig {
  clientId: string;
  tenantId: string;
}

/**
 * React hook to fetch Azure AD config (clientId, tenantId) from the backend API.
 * Returns { clientId, tenantId, loading, error }
 */
export function useAzureAdConfig() {
  const [config, setConfig] = useState<AzureAdConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/config');
        if (!res.ok) throw new Error('Failed to fetch Azure AD config');
        const data = await res.json();
        if (data?.config?.clientId && data?.config?.tenantId) {
          setConfig({
            clientId: data.config.clientId,
            tenantId: data.config.tenantId,
          });
        } else {
          setError('Azure AD config missing clientId or tenantId');
        }
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  return { ...config, loading, error };
}
