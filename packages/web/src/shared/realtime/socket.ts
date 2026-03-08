import { io, type Socket } from 'socket.io-client';
import { getSocketUrl } from '../api/client.js';
import { getAuthToken } from '../api/interceptors.js';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  const token = getAuthToken();
  const url = getSocketUrl();

  socket = io(url ?? undefined, {
    auth: token ? { token: `Bearer ${token}` } : undefined,
    withCredentials: true,
    autoConnect: true,
    transports: ['websocket', 'polling'],
  });

  return socket;
}

