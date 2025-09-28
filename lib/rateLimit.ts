// lib/rateLimit.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkLimit(req: Request): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(req)
      : this.getDefaultKey(req);

    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    try {
      // Get current requests in window
      const requests = await redis.zrangebyscore(
        `rate_limit:${key}`,
        windowStart,
        now,
        { withScores: true }
      );

      const currentCount = requests.length;
      
      if (currentCount >= this.config.maxRequests) {
        // Rate limit exceeded
        const oldestRequest = requests[0] as [string, number];
        const resetTime = oldestRequest[1] + this.config.windowMs;
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter
        };
      }

      // Add current request
      await redis.zadd(`rate_limit:${key}`, { score: now, member: now.toString() });
      
      // Clean up old entries
      await redis.zremrangebyscore(`rate_limit:${key}`, 0, windowStart);
      
      // Set expiration
      await redis.expire(`rate_limit:${key}`, Math.ceil(this.config.windowMs / 1000));

      return {
        allowed: true,
        remaining: this.config.maxRequests - currentCount - 1,
        resetTime: now + this.config.windowMs
      };
    } catch (error) {
      console.error('Rate limit error:', error);
      // Fail open - allow request if Redis is down
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs
      };
    }
  }

  private getDefaultKey(req: Request): string {
    // Try to get IP from various headers
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    
    const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
    
    // For overlay requests, also include the key parameter
    const url = new URL(req.url);
    const overlayKey = url.searchParams.get('key') || url.searchParams.get('k');
    
    return overlayKey ? `${ip}:${overlayKey}` : ip;
  }
}

// Pre-configured rate limiters
export const overlayRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
  keyGenerator: (req) => {
    const url = new URL(req.url);
    const overlayKey = url.searchParams.get('key') || url.searchParams.get('k');
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0] || 'unknown';
    return overlayKey ? `overlay:${ip}:${overlayKey}` : `overlay:${ip}`;
  }
});

export const apiRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
});

export const taskRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 task requests per minute
  keyGenerator: (req) => {
    const url = new URL(req.url);
    const overlayKey = url.searchParams.get('key') || url.searchParams.get('k');
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0] || 'unknown';
    return overlayKey ? `task:${ip}:${overlayKey}` : `task:${ip}`;
  }
});

// Helper function to create rate limit response
export function createRateLimitResponse(retryAfter: number) {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      retryAfter,
      message: 'Too many requests. Please try again later.'
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': Math.ceil((Date.now() + retryAfter * 1000) / 1000).toString()
      }
    }
  );
}
