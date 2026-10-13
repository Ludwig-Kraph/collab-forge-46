// Inbuilt RFC 6238 TOTP engine (Google Authenticator compatible). No external auth provider.
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateSecret(length = 20): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let bits = "";
  bytes.forEach((b) => (bits += b.toString(2).padStart(8, "0")));
  let out = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5), 2)];
  return out;
}

function base32Decode(secret: string): Uint8Array {
  const clean = secret.replace(/[\s=]/g, "").toUpperCase();
  let bits = "";
  for (const c of clean) {
    const v = B32.indexOf(c);
    if (v < 0) continue;
    bits += v.toString(2).padStart(5, "0");
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(bits.slice(i * 8, i * 8 + 8), 2);
  return bytes;
}

async function hotp(secret: string, counter: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", base32Decode(secret), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(0, Math.floor(counter / 2 ** 32));
  view.setUint32(4, counter >>> 0);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, buf));
  const off = sig[sig.length - 1] & 0x0f;
  const code = ((sig[off] & 0x7f) << 24) | (sig[off + 1] << 16) | (sig[off + 2] << 8) | sig[off + 3];
  return (code % 1_000_000).toString().padStart(6, "0");
}

export async function verifyTotp(secret: string, token: string, window = 1): Promise<boolean> {
  const counter = Math.floor(Date.now() / 30000);
  const t = token.replace(/\s/g, "");
  for (let w = -window; w <= window; w++) if ((await hotp(secret, counter + w)) === t) return true;
  return false;
}

export function otpauthUri(secret: string, account: string) {
  return `otpauth://totp/M-Leja:${encodeURIComponent(account)}?secret=${secret}&issuer=M-Leja&digits=6&period=30`;
}

async function sha256(s: string) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Local security vault keyed by hashed account identifier
const KEY = "mleja.sec.v1";
type Vault = Record<string, { totp?: string; pinHash?: string }>;
const read = (): Vault => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
const write = (v: Vault) => localStorage.setItem(KEY, JSON.stringify(v));

export async function getSecurity(account: string) { return read()[await sha256(account)] || {}; }
export async function setSecurity(account: string, patch: { totp?: string | null; pin?: string | null }) {
  const id = await sha256(account);
  const v = read();
  const cur = { ...(v[id] || {}) };
  if (patch.totp !== undefined) { if (patch.totp) cur.totp = patch.totp; else delete cur.totp; }
  if (patch.pin !== undefined) { if (patch.pin) cur.pinHash = await sha256(account + ":" + patch.pin); else delete cur.pinHash; }
  v[id] = cur; write(v);
}
export async function verifyPin(account: string, pin: string) {
  const s = await getSecurity(account);
  return !!s.pinHash && s.pinHash === (await sha256(account + ":" + pin));
}
