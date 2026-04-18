import { Types } from 'mongoose';
import { 
  OrganizationServiceProfile, 
  ServiceRequirement, 
  Proposal, 
  Contract, 
  Milestone, 
  MarketplaceRating,
  Company
} from '../../models/index.js';
import { MarketplaceError, MarketplaceErrorCode } from './marketplace.errors.js';

export class MarketplaceService {
  // ─── Service Profile Logic ──────────────────────────────────
  
  static async createServiceProfile(orgId: string, data: any) {
    const existing = await OrganizationServiceProfile.findOne({ orgId });
    if (existing) {
      throw new MarketplaceError(MarketplaceErrorCode.ALREADY_EXISTS, 'Service profile already exists for this organization.');
    }
    return await OrganizationServiceProfile.create({ orgId, ...data });
  }

  static async updateServiceProfile(orgId: string, data: any) {
    const profile = await OrganizationServiceProfile.findOneAndUpdate(
      { orgId },
      { $set: data },
      { new: true }
    );
    if (!profile) {
      throw new MarketplaceError(MarketplaceErrorCode.PROFILE_NOT_FOUND, 'Service profile not found.');
    }
    return profile;
  }

  static async getServiceProfile(orgId: string) {
    return await OrganizationServiceProfile.findOne({ orgId });
  }

  // ─── Requirement Logic ──────────────────────────────────────

  static async createRequirement(orgId: string, userId: string, data: any) {
    const org = await Company.findById(orgId);
    if (org?.verificationStatus !== 'verified') {
      throw new MarketplaceError(MarketplaceErrorCode.COMPANY_NOT_VERIFIED, 'Only verified organizations can post requirements.');
    }
    return await ServiceRequirement.create({ 
      orgId, 
      createdByMemberId: userId, 
      ...data,
      status: 'draft' 
    });
  }

  static async publishRequirement(requirementId: string, orgId: string) {
    const requirement = await ServiceRequirement.findOneAndUpdate(
      { _id: requirementId, orgId },
      { $set: { status: 'published' } },
      { new: true }
    );
    if (!requirement) {
      throw new MarketplaceError(MarketplaceErrorCode.REQUIREMENT_NOT_FOUND, 'Requirement not found or unauthorized.');
    }
    return requirement;
  }

  static async searchRequirements(filters: any) {
    const query: any = { status: 'published' };
    if (filters.category) query.categories = filters.category;
    if (filters.skills) query.skillsRequired = { $in: filters.skills };
    
    return await ServiceRequirement.find(query).sort({ createdAt: -1 });
  }

  // ─── Proposal Logic ─────────────────────────────────────────

  static async submitProposal(providerOrgId: string, userId: string, data: any) {
    const org = await Company.findById(providerOrgId);
    if (org?.verificationStatus !== 'verified') {
      throw new MarketplaceError(MarketplaceErrorCode.COMPANY_NOT_VERIFIED, 'Only verified organizations can submit proposals.');
    }

    const requirement = await ServiceRequirement.findById(data.requirementId);
    if (!requirement || requirement.status !== 'published') {
      throw new MarketplaceError(MarketplaceErrorCode.REQUIREMENT_NOT_FOUND, 'Requirement is not open for proposals.');
    }

    return await Proposal.create({
      ...data,
      providerOrgId,
      submittedByMemberId: userId,
      status: 'submitted'
    });
  }

  static async acceptProposal(proposalId: string, buyerOrgId: string, userId: string) {
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      throw new MarketplaceError(MarketplaceErrorCode.PROPOSAL_NOT_FOUND, 'Proposal not found.');
    }

    const requirement = await ServiceRequirement.findOne({ _id: proposal.requirementId, orgId: buyerOrgId });
    if (!requirement) {
      throw new MarketplaceError(MarketplaceErrorCode.UNAUTHORIZED_ACTION, 'Unauthorized to accept this proposal.');
    }

    // Transactional logic would be better here
    proposal.status = 'accepted';
    await proposal.save();

    requirement.status = 'closed';
    await requirement.save();

    // Create initial contract
    const contract = await Contract.create({
      requirementId: requirement._id,
      proposalId: proposal._id,
      buyerOrgId,
      providerOrgId: proposal.providerOrgId,
      title: requirement.title,
      scopeOfWork: proposal.proposalSummary,
      totalValue: proposal.priceQuote,
      createdByMemberId: userId,
      status: 'active'
    });

    return { proposal, contract };
  }

  // ─── Contract & Milestone Logic ─────────────────────────────

  static async updateMilestoneStatus(milestoneId: string, status: string, userId: string) {
    const milestone = await Milestone.findById(milestoneId);
    if (!milestone) throw new MarketplaceError(MarketplaceErrorCode.MILESTONE_NOT_FOUND, 'Milestone not found.');

    // Logic to verify user permission based on contract would go here
    milestone.status = status as any;
    if (status === 'accepted') {
      milestone.acceptedByMemberId = new Types.ObjectId(userId);
      milestone.acceptedAt = new Date();
    }
    return await milestone.save();
  }

  // ─── Simple Matching Logic (v1) ─────────────────────────────

  static async getMatchingProviders(requirementId: string) {
    const requirement = await ServiceRequirement.findById(requirementId);
    if (!requirement) return [];

    // Simple overlap of skills and category
    return await OrganizationServiceProfile.find({
      $or: [
        { categories: { $in: requirement.categories } },
        { skills: { $in: requirement.skillsRequired } }
      ]
    }).populate('orgId');
  }
}
