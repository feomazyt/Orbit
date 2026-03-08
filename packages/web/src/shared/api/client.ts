const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export function getBaseUrl(): string {
  return BASE_URL;
}

/** URL for Socket.IO. When BASE_URL is relative (e.g. /api with Vite proxy), use same origin so /socket.io is proxied. */
export function getSocketUrl(): string | undefined {
  if (BASE_URL.startsWith('http://') || BASE_URL.startsWith('https://')) {
    return BASE_URL;
  }
  return undefined;
}

export function buildApiUrl(path: string): string {
  const base = BASE_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
