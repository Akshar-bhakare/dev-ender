import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.middleware.js';
import * as CompanyInviteController from '../controllers/company-invite.controller.js';

export default async function companyInviteRoutes(fastify: FastifyInstance) {
    fastify.post('/invite-host', { preHandler: [requireAuth] }, CompanyInviteController.inviteHost);
    fastify.get('/invite/verify-token', CompanyInviteController.verifyInviteToken);
    fastify.post('/invite/accept', { preHandler: [requireAuth] }, CompanyInviteController.acceptInvite);
    fastify.get('/event-hosts', { preHandler: [requireAuth] }, CompanyInviteController.getCompanyHosts);
    fastify.delete('/event-hosts/:assignmentId', { preHandler: [requireAuth] }, CompanyInviteController.removeCompanyHost);
}
