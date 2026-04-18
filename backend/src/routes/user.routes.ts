import { FastifyInstance } from 'fastify';
import { getProfile, updateProfile, followUser, unfollowUser, getRecommendations, sendConnectionRequest, respondToConnection } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export default async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/recommendations', { preHandler: [requireAuth] }, getRecommendations);
  fastify.get('/:userId', getProfile);
  fastify.patch('/me', { preHandler: [requireAuth] }, updateProfile);
  fastify.post('/:userId/follow', { preHandler: [requireAuth] }, followUser);
  fastify.post('/:userId/unfollow', { preHandler: [requireAuth] }, unfollowUser);
  fastify.post('/:userId/connect', { preHandler: [requireAuth] }, sendConnectionRequest);
  fastify.patch('/connections/:connectionId', { preHandler: [requireAuth] }, respondToConnection);
}
