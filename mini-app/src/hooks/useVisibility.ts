import { useState, useEffect } from 'react';

import { requestJsonWithApiFallback } from '@/api/apiBase';

export function useVisibility(): Record<string, boolean> | null {
  const [visibility, setVisibility] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    requestJsonWithApiFallback<Record<string, boolean>>('/visibility')
      .then((data) => {
        if (data && typeof data === 'object') setVisibility(data);
      })
      .catch((error) => console.error('Failed to load visibility data', error));
  }, []);

  return visibility;
}
