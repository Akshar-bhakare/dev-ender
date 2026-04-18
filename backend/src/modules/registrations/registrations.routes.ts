import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.js'; 
import * as RegistrationsController from './registrations.controller.js';

export async function registrationsRoutes(fastify: FastifyInstance) {
  // Routes are prefixed with /api/v1/events by index.ts but since registrations are under events:
  // Usually this is registered as fastify.register(registrationsRoutes, { prefix: '/api/v1/events' })
  
  fastify.post('/:eventId/register', { preHandler: [requireAuth] }, RegistrationsController.registerForEvent);
  fastify.post('/:eventId/checkin', { preHandler: [requireAuth] }, RegistrationsController.checkInAttendee);
  fastify.post('/:eventId/promo-codes', { preHandler: [requireAuth] }, RegistrationsController.createPromoCode);
  
  // Public webhook route (not tied to specific eventId in URL typically)
  fastify.post('/razorpay/webhook', RegistrationsController.razorpayWebhook);
}
