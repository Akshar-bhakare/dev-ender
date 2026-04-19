import { FastifyInstance } from 'fastify';
import * as AdminController from './admin.controller.js';
import { requireAuth, authorize } from '../../middleware/auth.middleware.js';

export default async function adminRoutes(fastify: FastifyInstance) {
  // Protect all admin routes
  fastify.addHook('preHandler', requireAuth);
  fastify.addHook('preHandler', authorize(['admin']));

  fastify.get('/admin/flagged-users', AdminController.listFlaggedUsers);
  fastify.post('/admin/users/:userId/approve', AdminController.approveUser);
  fastify.post('/admin/users/:userId/reject', AdminController.rejectUser);

  fastify.get('/admin/flagged-companies', AdminController.listFlaggedCompanies);
  fastify.post('/admin/companies/:companyId/verify', AdminController.verifyCompany);
  fastify.post('/admin/companies/:companyId/reject', AdminController.rejectCompany);
}
