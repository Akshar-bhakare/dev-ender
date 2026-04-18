import { FastifyInstance } from 'fastify';
import { updateTrust, getTrustProfile } from './trust.controller.js';

export default async function trustRoutes(fastify: FastifyInstance) {
  fastify.post('/trust/update', updateTrust);
  fastify.get('/trust/profile/:userId', getTrustProfile);
}
