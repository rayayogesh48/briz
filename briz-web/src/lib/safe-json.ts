/**
 * Safely parse JSON strings with fallbacks for null, undefined, whitespace, or malformed data.
 * Prevents "Unexpected end of JSON input" errors during localStorage or network reads.
 */
export function safeJsonParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw || typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") {
    return fallback;
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return fallback;
  }
}
