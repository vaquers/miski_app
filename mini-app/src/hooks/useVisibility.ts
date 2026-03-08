import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

export function useVisibility(): Record<string, boolean> | null {
  const [visibility, setVisibility] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/visibility`)
      .then((r) => r.json())
      .then(setVisibility)
      .catch(() => setVisibility(null));
  }, []);

  return visibility;
}
