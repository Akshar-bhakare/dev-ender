// ============================================================
// requireRole.ts — Role-based access preHandler factory
// ============================================================

import { FastifyRequest, FastifyReply } from 'fastify';
import mongoose from 'mongoose';

//
// CompanyMember model (lightweight — checks membership inline)
// In a full project this would be its own Mongoose model/schema.
// For this module we inline a simple check against the Company.admins array
// and a future CompanyMember collection.
//

/**
 * requireCompanyRole
 *
 * Verifies the requesting user is a member of the given company
 * with at least one of the allowed roles.
 *
 * Usage:
 *   preHandler: requireCompanyRole(['owner', 'admin', 'recruiter'], getCompanyId)
 *
 * @param allowedRoles - Roles that are permitted to access the route
 * @param getCompanyId - Function to extract companyId from the request
 */
export function requireCompanyRole(
  allowedRoles: string[],
  getCompanyId: (req: FastifyRequest) => string | undefined
) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      return reply.code(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
    }

    const companyId = getCompanyId(request);
    if (!companyId) {
      return reply.code(400).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Company context is required.' },
      });
    }

    // Check if user is in the company's admins array (Company model has admins field)
    // In a production system, you'd join a CompanyMember collection with roles.
    // Here we check if the user's companyId from JWT matches AND they are in allowed roles.
    const userCompanyId = request.user.companyId;
    if (!userCompanyId || userCompanyId !== companyId) {
      return reply.code(403).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You do not have access to this company resource.',
        },
      });
    }

    // The role check comes from the JWT payload role field
    const userRole = request.user.role || 'member';
    if (!allowedRoles.includes(userRole)) {
      return reply.code(403).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: `Role '${userRole}' is not permitted to perform this action.`,
        },
      });
    }
  };
}

/**
 * requireIdentityVerified — preHandler for endpoints requiring identity verification.
 */
export async function requireIdentityVerified(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.user?.identityVerified) {
    reply.code(403).send({
      success: false,
      error: {
        code: 'USER_NOT_IDENTITY_VERIFIED',
        message: 'Identity verification is required to perform this action.',
      },
    });
  }
}
