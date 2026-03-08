import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { authRouter } from '../routes/auth.js';
import { errorHandler } from '../middleware/errorHandler.js';

const mockUser = {
  id: 'user-uuid-123',
  email: 'new@example.com',
  name: 'New User',
};

vi.mock('../db/index.js', () => ({
  getEntityManager: vi.fn(() => ({})),
  getRepositories: vi.fn(() => ({
    userRepository: {
      findByEmail: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(mockUser),
    },
  })),
}));

vi.mock('../lib/auth.js', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed'),
  verifyPassword: vi.fn(),
  signToken: vi.fn().mockReturnValue('mock-jwt-token'),
}));

const app = express();
app.use(express.json());
app.use('/auth', authRouter);
app.use(errorHandler);

describe('POST /auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 201 with token and user for valid body', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      })
      .expect(201);

    expect(res.body).toHaveProperty('token', 'mock-jwt-token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toMatchObject({
      id: mockUser.id,
      email: mockUser.email,
      name: mockUser.name,
    });
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'not-an-email',
        password: 'password123',
      });
    expect(res.status).toBe(400);
  });

  it('returns 400 for short password', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        email: 'valid@example.com',
        password: 'short',
      });
    expect(res.status).toBe(400);
  });
});
