import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.js';
import * as TrustController from './trust.controller.js';

export async function trustRoutes(fastify: FastifyInstance) {
  fastify.post('/calculate-organizer-score', { preHandler: [requireAuth] }, TrustController.calculateOrganizerScore);
  fastify.post('/update-reputation', { preHandler: [requireAuth] }, TrustController.updateReputation);
}
