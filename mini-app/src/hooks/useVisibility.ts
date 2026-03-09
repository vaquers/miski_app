import { useState, useEffect } from 'react';

const API_URL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';

export function useVisibility(): Record<string, boolean> | null {
  const [visibility, setVisibility] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/visibility`)
      .then((r) => r.json())
      .then(setVisibility)
      .catch((error) => {
        // Fallback: считаем, что все доступны, если API недоступен.
        console.error('Failed to load visibility data', error);
        setVisibility(null);
      });
  }, []);

  return visibility;
}
