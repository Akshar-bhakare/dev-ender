import { FastifyInstance } from 'fastify';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/:userId', getProfile);
  fastify.put('/me', { preHandler: [requireAuth] }, updateProfile);
}
