/**
 * Delay utility for tests
 * Helps prevent rate limiting by adding delays between test operations
 */

// Track rate limit state
let consecutiveRateLimitHits = 0;
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 100; // Minimum ms between requests

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Delay between test files to allow rate limits to reset
 * Default: 5 seconds
 */
export async function delayBetweenTestFiles(ms: number = 5000): Promise<void> {
  console.log(`[Rate Limit] Cooling down between test files (${ms}ms)...`);
  await sleep(ms);
  // Reset rate limit tracking for new test file
  consecutiveRateLimitHits = 0;
}

/**
 * Delay between test operations within a test file
 * Default: 1 second
 */
export async function delayBetweenTests(ms: number = 1000): Promise<void> {
  await sleep(ms);
}

/**
 * Adaptive delay based on rate limit state
 * Automatically increases delay when rate limits are hit
 */
export async function adaptiveDelay(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  // Calculate delay based on consecutive rate limit hits
  let delay = MIN_REQUEST_INTERVAL;
  if (consecutiveRateLimitHits > 0) {
    // Exponential backoff: 500ms, 1s, 2s, 4s, 8s, max 30s
    delay = Math.min(500 * Math.pow(2, consecutiveRateLimitHits - 1), 30000);
    console.log(`[Rate Limit] Adaptive delay: ${delay}ms (${consecutiveRateLimitHits} consecutive hits)`);
  }

  // Ensure minimum interval between requests
  if (timeSinceLastRequest < delay) {
    await sleep(delay - timeSinceLastRequest);
  }

  lastRequestTime = Date.now();
}

/**
 * Record a rate limit hit for adaptive delay calculation
 */
export function recordRateLimitHit(): void {
  consecutiveRateLimitHits++;
  console.log(`[Rate Limit] Hit recorded (${consecutiveRateLimitHits} consecutive)`);
}

/**
 * Record a successful request (resets rate limit counter)
 */
export function recordSuccessfulRequest(): void {
  if (consecutiveRateLimitHits > 0) {
    console.log(`[Rate Limit] Reset after successful request`);
  }
  consecutiveRateLimitHits = 0;
  lastRequestTime = Date.now();
}

/**
 * Get current rate limit state
 */
export function getRateLimitState(): { hits: number; lastRequest: number } {
  return {
    hits: consecutiveRateLimitHits,
    lastRequest: lastRequestTime,
  };
}

/**
 * Cooldown period after hitting rate limit
 * Default: 5 seconds, increases with consecutive hits
 * @param baseMs - Base cooldown time in milliseconds
 */
export async function rateLimitCooldown(baseMs: number = 5000): Promise<void> {
  const multiplier = Math.min(consecutiveRateLimitHits + 1, 6); // Max 6x multiplier
  const cooldown = baseMs * multiplier;
  console.log(`[Rate Limit] Cooling down for ${cooldown}ms (multiplier: ${multiplier}x)...`);
  await sleep(cooldown);
}

/**
 * Wrapper to retry an operation with rate limit handling
 * @param operation - Async operation to execute
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param baseCooldown - Base cooldown time in ms (default: 5000)
 */
export async function withRateLimitRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseCooldown: number = 5000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await adaptiveDelay();
      const result = await operation();
      recordSuccessfulRequest();
      return result;
    } catch (err: any) {
      lastError = err;
      const status = err.response?.status || err.status;

      // Check for rate limit (429) or too many requests patterns
      if (status === 429 || err.message?.includes('rate limit') || err.message?.includes('too many requests')) {
        recordRateLimitHit();

        if (attempt < maxRetries) {
          console.log(`[Rate Limit] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying after cooldown...`);
          await rateLimitCooldown(baseCooldown);
          continue;
        }
      }

      // For non-rate-limit errors, throw immediately
      throw err;
    }
  }

  throw lastError || new Error('Operation failed after retries');
}

/**
 * Batch operations with rate limit awareness
 * Executes operations sequentially with delays between them
 * @param operations - Array of async operations
 * @param delayBetween - Delay between operations in ms (default: 500)
 */
export async function batchWithRateLimit<T>(
  operations: (() => Promise<T>)[],
  delayBetween: number = 500
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < operations.length; i++) {
    if (i > 0) {
      await sleep(delayBetween);
    }
    const result = await withRateLimitRetry(operations[i]);
    results.push(result);
  }

  return results;
}
