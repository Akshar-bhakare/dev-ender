import { FastifyReply, FastifyRequest } from 'fastify';
import { MarketplaceService } from './marketplace.service.js';

export async function createServiceProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const companyId = request.user?.companyId;
  if (!companyId) return reply.code(400).send({ error: 'User is not associated with a company.' });
  
  const profile = await MarketplaceService.createServiceProfile(companyId, request.body);
  return reply.code(201).send(profile);
}

export async function getMyServiceProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const companyId = request.user?.companyId;
  if (!companyId) return reply.code(400).send({ error: 'User is not associated with a company.' });
  
  const profile = await MarketplaceService.getServiceProfile(companyId);
  return reply.send(profile);
}

export async function createRequirementHandler(request: FastifyRequest, reply: FastifyReply) {
  const companyId = request.user?.companyId;
  if (!companyId) return reply.code(400).send({ error: 'User is not associated with a company.' });
  
  const requirement = await MarketplaceService.createRequirement(companyId, request.user!.userId, request.body);
  return reply.code(201).send(requirement);
}

export async function publishRequirementHandler(request: FastifyRequest, reply: FastifyReply) {
  const { requirementId } = request.params as { requirementId: string };
  const companyId = request.user?.companyId;
  if (!companyId) return reply.code(403).send({ error: 'Unauthorized.' });
  
  const requirement = await MarketplaceService.publishRequirement(requirementId, companyId);
  return reply.send(requirement);
}

export async function searchRequirementsHandler(request: FastifyRequest, reply: FastifyReply) {
  const requirements = await MarketplaceService.searchRequirements(request.query);
  return reply.send(requirements);
}

export async function submitProposalHandler(request: FastifyRequest, reply: FastifyReply) {
  const companyId = request.user?.companyId;
  if (!companyId) return reply.code(403).send({ error: 'Only companies can submit proposals.' });
  
  const proposal = await MarketplaceService.submitProposal(companyId, request.user!.userId, request.body);
  return reply.code(201).send(proposal);
}

export async function acceptProposalHandler(request: FastifyRequest, reply: FastifyReply) {
  const { proposalId } = request.params as { proposalId: string };
  const companyId = request.user?.companyId;
  if (!companyId) return reply.code(403).send({ error: 'Unauthorized.' });
  
  const result = await MarketplaceService.acceptProposal(proposalId, companyId, request.user!.userId);
  return reply.send(result);
}

export async function getRecommendationsHandler(request: FastifyRequest, reply: FastifyReply) {
  const { requirementId } = request.params as { requirementId: string };
  const providers = await MarketplaceService.getMatchingProviders(requirementId);
  return reply.send(providers);
}
