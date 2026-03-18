function getApiBaseUrl(): string {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  // В проде по умолчанию ходим на Railway, даже если env не настроены.
  if (import.meta.env.PROD) return 'https://miskiapp-production.up.railway.app';

  // В dev без env используем относительный путь и Vite proxy.
  return '';
}

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

async function requestJson<T = Json>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = baseUrl ? `${baseUrl}${path}` : path;

  const res = await fetch(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const text = await res.text();
  const data = text ? (JSON.parse(text) as T) : (null as T);

  if (!res.ok) {
    const err = new Error(
      typeof data === 'object' && data && 'detail' in (data as any)
        ? String((data as any).detail)
        : `HTTP ${res.status}`,
    );
    (err as any).status = res.status;
    (err as any).data = data;
    throw err;
  }

  return data;
}

/**
 * У бэка могут быть эндпоинты как с `/api`, так и без.
 * Пробуем основной вариант, при 404 повторяем альтернативный.
 */
export async function requestJsonWithApiFallback<T = Json>(
  endpoint: string,
  init?: RequestInit,
): Promise<T> {
  const withApi = endpoint.startsWith('/api/') ? endpoint : `/api${endpoint}`;
  const withoutApi = endpoint.startsWith('/api/') ? endpoint.slice(4) : endpoint;

  try {
    return await requestJson<T>(withApi, init);
  } catch (e) {
    const status = (e as any)?.status;
    if (status !== 404) throw e;
    return await requestJson<T>(withoutApi, init);
  }
}

