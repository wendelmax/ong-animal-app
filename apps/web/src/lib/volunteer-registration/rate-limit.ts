import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export type RateLimitPort = {
  check(input: { key: string; limit: number; windowSeconds: number }): Promise<{ success: boolean; remaining: number }>
}

const createRateLimiter = (): RateLimitPort => {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) throw new Error('RATE_LIMIT_NOT_CONFIGURED')
  return {
    async check({ key, limit, windowSeconds }) {
      const limiter = new Ratelimit({ redis: new Redis({ url, token }), limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`), analytics: false })
      const result = await limiter.limit(key)
      return { success: result.success, remaining: result.remaining }
    },
  }
}

export const checkPublicRateLimit = (input: { key: string; limit: number; windowSeconds: number }) => createRateLimiter().check(input)

