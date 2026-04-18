// ============================================================
// jobs.controller.ts — Request handlers (thin delegators)
// ============================================================

import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';
import { JobsService } from './jobs.service.js';
import { JobError } from './jobs.errors.js';
import {
  CreateJobSchema,
  UpdateJobSchema,
  ApplyToJobSchema,
  UpdateApplicationStageSchema,
  InviteUserSchema,
  RespondToInvitationSchema,
  JobSearchSchema,
} from './jobs.validation.js';
import { Profile } from '../../models/Profile.js';

// ─── Helper: normalize errors to consistent shape ────────────
function handleError(reply: FastifyReply, error: unknown) {
  if (error instanceof JobError) {
    return reply.code(error.statusCode).send({
      success: false,
      error: { code: error.code, message: error.message },
    });
  }

  if (error instanceof ZodError) {
    return reply.code(422).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
      },
    });
  }

  // Mongoose duplicate key
  const err = error as { code?: number; message?: string };
  if (err.code === 11000) {
    return reply.code(409).send({
      success: false,
      error: { code: 'DUPLICATE_APPLICATION', message: 'Already exists.' },
    });
  }

  console.error('[JobsController]', error);
  return reply.code(500).send({
    success: false,
    error: { code: 'SERVER_ERROR', message: 'An unexpected error occurred.' },
  });
}

// ─── Company / Recruiter Controllers ─────────────────────────

