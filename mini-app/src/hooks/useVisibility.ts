import { useState, useEffect } from 'react';

function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  // В проде по умолчанию ходим на Railway, даже если env не настроены.
  if (import.meta.env.PROD) return 'https://miskiapp-production.up.railway.app';

  // В dev без env используем относительный путь и Vite proxy.
  return '';
}

export function useVisibility(): Record<string, boolean> | null {
  const [visibility, setVisibility] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    const baseUrl = getApiBaseUrl();
    const url = baseUrl ? `${baseUrl}/api/visibility` : '/api/visibility';

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        // Если API вернул некорректный ответ, не трогаем текущее состояние.
        if (data && typeof data === 'object') {
          setVisibility(data as Record<string, boolean>);
        }
      })
      .catch((error) => {
        // Если запрос упал, просто логируем ошибку и оставляем
        // последнее корректное состояние visibility без изменений.
        console.error('Failed to load visibility data', error);
      });
  }, []);

  return visibility;
}
