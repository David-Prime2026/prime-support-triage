/** PostgREST / Supabase errors are often plain objects, not Error. */
export function errMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === "object") {
    const o = err as { message?: unknown; error?: unknown; details?: unknown; code?: unknown };
    const parts = [o.message, o.error, o.details, o.code].filter((p) => typeof p === "string" && p.trim());
    if (parts.length) return parts.map(String).join(" · ");
    try {
      return JSON.stringify(err);
    } catch {
      return "[unserializable error]";
    }
  }
  return String(err);
}