export async function createListingHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const user = req.user!;
    const body = CreateJobSchema.parse(req.body);
    const listing = await JobsService.createListing(user.companyId!, user.userId, body);
    return reply.code(201).send({ success: true, data: listing });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function updateListingHandler(
  req: FastifyRequest<{ Params: { jobId: string } }>,
  reply: FastifyReply
) {
  try {
    const user = req.user!;
    const body = UpdateJobSchema.parse(req.body);
    const listing = await JobsService.updateListing(req.params.jobId, user.companyId!, body);
    return reply.send({ success: true, data: listing });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function publishListingHandler(
  req: FastifyRequest<{ Params: { jobId: string } }>,
  reply: FastifyReply
) {
  try {
    const listing = await JobsService.publishListing(req.params.jobId, req.user!.companyId!);
    return reply.send({ success: true, data: listing });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function pauseListingHandler(
  req: FastifyRequest<{ Params: { jobId: string } }>,
  reply: FastifyReply
) {
  try {
    const listing = await JobsService.pauseListing(req.params.jobId, req.user!.companyId!);
    return reply.send({ success: true, data: listing });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function closeListingHandler(
  req: FastifyRequest<{ Params: { jobId: string } }>,
  reply: FastifyReply
) {
  try {
    const listing = await JobsService.closeListing(req.params.jobId, req.user!.companyId!);
    return reply.send({ success: true, data: listing });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function deleteListingHandler(
  req: FastifyRequest<{ Params: { jobId: string } }>,
  reply: FastifyReply
) {
  try {
    const result = await JobsService.deleteListing(req.params.jobId, req.user!.companyId!);
    return reply.send({ success: true, data: result });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function getCompanyListingsHandler(
  req: FastifyRequest<{
    Params: { companyId: string };
    Querystring: { status?: string; page?: string; limit?: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { status, page, limit } = req.query;
    const result = await JobsService.getCompanyListings(req.params.companyId, {
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? Math.min(parseInt(limit), 50) : 20,
    });
    return reply.send({ success: true, data: result });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function getJobApplicationsHandler(
  req: FastifyRequest<{
    Params: { jobId: string };
    Querystring: { stage?: string; page?: string; limit?: string };
  }>,
  reply: FastifyReply
) {
  try {
    const { stage, page, limit } = req.query;
    const result = await JobsService.getJobApplications(
      req.params.jobId,
      req.user!.companyId!,
      {
        stage,
        page: page ? parseInt(page) : 1,
        limit: limit ? Math.min(parseInt(limit), 50) : 20,
      }
    );
    return reply.send({ success: true, data: result });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function updateApplicationStageHandler(
  req: FastifyRequest<{ Params: { applicationId: string } }>,
  reply: FastifyReply
) {
  try {
    const body = UpdateApplicationStageSchema.parse(req.body);
    const result = await JobsService.updateApplicationStage(
      req.params.applicationId,
      req.user!.companyId!,
      req.user!.userId,
      body
    );
    return reply.send({ success: true, data: result });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function inviteUserHandler(
  req: FastifyRequest<{ Params: { jobId: string } }>,
  reply: FastifyReply
) {
  try {
    const body = InviteUserSchema.parse(req.body);
    const invitation = await JobsService.inviteUser(
      req.params.jobId,
      req.user!.userId,
      body.invitedUserId,
      body.message
    );
    return reply.code(201).send({ success: true, data: invitation });
  } catch (e) {
    handleError(reply, e);
  }
}

// ─── Candidate / Public Controllers ──────────────────────────

export async function searchJobsHandler(
  req: FastifyRequest<{ Querystring: Record<string, string> }>,
  reply: FastifyReply
) {
  try {
    const params = JobSearchSchema.parse(req.query);
    const result = await JobsService.searchJobs(params);
    return reply.send({ success: true, data: result });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function getJobDetailHandler(
  req: FastifyRequest<{ Params: { jobOrSlugId: string } }>,
  reply: FastifyReply
) {
  try {
    const detail = await JobsService.getJobDetail(req.params.jobOrSlugId);
    return reply.send({ success: true, data: detail });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function applyToJobHandler(
  req: FastifyRequest<{ Params: { jobId: string } }>,
  reply: FastifyReply
) {
  try {
    const user = req.user!;
    const body = ApplyToJobSchema.parse(req.body);

    // Fetch candidate profile for experience check
    const profile = await Profile.findOne({ user: user.userId });
    const totalExperienceMonths = profile
      ? profile.experience.reduce((acc, exp) => {
          const start = new Date(exp.startDate);
          const end = exp.current ? new Date() : exp.endDate ? new Date(exp.endDate) : new Date();
          const months =
            (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth());
          return acc + Math.max(0, months);
        }, 0)
      : 0;

    const application = await JobsService.applyToJob(
      req.params.jobId,
      user.userId,
      user.identityVerified,
      totalExperienceMonths,
      body
    );
    return reply.code(201).send({ success: true, data: application });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function getMyApplicationsHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const apps = await JobsService.getMyApplications(req.user!.userId);
    return reply.send({ success: true, data: apps });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function saveJobHandler(
  req: FastifyRequest<{ Params: { jobId: string } }>,
  reply: FastifyReply
) {
  try {
    const result = await JobsService.saveJob(req.user!.userId, req.params.jobId, req.user!.identityVerified);
    return reply.code(201).send({ success: true, data: result });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function unsaveJobHandler(
  req: FastifyRequest<{ Params: { jobId: string } }>,
  reply: FastifyReply
) {
  try {
    const result = await JobsService.unsaveJob(req.user!.userId, req.params.jobId);
    return reply.send({ success: true, data: result });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function getSavedJobsHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const saved = await JobsService.getSavedJobs(req.user!.userId);
    return reply.send({ success: true, data: saved });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function getMyInvitationsHandler(req: FastifyRequest, reply: FastifyReply) {
  try {
    const invitations = await JobsService.getMyInvitations(req.user!.userId);
    return reply.send({ success: true, data: invitations });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function respondToInvitationHandler(
  req: FastifyRequest<{ Params: { invitationId: string } }>,
  reply: FastifyReply
) {
  try {
    const body = RespondToInvitationSchema.parse(req.body);
    const result = await JobsService.respondToInvitation(
      req.params.invitationId,
      req.user!.userId,
      body.status
    );
    return reply.send({ success: true, data: result });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function getCategoriesHandler(_req: FastifyRequest, reply: FastifyReply) {
  try {
    const categories = await JobsService.getCategories();
    return reply.send({ success: true, data: categories });
  } catch (e) {
    handleError(reply, e);
  }
}

export async function searchSkillsHandler(
  req: FastifyRequest<{ Querystring: { q?: string } }>,
  reply: FastifyReply
) {
  try {
    const q = req.query.q || '';
    const skills = await JobsService.searchSkills(q);
    return reply.send({ success: true, data: skills });
  } catch (e) {
    handleError(reply, e);
  }
}
