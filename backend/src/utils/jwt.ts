import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dream-decoder-secret-key';
const JWT_EXPIRES_IN = '7d';

interface JwtPayload {
  userId: string;
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
