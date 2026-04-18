import { FastifyInstance } from 'fastify';
import { getFeed, createPost } from '../controllers/post.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export default async function postRoutes(fastify: FastifyInstance) {
  // Feed is public for demo purposes if needed, but usually authenticated
  fastify.get('/', getFeed); 
  
  fastify.post('/', { preHandler: [authenticate] }, createPost);
}
