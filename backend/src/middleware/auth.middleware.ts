import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../utils/auth.utils.js';

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return reply.status(401).send({ message: 'Invalid or expired token' });
    }

    // Attach user info to request
    (request as any).user = decoded;
  } catch (error) {
    return reply.status(401).send({ message: 'Unauthorized' });
  }
};

export const authorize = (roles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    if (!user || !roles.includes(user.role)) {
      return reply.status(403).send({ message: 'Forbidden' });
    }
  };
};
