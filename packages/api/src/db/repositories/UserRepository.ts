import type { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/User';

export class UserRepository {
  constructor(private readonly em: EntityManager) {}

  findByEmail(email: string): Promise<User | null> {
    return this.em.findOne(User, { email });
  }

  findById(id: string): Promise<User | null> {
    return this.em.findOne(User, { id });
  }

  /** Search users by name or email (case-insensitive). Excludes one user by id. */
  search(query: string, excludeUserId: string, limit: number = 20): Promise<User[]> {
    const q = query.trim();
    if (!q) return Promise.resolve([]);
    const pattern = `%${q}%`;
    return this.em.find(
      User,
      {
        id: { $ne: excludeUserId },
        $or: [
          { name: { $ilike: pattern } },
          { email: { $ilike: pattern } },
        ],
      },
      { limit }
    );
  }

  async create(data: { email: string; passwordHash: string; name?: string }): Promise<User> {
    const user = this.em.create(User, {
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.em.persistAndFlush(user);
    return user;
  }
}
