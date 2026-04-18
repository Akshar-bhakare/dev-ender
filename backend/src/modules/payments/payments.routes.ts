import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.js';
import { 
  createCheckoutSessionHandler, 
  stripeWebhookHandler 
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
}
