import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client if we have the environment variables
let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// In-memory rate limiter for development or if Redis isn't configured
const inMemoryStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  limit: number;
  windowInSeconds: number;
  keyGenerator?: (req: NextRequest) => string;
}

const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW = 60; // 60 seconds

/**
 * Rate limiting middleware for Next.js API routes
 * Falls back to in-memory storage if Redis is not configured
 */
export async function rateLimiter(
  req: NextRequest,
  config?: RateLimitConfig
) {
  const {
    limit = DEFAULT_LIMIT,
    windowInSeconds = DEFAULT_WINDOW,
    keyGenerator = (req) => {
      // Default to IP-based rate limiting
      const ip = req.ip || 'anonymous';
      const path = new URL(req.url).pathname;
      return `rate-limit:${ip}:${path}`;
    },
  } = config || {};

  const key = keyGenerator(req);
  const now = Date.now();
  const resetTime = now + windowInSeconds * 1000;

  // Use Redis if available, otherwise use in-memory store
  if (redis) {
    // Using Redis for distributed rate limiting
    const currentCount = await redis.get(key) || 0;
    
    if (currentCount >= limit) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
            'Retry-After': windowInSeconds.toString(),
          },
        }
      );
    }
    
    // Increment counter and set expiry
    await redis.incr(key);
    await redis.expire(key, windowInSeconds);
    
    return null; // Continue to the API handler
  } else {
    // Fallback to in-memory rate limiting
    const record = inMemoryStore.get(key);
    
    if (record) {
      if (now > record.resetTime) {
        // Window expired, reset the counter
        inMemoryStore.set(key, { count: 1, resetTime });
      } else if (record.count >= limit) {
        // Rate limit exceeded
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests' }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000).toString(),
              'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString(),
            },
          }
        );
      } else {
        // Increment the counter
        record.count += 1;
        inMemoryStore.set(key, record);
      }
    } else {
      // First request in this window
      inMemoryStore.set(key, { count: 1, resetTime });
    }
    
    // Periodically clean up expired entries
    if (inMemoryStore.size > 10000) {
      // Prevent memory leaks by cleaning up when store gets too large
      for (const [k, v] of inMemoryStore.entries()) {
        if (now > v.resetTime) {
          inMemoryStore.delete(k);
        }
      }
    }
    
    return null; // Continue to the API handler
  }
} 