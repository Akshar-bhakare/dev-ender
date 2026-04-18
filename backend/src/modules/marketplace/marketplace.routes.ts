import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.js';
import {
  createServiceProfileHandler,
  getMyServiceProfileHandler,
  createRequirementHandler,
  publishRequirementHandler,
  searchRequirementsHandler,
  submitProposalHandler,
  acceptProposalHandler,
  getRecommendationsHandler
} from './marketplace.controller.js';

export async function marketplaceRoutes(fastify: FastifyInstance) {
  // Service Profile
  fastify.post('/profiles', { preHandler: requireAuth, handler: createServiceProfileHandler });
  fastify.get('/profiles/me', { preHandler: requireAuth, handler: getMyServiceProfileHandler });

  // Requirements
  fastify.post('/requirements', { preHandler: requireAuth, handler: createRequirementHandler });
  fastify.post('/requirements/:requirementId/publish', { preHandler: requireAuth, handler: publishRequirementHandler });
  fastify.get('/requirements/search', searchRequirementsHandler);
  fastify.get('/requirements/:requirementId/recommendations', { preHandler: requireAuth, handler: getRecommendationsHandler });

  // Proposals
  fastify.post('/proposals', { preHandler: requireAuth, handler: submitProposalHandler });
  fastify.post('/proposals/:proposalId/accept', { preHandler: requireAuth, handler: acceptProposalHandler });
}
