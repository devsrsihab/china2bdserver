// src/utils/redisClient.ts
import Redis from 'ioredis';

// Redis connection; REDIS_URL না পেলে লোকালহোস্টে চেষ্টা করবে
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export default redis;
