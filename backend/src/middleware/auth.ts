// auth.ts — JWT decode middleware. Attaches userId, companyId,
//            isVerified, and identityVerified to the request object.
// ============================================================

import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  companyId?: string;
  isVerified: boolean;
  identityVerified: boolean;
  role?: string;
}

// Extend FastifyRequest to carry the decoded user
declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

/**
 * decodeJwt — preHandler that decodes the JWT and attaches user context.
 * Does NOT throw if no token — use requireAuth for that.
 */
export async function decodeJwt(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return;

  const token = authHeader.slice(7);
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');
    const payload = jwt.verify(token, secret) as JwtPayload;
    request.user = payload;
  } catch {
    // Invalid/expired token — treat as unauthenticated
    request.user = undefined;
  }
}

/**
 * requireAuth — preHandler that enforces authentication.
 * Returns 401 if no valid JWT is present.
 */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await decodeJwt(request, reply);
  if (!request.user) {
    reply.code(401).send({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  }
}
