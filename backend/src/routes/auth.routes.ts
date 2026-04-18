import { FastifyInstance } from 'fastify';
import { register, login, verifyFace, verifyDoc } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', register);
  fastify.post('/login', login);
  fastify.post('/verify-face', { preHandler: [authenticate] }, verifyFace);
  fastify.post('/verify-doc', { preHandler: [authenticate] }, verifyDoc);
}

