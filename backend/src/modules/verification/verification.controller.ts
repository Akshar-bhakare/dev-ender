import { FastifyReply, FastifyRequest } from 'fastify';
import { VerificationService } from './verification.service.js';
import { ClaimStatus } from '../../models/OwnershipClaim.js';

export async function initiateClaimHandler(request: FastifyRequest, reply: FastifyReply) {
  const { companyId } = request.body as { companyId: string };
  const userId = request.user?.userId;

  if (!userId) return reply.code(401).send({ error: 'Auth required' });

  try {
    const claim = await VerificationService.initiateClaim(companyId, userId);
    return reply.send(claim);
  } catch (error: any) {
    return reply.code(400).send({ error: error.message });
  }
}

export async function addSignalHandler(request: FastifyRequest, reply: FastifyReply) {
  const { claimId } = request.params as { claimId: string };
  const signalData = request.body; // { type, confidence, data }
  const userId = request.user?.userId;

  try {
    const claim = await VerificationService.addSignal(claimId, signalData, userId);
    return reply.send(claim);
  } catch (error: any) {
    return reply.code(400).send({ error: error.message });
  }
}

export async function adminReviewHandler(request: FastifyRequest, reply: FastifyReply) {
  const { claimId } = request.params as { claimId: string };
  const { status, notes } = request.body as { status: ClaimStatus, notes: string };
  const adminId = request.user?.userId;

  if (!adminId) return reply.code(401).send({ error: 'Admin Auth required' });

  try {
    const claim = await VerificationService.adminReview(claimId, status, notes, adminId);
    return reply.send(claim);
  } catch (error: any) {
    return reply.code(400).send({ error: error.message });
  }
}

export async function uploadEvidenceHandler(request: FastifyRequest, reply: FastifyReply) {
  // Logic for handling document uploads would go here
  // For now, we return 200 to indicate the endpoint is ready
  return reply.send({ message: 'Evidence upload endpoint ready.' });
}
