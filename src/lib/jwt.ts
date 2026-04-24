// src/lib/jwt.ts
// Helper centralisé pour le secret JWT — NE JAMAIS utiliser de fallback

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}
