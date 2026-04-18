import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.js'; 
import { requireFaceVerified } from '../../middleware/requireRole.js'; // Note we might need to adjust imports
import * as EventsController from './events.controller.js';

export async function eventsRoutes(fastify: FastifyInstance) {
  fastify.post('/', { preHandler: [requireAuth] }, EventsController.createEvent);
  fastify.patch('/:eventId', { preHandler: [requireAuth] }, EventsController.updateEvent);
  fastify.post('/:eventId/publish', { preHandler: [requireAuth] }, EventsController.publishEvent);
  fastify.post('/:eventId/complete', { preHandler: [requireAuth] }, EventsController.completeEvent);
  fastify.post('/:eventId/cancel', { preHandler: [requireAuth] }, EventsController.cancelEvent);
  
  fastify.get('/search', EventsController.searchEvents);
  fastify.get('/:slugOrId', EventsController.getEventDetail);
  fastify.post('/banner-upload', { preHandler: [requireAuth] }, EventsController.getUploadSignature);
}
