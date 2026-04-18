// ============================================================
// jobs.routes.ts — Fastify route registration for /api/v1/jobs
// ============================================================

import { FastifyInstance } from 'fastify';
import { requireAuth } from '../../middleware/auth.js';
import {
  createListingHandler,
  updateListingHandler,
  publishListingHandler,
  pauseListingHandler,
  closeListingHandler,
  deleteListingHandler,
  getCompanyListingsHandler,
  getJobApplicationsHandler,
  updateApplicationStageHandler,
  inviteUserHandler,
  searchJobsHandler,
  getJobDetailHandler,
  applyToJobHandler,
  getMyApplicationsHandler,
  saveJobHandler,
  unsaveJobHandler,
  getSavedJobsHandler,
  getMyInvitationsHandler,
  respondToInvitationHandler,
  getCategoriesHandler,
  searchSkillsHandler,
} from './jobs.controller.js';

export async function jobsRoutes(fastify: FastifyInstance) {
  // ──────────────────────────────────────────────────────────
  // PUBLIC ROUTES — No auth required
  // ──────────────────────────────────────────────────────────

  fastify.get('/search', searchJobsHandler);
  fastify.get('/listings/:jobOrSlugId', getJobDetailHandler);
  fastify.get('/categories', getCategoriesHandler);
  fastify.get('/skills/search', searchSkillsHandler);

  // ──────────────────────────────────────────────────────────
  // COMPANY / RECRUITER ROUTES
  // Authorization: companyId extracted from JWT payload.
  // Role enforcement happens inside the controller/service.
  // ──────────────────────────────────────────────────────────

  fastify.post('/listings', {
    preHandler: requireAuth,
    handler: createListingHandler,
  });

  fastify.patch('/listings/:jobId', {
    preHandler: requireAuth,
    handler: updateListingHandler,
  });

  fastify.post('/listings/:jobId/publish', {
    preHandler: requireAuth,
    handler: publishListingHandler,
  });

  fastify.post('/listings/:jobId/pause', {
    preHandler: requireAuth,
    handler: pauseListingHandler,
  });

  fastify.post('/listings/:jobId/close', {
    preHandler: requireAuth,
    handler: closeListingHandler,
  });

  fastify.delete('/listings/:jobId', {
    preHandler: requireAuth,
    handler: deleteListingHandler,
  });

  fastify.get('/company/:companyId/listings', {
    preHandler: requireAuth,
    handler: getCompanyListingsHandler,
  });

  fastify.get('/listings/:jobId/applications', {
    preHandler: requireAuth,
    handler: getJobApplicationsHandler,
  });

  fastify.patch('/applications/:applicationId/stage', {
    preHandler: requireAuth,
    handler: updateApplicationStageHandler,
  });

  fastify.post('/listings/:jobId/invite', {
    preHandler: requireAuth,
    handler: inviteUserHandler,
  });

  // ──────────────────────────────────────────────────────────
  // CANDIDATE ROUTES — Auth required
  // ──────────────────────────────────────────────────────────

  fastify.post('/listings/:jobId/apply', {
    preHandler: requireAuth,
    handler: applyToJobHandler,
  });

  fastify.get('/my-applications', {
    preHandler: requireAuth,
    handler: getMyApplicationsHandler,
  });

  fastify.post('/listings/:jobId/save', {
    preHandler: requireAuth,
    handler: saveJobHandler,
  });

  fastify.delete('/listings/:jobId/save', {
    preHandler: requireAuth,
    handler: unsaveJobHandler,
  });

  fastify.get('/saved', {
    preHandler: requireAuth,
    handler: getSavedJobsHandler,
  });

  fastify.get('/my-invitations', {
    preHandler: requireAuth,
    handler: getMyInvitationsHandler,
  });

  fastify.patch('/invitations/:invitationId', {
    preHandler: requireAuth,
    handler: respondToInvitationHandler,
  });
}
