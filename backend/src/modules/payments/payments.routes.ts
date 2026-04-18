import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.js';
import { 
  createCheckoutSessionHandler, 
  stripeWebhookHandler,
  createPayment,
  releasePayout,
  refundPayment,
  freezePayout,
  releaseMilestone
} from './payments.controller.js';

export async function paymentsRoutes(fastify: FastifyInstance) {
  // Initiates checkout - Requires Auth
  fastify.post('/checkout', {
    preHandler: requireAuth,
    handler: createCheckoutSessionHandler
  });

  // Stripe Webhook - MUST be public and handled with raw body
  fastify.post('/webhook', {
    config: {
      rawBody: true // Tell fastify-raw-body to capture this
    },
    handler: stripeWebhookHandler
  });

  // Escrow Lifecycle endpoints
  fastify.post('/create', { preHandler: requireAuth, handler: createPayment });
  fastify.post('/release', { preHandler: requireAuth, handler: releasePayout });
  fastify.post('/refund', { preHandler: requireAuth, handler: refundPayment });
  fastify.post('/freeze', { preHandler: requireAuth, handler: freezePayout });
  fastify.post('/release-milestone', { preHandler: requireAuth, handler: releaseMilestone });
}
