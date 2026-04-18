import { FastifyRequest, FastifyReply } from 'fastify';
import { TrustScoreService } from './trust.service.js';
import { User } from '../../models/User.js';

export const updateTrust = async (request: FastifyRequest, reply: FastifyReply) => {
  // Check internal secret header
  const secret = request.headers['x-internal-secret'];
  if (secret !== process.env.INTERNAL_SECRET) {
    return reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Internal API access denied' }});
  }

  const { userId, companyId, delta, reason } = request.body as any;

  if (!delta || !reason || (!userId && !companyId)) {
    return reply.status(400).send({ success: false, message: 'Invalid payload' });
  }

  try {
    const result = await TrustScoreService.addPoints({
      userId,
      companyId,
      delta: Number(delta),
      reason,
      ip: request.ip
    });

    return reply.send({ success: true, newScore: result.newScore, level: result.level, tier: result.tier });
  } catch (error: any) {
     request.log.error(error);
     return reply.status(500).send({ success: false, message: error.message });
  }
};

export const getTrustProfile = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.params as any;
  const user = await User.findById(userId).select('trustScore trustLevel permissionTier badges identityVerified isVerified');
  if (!user) {
    return reply.status(404).send({ success: false, message: 'User not found' });
  }
  return reply.send({ success: true, profile: user });
};
