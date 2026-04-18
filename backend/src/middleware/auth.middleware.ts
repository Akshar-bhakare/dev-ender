import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../utils/auth.utils.js';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';

export const requireAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid token' } });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = verifyToken(token);

    if (!decoded) {
      return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
    }

    // fetch the full entity from db based on what's in the decoded token
    if (decoded.pendingSignup) {
        // Pre-verification token — no DB lookup, just attach the payload
        (request as any).pendingSignup = decoded;
        (request as any).accountType = 'pending';
    } else if (decoded.accountType === 'company') {
        const company = await Company.findById(decoded.id);
        if (!company) {
            return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Company not found' } });
        }
        (request as any).company = company;
        (request as any).accountType = 'company';
    } else {
        const user = await User.findById(decoded.id);
        if (!user) {
            return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'User not found' } });
        }
        (request as any).user = user;
        (request as any).accountType = 'user';
    }

  } catch (error) {
    return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } });
  }
};

export const requireActiveAccount = async (request: FastifyRequest, reply: FastifyReply) => {
    const accountType = (request as any).accountType;
    let status;

    if (accountType === 'company') {
        status = (request as any).company?.status;
    } else {
        status = (request as any).user?.status;
    }

    if (status !== 'active') {
        return reply.status(403).send({ success: false, error: { code: 'ACCOUNT_NOT_ACTIVE', message: 'Account is not in active state' } });
    }
};

export const requireTier = (minTier: number) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const accountType = (request as any).accountType;
    let currentTier = 1;

    if (accountType === 'company') {
      currentTier = (request as any).company?.permissionTier || 1;
    } else {
      currentTier = (request as any).user?.permissionTier || 1;
    }

    if (currentTier < minTier) {
      return reply.status(403).send({ 
          success: false, 
          error: { code: 'INSUFFICIENT_TRUST_TIER', message: `Required trust tier ${minTier}, but found ${currentTier}` } 
      });
    }
  };
};

export const authorize = (roles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user; 
    // companies don't have roles the same way. Usually this is for user roles.
    if (!user || !roles.includes(user.role)) {
      return reply.status(403).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Insufficient role permissions' } });
    }
  };
};
