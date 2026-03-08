import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer, type Socket } from 'socket.io';
import { verifyToken } from '../lib/auth.js';

type UserId = string;

const userSockets = new Map<UserId, Set<string>>();

let ioInstance: SocketIOServer | null = null;

export function initSocketIo(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN === undefined || process.env.CORS_ORIGIN === '*'
        ? true
        : process.env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const header = socket.handshake.auth?.token as string | undefined
        ?? (socket.handshake.headers.authorization as string | undefined);
      const token =
        header && header.startsWith('Bearer ')
          ? header.slice(7)
          : header;

      if (!token) {
        next(new Error('Missing auth token'));
        return;
      }

      const payload = verifyToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId: UserId | undefined = socket.data.userId;
    if (userId) {
      addUserSocket(userId, socket.id);
    }

    socket.on('disconnect', () => {
      if (userId) {
        removeUserSocket(userId, socket.id);
      }
    });
  });

  ioInstance = io;
  return io;
}

export function getIo(): SocketIOServer {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized');
  }
  return ioInstance;
}

function addUserSocket(userId: UserId, socketId: string): void {
  const existing = userSockets.get(userId) ?? new Set<string>();
  existing.add(socketId);
  userSockets.set(userId, existing);
}

function removeUserSocket(userId: UserId, socketId: string): void {
  const existing = userSockets.get(userId);
  if (!existing) return;
  existing.delete(socketId);
  if (existing.size === 0) {
    userSockets.delete(userId);
  }
}

