import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerUser, authenticateUser } from './auth.service';
import { prisma } from '../lib/prisma';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

vi.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('argon2', () => ({
  default: {
    hash: vi.fn(),
    verify: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should authenticate a valid user', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      name: 'Test User',
      examType: 'JEE',
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    vi.mocked(argon2.verify).mockResolvedValue(true);
    vi.mocked(jwt.sign).mockReturnValue('mock-jwt-token' as any);

    const result = await authenticateUser('test@example.com', 'password');

    expect(result.success).toBe(true);
    expect(result.data?.accessToken).toBe('mock-jwt-token');
    expect(result.data?.user.id).toBe('user-1');
    expect(argon2.verify).toHaveBeenCalledWith('hashed-password', 'password');
  });

  it('should fail authentication on incorrect password', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      name: 'Test User',
      examType: 'JEE',
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
    vi.mocked(argon2.verify).mockResolvedValue(false);

    const result = await authenticateUser('test@example.com', 'wrongpassword');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email or password');
  });
});
