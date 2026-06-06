import { describe, it, expect, vi } from 'vitest';
import { hashPassword, verifyPassword, generateTokens } from './auth.service.js';
import { FastifyInstance } from 'fastify';

describe('Auth Service', () => {
  it('should hash a password and verify it successfully', async () => {
    const password = 'mySecretPassword123!';
    const hash = await hashPassword(password);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    
    const isValid = await verifyPassword(hash, password);
    expect(isValid).toBe(true);
  });

  it('should fail to verify an incorrect password', async () => {
    const password = 'mySecretPassword123!';
    const hash = await hashPassword(password);
    
    const isValid = await verifyPassword(hash, 'wrongPassword!');
    expect(isValid).toBe(false);
  });

  it('should generate valid access and refresh tokens', () => {
    const mockFastify = {} as FastifyInstance;
    const tokens = generateTokens('user-1', 'test@example.com', mockFastify);
    
    expect(tokens.accessToken).toBeDefined();
    expect(typeof tokens.accessToken).toBe('string');
    expect(tokens.refreshToken).toBeDefined();
    expect(tokens.expiresIn).toBe(900); // 15 mins
  });
});
