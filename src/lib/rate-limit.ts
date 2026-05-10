type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** حد بسيط في الذاكرة (مناسب لعقدة واحدة؛ للإنتاج المتعدد استخدم Redis/Upstash). */
export function rateLimitHit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (b.count >= limit) return true;
  b.count += 1;
  return false;
}
