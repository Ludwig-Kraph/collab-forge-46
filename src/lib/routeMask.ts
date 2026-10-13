// Ephemeral, session-locked route masks. Tokens live in sessionStorage only and
// are wiped on logout or when the tab closes, so masked links cannot be reused.
const KEY = "mleja.rm";
const ALPHA = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function token() {
  const len = 12 + Math.floor(Math.random() * 25); // 12-36 chars
  const b = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(b, (x) => ALPHA[x % ALPHA.length]).join("");
}
const read = (): Record<string, string> => { try { return JSON.parse(sessionStorage.getItem(KEY) || "{}"); } catch { return {}; } };

/** Returns a masked URL (/r/<token>) for a real path; same path reuses its token within the session. */
export function maskPath(realPath: string): string {
  const map = read();
  const existing = Object.entries(map).find(([, p]) => p === realPath);
  if (existing) return `/r/${existing[0]}`;
  const t = token();
  map[t] = realPath;
  sessionStorage.setItem(KEY, JSON.stringify(map));
  return `/r/${t}`;
}
export function resolveMask(t: string): string | null { return read()[t] ?? null; }
export function clearMasks() { sessionStorage.removeItem(KEY); }
