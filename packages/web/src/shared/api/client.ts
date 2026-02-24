const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export function getBaseUrl(): string {
  return BASE_URL;
}

export function buildApiUrl(path: string): string {
  const base = BASE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
