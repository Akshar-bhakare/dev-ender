import { FastifyRequest, FastifyReply } from 'fastify';
import { User } from '../../models/User.js';
import { Company } from '../../models/Company.js';
import { TrustScoreService } from '../trust/trust.service.js';

export const listFlaggedUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  const users = await User.find({ flagForManualReview: true });
  return reply.send({ success: true, users });
};

export const approveUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.params as any;
  const user = await User.findById(userId);
  
  if (!user) return reply.status(404).send({ success: false, message: 'User not found' });

  user.flagForManualReview = false;
  user.flagReason = undefined;
  user.documentVerificationStatus = 'verified';
  user.identityVerified = user.faceVerified; // Assuming document is now good
  await user.save();

  // Refund the flag penalty or give bonus if desired
  await TrustScoreService.addPoints({ userId: user._id.toString(), delta: 25, reason: 'Admin approved document' });

  return reply.send({ success: true, message: 'User approved' });
};

export const rejectUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const { userId } = request.params as any;
  const { reason, suspend } = request.body as any;

  const user = await User.findById(userId);
  if (!user) return reply.status(404).send({ success: false, message: 'User not found' });

  user.flagForManualReview = false;
  user.documentVerificationStatus = 'rejected';
  
  if (suspend) {
    user.status = 'suspended';
  }

  await user.save();

  await TrustScoreService.addPoints({ userId: user._id.toString(), delta: -20, reason: `Admin rejected: ${reason}` });

  return reply.send({ success: true, message: 'User rejected' });
};

export const listFlaggedCompanies = async (request: FastifyRequest, reply: FastifyReply) => {
  const companies = await Company.find({ flagForManualReview: true });
  return reply.send({ success: true, companies });
};

export const verifyCompany = async (request: FastifyRequest, reply: FastifyReply) => {
  const { companyId } = request.params as any;
  const company = await Company.findById(companyId);
  
  if (!company) return reply.status(404).send({ success: false, message: 'Company not found' });

  company.flagForManualReview = false;
  company.flagReason = undefined;
  company.verificationStatus = 'verified';
  company.documentVerificationStatus = 'verified';
  if (company.founderVerified === 'pending_review') {
    company.founderVerified = 'verified';
  }
  
  if (!company.badges.includes('company_verified')) {
    company.badges.push('company_verified');
  }

  await company.save();

  await TrustScoreService.addPoints({ companyId: company._id.toString(), delta: 30, reason: 'Admin verified company' });

  return reply.send({ success: true, message: 'Company verified' });
};

export const rejectCompany = async (request: FastifyRequest, reply: FastifyReply) => {
  const { companyId } = request.params as any;
  const { reason, suspend } = request.body as any;

  const company = await Company.findById(companyId);
  if (!company) return reply.status(404).send({ success: false, message: 'Company not found' });

  company.flagForManualReview = false;
  company.verificationStatus = 'rejected';
  
  if (suspend) {
    company.status = 'suspended';
  }

  await company.save();

  await TrustScoreService.addPoints({ companyId: company._id.toString(), delta: -30, reason: `Admin rejected: ${reason}` });

  return reply.send({ success: true, message: 'Company rejected' });
};
