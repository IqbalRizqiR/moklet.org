import { Redis } from "@upstash/redis";

// Create a single global instance of Redis to prevent multiple connections
const redisClient = Redis.fromEnv();

export default redisClient;

/**
 * A generic caching wrapper for heavy database queries.
 * @param key The unique cache key
 * @param fetcher The async function to fetch the data from the database
 * @param expirationInSeconds How long to keep the data in cache (default: 60 seconds)
 * @returns The cached or freshly fetched data
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  expirationInSeconds: number = 60
): Promise<T> {
  try {
    // 1. Check if we have a valid cache
    const cachedData = await redisClient.get<T>(key);
    
    // 2. Return cached data instantly if it exists
    if (cachedData) {
      console.log(`[Redis] CACHE HIT: ${key}`);
      return cachedData;
    }

    // 3. Cache miss: Fetch from the database
    console.log(`[Redis] CACHE MISS: ${key}. Fetching from DB...`);
    const freshData = await fetcher();

    // 4. Save to Redis for the next request
    if (freshData) {
      // Background cache setting so we don't block the return
      redisClient.set(key, freshData, { ex: expirationInSeconds }).catch(err => {
        console.error(`[Redis] Error setting cache for ${key}:`, err);
      });
    }

    return freshData;
  } catch (error) {
    // If Redis goes down, fallback gracefully to database fetch
    console.warn(`[Redis] Error checking cache for ${key}, falling back to DB:`, error);
    return fetcher();
  }
}
