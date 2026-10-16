const ipWindowMs = 10 * 60 * 1000;
const globalWindowMs = 60 * 60 * 1000;
const ipAttempts = new Map<string, number[]>();
let globalAttempts: number[] = [];
let nextCleanupAt = 0;

// Single-process rolling limits; state resets on container restart.
export function takeContactAttempt(ip: string, now = Date.now()): boolean {
  if (now >= nextCleanupAt) {
    for (const [key, timestamps] of ipAttempts) {
      if (timestamps.every((time) => time <= now - ipWindowMs)) ipAttempts.delete(key);
    }
    nextCleanupAt = now + 60000;
  }

  const attempts = (ipAttempts.get(ip) ?? []).filter((time) => time > now - ipWindowMs);
  if (attempts.length >= 5 || (!ipAttempts.has(ip) && ipAttempts.size >= 10000)) return false;

  ipAttempts.set(ip, [...attempts, now]);
  return true;
}

export function takeContactEmailSlot(now = Date.now()): boolean {
  globalAttempts = globalAttempts.filter((time) => time > now - globalWindowMs);
  if (globalAttempts.length >= 30) return false;
  globalAttempts.push(now);
  return true;
}
