const encoder = new TextEncoder();

const PBKDF2_ITERATIONS = 210_000;
const PBKDF2_SALT_BYTES = 16;
const PBKDF2_KEY_BYTES = 32;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const cleaned = hex.trim();
  if (cleaned.length % 2 !== 0) {
    throw new Error('Invalid hex string.');
  }

  const result = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < cleaned.length; i += 2) {
    result[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
  }

  return result;
}

async function hashPasswordLegacy(password: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  return toHex(new Uint8Array(digest));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(PBKDF2_SALT_BYTES));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt,
      iterations: PBKDF2_ITERATIONS,
    },
    keyMaterial,
    PBKDF2_KEY_BYTES * 8,
  );

  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${toHex(new Uint8Array(derivedBits))}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;

  if (!storedHash.startsWith('pbkdf2$')) {
    return (await hashPasswordLegacy(password)) === storedHash;
  }

  const parts = storedHash.split('$');
  if (parts.length !== 4) return false;

  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const salt = fromHex(parts[2]);
  const expectedHex = parts[3];

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: salt as unknown as BufferSource,
      iterations,
    },
    keyMaterial,
    (expectedHex.length / 2) * 8,
  );

  return toHex(new Uint8Array(derivedBits)) === expectedHex;
}

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}
