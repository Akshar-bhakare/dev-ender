import { FastifyInstance } from 'fastify';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';
import { 
  initiateClaimHandler, 
  addSignalHandler, 
  adminReviewHandler,
  uploadEvidenceHandler
} from './verification.controller.js';

export async function verificationRoutes(fastify: FastifyInstance) {
  // Publicly accessible for authenticated users
  fastify.post('/claims', {
    preHandler: requireAuth,
    handler: initiateClaimHandler
  });

  fastify.post('/claims/:claimId/signals', {
    preHandler: requireAuth,
    handler: addSignalHandler
  });

  fastify.post('/claims/:claimId/evidence', {
    preHandler: requireAuth,
    handler: uploadEvidenceHandler
  });

  // Administrative fallback
  fastify.post('/claims/:claimId/review', {
    preHandler: requireAdmin,
    handler: adminReviewHandler
  });
}
