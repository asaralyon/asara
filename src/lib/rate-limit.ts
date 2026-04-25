import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rate limit pour l'authentification : 5 tentatives / 15 minutes
export const rateLimitAuth = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'asara:auth',
});

// Rate limit pour les APIs publiques : 100 requêtes / minute
export const rateLimitAPI = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'asara:api',
});

// Rate limit pour le contact/forum : 10 requêtes / 10 minutes
export const rateLimitPublic = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 m'),
  analytics: true,
  prefix: 'asara:public',
});
