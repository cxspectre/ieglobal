import { createHash, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'showcase_access';
const SALT = 'showcase_salt_ie_global';

export function hashPassword(password: string): string {
  return createHash('sha256').update(password + SALT).digest('hex');
}

function hash(password: string): string {
  return hashPassword(password);
}

/** Server-only: compute the expected cookie value for the configured password. */
export function getExpectedToken(): string | null {
  const password = process.env.SHOWCASE_PASSWORD;
  if (!password) return null;
  return hash(password);
}

/** Server-only: verify that the given cookie value is valid. */
export function verifyToken(cookieValue: string | undefined): boolean {
  const expected = getExpectedToken();
  if (!expected) return false;
  if (!cookieValue || cookieValue.length !== 64) return false;
  try {
    const bufExpected = Buffer.from(expected, 'hex');
    const bufActual = Buffer.from(cookieValue, 'hex');
    return bufExpected.length === bufActual.length && timingSafeEqual(bufExpected, bufActual);
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
