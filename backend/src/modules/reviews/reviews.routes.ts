import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.js'; 
import * as ReviewsController from './reviews.controller.js';

export async function reviewsRoutes(fastify: FastifyInstance) {
  fastify.post('/:eventId/reviews', { preHandler: [requireAuth] }, ReviewsController.submitReview);
  fastify.get('/:eventId/reviews', ReviewsController.getReviews);
}
