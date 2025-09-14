// src/utils/cache.ts
import redis from './redisClient';

const TTL_72H = 72 * 60 * 60; // 72 ঘণ্টা

export async function getCache<T>(key: string): Promise<T | null> {
  const val = await redis.get(key);
  return val ? (JSON.parse(val) as T) : null;
}

export async function setCache(key: string, value: unknown, ttl: number = TTL_72H): Promise<void> {
  await redis.set(key, JSON.stringify(value), 'EX', ttl);
}
