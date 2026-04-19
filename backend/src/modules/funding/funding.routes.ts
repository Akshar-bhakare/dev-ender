import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.middleware.js';
import {
  listRounds, getRound, createRound, updateRound,
  approveRound, freezeRound, createInvestmentSession,
  stripeWebhook, getPortfolio, getRecommended, getMyRounds, getMarketplaceConnections
} from './funding.controller.js';

export async function fundingRoutes(fastify: FastifyInstance) {
  // Public
  fastify.get('/', listRounds);
  fastify.get('/recommended', { preHandler: [requireAuth] }, getRecommended);
  fastify.get('/connections', { preHandler: [requireAuth] }, getMarketplaceConnections);
  fastify.get('/:id', getRound);

  // Investor
  fastify.post('/invest', { preHandler: [requireAuth] }, createInvestmentSession);
  fastify.get('/portfolio/me', { preHandler: [requireAuth] }, getPortfolio);

  // Company
  fastify.post('/', { preHandler: [requireAuth] }, createRound);
  fastify.patch('/:id', { preHandler: [requireAuth] }, updateRound);
  fastify.get('/company/mine', { preHandler: [requireAuth] }, getMyRounds);

  // Admin
  fastify.post('/:id/approve', { preHandler: [requireAuth] }, approveRound);
  fastify.post('/:id/freeze', { preHandler: [requireAuth] }, freezeRound);

  // Stripe webhook (raw body needed)
  fastify.post('/webhook/stripe', { config: { rawBody: true } }, stripeWebhook);
}
