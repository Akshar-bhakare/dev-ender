// ============================================================
// jobs.service.ts — Business logic for the Jobs module
// ============================================================

import mongoose, { Types } from 'mongoose';
import {
  JobListing,
  JobApplication,
  JobInvitation,
  SavedJob,
  JobCategory,
  Skill,
  type ApplicationStage,
} from './jobs.schema.js';
import { Company } from '../../models/Company.js';
import { jobError } from './jobs.errors.js';
import type {
  CreateJobInput,
  UpdateJobInput,
  ApplyToJobInput,
  UpdateApplicationStageInput,
  JobSearchInput,
} from './jobs.validation.js';

// ─── Category tree node (module-scoped for public return type) ──
export interface CategoryNode {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  parentId?: Types.ObjectId;
  children: CategoryNode[];
}

// ─── Allowed stage transitions ───────────────────────────────
const STAGE_TRANSITIONS: Record<string, string[]> = {
  applied: ['shortlisted', 'rejected'],
  shortlisted: ['interviewing', 'rejected'],
  interviewing: ['offered', 'rejected'],
  offered: ['hired', 'rejected'],
  hired: [],
  rejected: [],
};

// ────────────────────────────────────────────────────────────
// COMPANY / RECRUITER SERVICES
// ────────────────────────────────────────────────────────────

export class JobsService {
  /**
   * Create a new job listing (status defaults to draft).
   * Only verified companies can post.
   */
  static async createListing(companyId: string, userId: string, data: CreateJobInput) {
    const company = await Company.findById(companyId);
    if (!company || (company.verificationStatus !== 'verified' && !company.identityVerified)) {
      throw jobError.companyNotVerified();
    }

    const listing = new JobListing({
      companyId: new Types.ObjectId(companyId),
      postedByUserId: new Types.ObjectId(userId),
      ...data,
      categoryId: data.categoryId ? new Types.ObjectId(data.categoryId) : undefined,
      requiredSkills: data.requiredSkills.map((s) => ({
        skillId: new Types.ObjectId(s.skillId),
        isPrimary: s.isPrimary,
      })),
      applicationDeadline: data.applicationDeadline
        ? new Date(data.applicationDeadline)
        : undefined,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    });

    await listing.save();
    return listing;
  }

  /**
   * Update a draft or paused listing.
   */
  static async updateListing(
    jobId: string,
    companyId: string,
    data: UpdateJobInput
  ) {
    const listing = await JobListing.findOne({
      _id: jobId,
      companyId,
      deletedAt: null,
    });

    if (!listing) throw jobError.notFound();
    if (!['draft', 'paused'].includes(listing.status)) throw jobError.notEditable();

    // Use a plain object to avoid ObjectId→string TS conflicts on the document
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = { ...data };

    if (data.requiredSkills) {
      updateData['requiredSkills'] = data.requiredSkills.map((s) => ({
        skillId: new Types.ObjectId(s.skillId),
        isPrimary: s.isPrimary,
      }));
    }
    if (data.categoryId) {
      updateData['categoryId'] = new Types.ObjectId(data.categoryId);
    }

    Object.assign(listing, updateData);
    await listing.save();
    return listing;
  }

  /**
   * Publish a draft or paused listing.
   */
  static async publishListing(jobId: string, companyId: string) {
    const listing = await JobListing.findOne({
      _id: jobId,
      companyId,
      deletedAt: null,
    });

    if (!listing) throw jobError.notFound();
    if (!['draft', 'paused'].includes(listing.status)) {
      throw jobError.invalidTransition(listing.status, 'published');
    }

    // Validate required fields before publish
    if (!listing.requiredSkills.length) {
      throw jobError.validationError('At least one required skill must be set before publishing.');
    }

    listing.status = 'published';
    await listing.save();
    return listing;
  }

  /**
   * Pause a published listing.
   */
  static async pauseListing(jobId: string, companyId: string) {
    const listing = await JobListing.findOne({
      _id: jobId,
      companyId,
      deletedAt: null,
    });

    if (!listing) throw jobError.notFound();
    if (listing.status !== 'published') {
      throw jobError.invalidTransition(listing.status, 'paused');
    }

    listing.status = 'paused';
    await listing.save();
    return listing;
  }

  /**
   * Close a listing (any active status).
   */
  static async closeListing(jobId: string, companyId: string) {
    const listing = await JobListing.findOne({
      _id: jobId,
      companyId,
      deletedAt: null,
    });

    if (!listing) throw jobError.notFound();
    if (['closed', 'expired'].includes(listing.status)) {
      throw jobError.invalidTransition(listing.status, 'closed');
    }

    listing.status = 'closed';
    await listing.save();
    return listing;
  }

  /**
   * Soft-delete a listing.
   */
  static async deleteListing(jobId: string, companyId: string) {
    const listing = await JobListing.findOne({
      _id: jobId,
      companyId,
      deletedAt: null,
    });

    if (!listing) throw jobError.notFound();
    listing.deletedAt = new Date();
    await listing.save();
    return { deleted: true };
  }

  /**
   * List all listings for a company (with optional status filter & pagination).
   */
  static async getCompanyListings(
    companyId: string,
    {
      status,
      page = 1,
      limit = 20,
    }: { status?: string; page?: number; limit?: number }
  ) {
    const filter: Record<string, unknown> = { companyId, deletedAt: null };
    if (status) filter.status = status;

    const [listings, total] = await Promise.all([
      JobListing.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      JobListing.countDocuments(filter),
    ]);

    return { listings, total, page, limit };
  }

  /**
   * Get all applications for a job (company view).
   * Recruiter notes ARE included here.
   */
  static async getJobApplications(
    jobId: string,
    companyId: string,
    { stage, page = 1, limit = 20 }: { stage?: string; page?: number; limit?: number }
  ) {
    // Verify ownership
    const listing = await JobListing.findOne({ _id: jobId, companyId, deletedAt: null });
    if (!listing) throw jobError.notFound();

    const filter: Record<string, unknown> = { jobId };
    if (stage) filter.stage = stage;

    const [applications, total] = await Promise.all([
      JobApplication.find(filter)
        .populate('applicantId', 'email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      JobApplication.countDocuments(filter),
    ]);

    return { applications, total, page, limit };
  }

  /**
   * Move an application stage forward.
   */
  static async updateApplicationStage(
    applicationId: string,
    companyId: string,
    updatedByUserId: string,
    data: UpdateApplicationStageInput
  ) {
    const application = await JobApplication.findById(applicationId).populate<{
      jobId: { companyId: Types.ObjectId };
    }>('jobId', 'companyId');

    if (!application) throw jobError.applicationNotFound();

    // Verify that the application belongs to this company's job
    if (application.jobId.companyId.toString() !== companyId) {
      throw jobError.unauthorized();
    }

    const currentStage = application.stage;
    const allowed = STAGE_TRANSITIONS[currentStage] || [];
    if (!allowed.includes(data.stage)) {
      throw jobError.invalidTransition(currentStage, data.stage);
    }

    application.stage = data.stage as ApplicationStage;
    application.stageUpdatedAt = new Date();
    application.stageUpdatedByUserId = new Types.ObjectId(updatedByUserId);
    if (data.rejectionReason) application.rejectionReason = data.rejectionReason;
    if (data.notes) application.notes = data.notes;

    await application.save();
    return application;
  }

  /**
   * Invite a specific user to apply.
   */
  static async inviteUser(
    jobId: string,
    invitedByUserId: string,
    invitedUserId: string,
    message?: string
  ) {
    const listing = await JobListing.findOne({ _id: jobId, deletedAt: null });
    if (!listing) throw jobError.notFound();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await JobInvitation.create({
      jobId: new Types.ObjectId(jobId),
      invitedUserId: new Types.ObjectId(invitedUserId),
      invitedByUserId: new Types.ObjectId(invitedByUserId),
      message,
      expiresAt,
    });

    return invitation;
  }

  // ────────────────────────────────────────────────────────────
  // CANDIDATE / PUBLIC SERVICES
  // ────────────────────────────────────────────────────────────

  /**
   * Search published jobs with filters and boosted-first ordering.
   */
  static async searchJobs(params: JobSearchInput) {
    const { q, categoryId, jobType, workMode, city, minExp, maxExp, page, limit } = params;

    const filter: Record<string, unknown> = {
      status: 'published',
      deletedAt: null,
    };

    // Exclude jobs past their application deadline
    filter.$or = [
      { applicationDeadline: null },
      { applicationDeadline: { $gte: new Date() } },
    ];

    if (q) {
      filter.$text = { $search: q };
    }
    if (categoryId) filter.categoryId = new Types.ObjectId(categoryId);
    if (jobType) filter.jobType = jobType;
    if (workMode) filter.workMode = workMode;
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (minExp !== undefined) filter.minExperienceMonths = { $gte: minExp };
    if (maxExp !== undefined) {
      filter.maxExperienceMonths = filter.maxExperienceMonths
        ? { ...filter.maxExperienceMonths as object, $lte: maxExp }
        : { $lte: maxExp };
    }

    const [jobs, total] = await Promise.all([
      JobListing.find(filter, {
        description: 0, // exclude heavy field for card view
      })
        .sort({ isBoosted: -1, createdAt: -1 }) // boosted first
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      JobListing.countDocuments(filter),
    ]);

    return {
      jobs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get full job detail by id or slug.
   * Increments viewCount asynchronously (fire-and-forget).
   */
  static async getJobDetail(idOrSlug: string) {
    const isObjectId = Types.ObjectId.isValid(idOrSlug);
    const filter = isObjectId
      ? { _id: idOrSlug, deletedAt: null }
      : { slug: idOrSlug, deletedAt: null };

    const listing = await JobListing.findOne(filter)
      .populate('categoryId', 'name slug')
      .populate('requiredSkills.skillId', 'name slug')
      .lean();

    if (!listing) throw jobError.notFound();

    // Fire-and-forget view count increment
    JobListing.updateOne({ _id: listing._id }, { $inc: { viewCount: 1 } }).exec();

    return listing;
  }

  /**
   * Submit a job application.
   * Enforces: faceVerified, experience >= 12 months, no duplicate.
   */
  static async applyToJob(
    jobId: string,
    applicantId: string,
    identityVerified: boolean,
    totalExperienceMonths: number,
    data: ApplyToJobInput
  ) {
    if (!identityVerified) throw jobError.notIdentityVerified();
    if (totalExperienceMonths < 12) throw jobError.insufficientExperience();

    const listing = await JobListing.findOne({ _id: jobId, status: 'published', deletedAt: null });
    if (!listing) throw jobError.notPublished();

    // Check application deadline
    if (listing.applicationDeadline && listing.applicationDeadline < new Date()) {
      throw jobError.deadlinePassed();
    }

    // Duplicate application check
    const existing = await JobApplication.findOne({ jobId, applicantId });
    if (existing) throw jobError.duplicateApplication();

    const application = await JobApplication.create({
      jobId: new Types.ObjectId(jobId),
      applicantId: new Types.ObjectId(applicantId),
      resumeUrl: data.resumeUrl,
      coverLetter: data.coverLetter,
    });

    // Increment application count on the listing (fire-and-forget)
    JobListing.updateOne({ _id: jobId }, { $inc: { applicationCount: 1 } }).exec();

    return application;
  }

  /**
   * Get the authenticated user's own applications (no recruiter notes).
   */
  static async getMyApplications(applicantId: string) {
    return JobApplication.find({ applicantId }, { notes: 0 }) // exclude recruiter notes
      .populate('jobId', 'title companyId status')
      .sort({ createdAt: -1 });
  }

  /**
   * Save a job.
   */
  static async saveJob(userId: string, jobId: string, identityVerified: boolean) {
    if (!identityVerified) throw jobError.notIdentityVerified();

    const listing = await JobListing.findOne({ _id: jobId, status: 'published', deletedAt: null });
    if (!listing) throw jobError.notFound();

    await SavedJob.create({
      userId: new Types.ObjectId(userId),
      jobId: new Types.ObjectId(jobId),
    });

    return { saved: true };
  }

  /**
   * Unsave a job.
   */
  static async unsaveJob(userId: string, jobId: string) {
    const result = await SavedJob.deleteOne({ userId, jobId });
    if (!result.deletedCount) throw jobError.savedJobNotFound();
    return { unsaved: true };
  }

  /**
   * Get user's saved jobs.
   */
  static async getSavedJobs(userId: string) {
    return SavedJob.find({ userId })
      .populate({
        path: 'jobId',
        match: { deletedAt: null },
        select: '-description',
      })
      .sort({ createdAt: -1 });
  }

  /**
   * Get user's invitations.
   */
  static async getMyInvitations(userId: string) {
    return JobInvitation.find({ invitedUserId: userId })
      .populate('jobId', 'title companyId')
      .sort({ createdAt: -1 });
  }

  /**
   * Accept or decline an invitation.
   */
  static async respondToInvitation(
    invitationId: string,
    userId: string,
    status: 'accepted' | 'declined'
  ) {
    const invitation = await JobInvitation.findById(invitationId);
    if (!invitation) throw jobError.invitationNotFound();

    if (invitation.invitedUserId.toString() !== userId) {
      throw jobError.unauthorized();
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      throw jobError.invitationExpired();
    }

    invitation.status = status;
    await invitation.save();
    return invitation;
  }

  // ────────────────────────────────────────────────────────────
  // UTILITY
  // ────────────────────────────────────────────────────────────

  /**
   * Get all job categories as a tree.
   */
  static async getCategories(): Promise<CategoryNode[]> {
    const all = await JobCategory.find().lean();

    const map = new Map<string, CategoryNode>();
    for (const c of all) {
      map.set(c._id.toString(), {
        _id: c._id,
        name: c.name,
        slug: c.slug,
        parentId: c.parentId,
        children: [],
      });
    }

    const roots: CategoryNode[] = [];
    for (const cat of map.values()) {
      if (cat.parentId) {
        const parent = map.get(cat.parentId.toString());
        if (parent) parent.children.push(cat);
      } else {
        roots.push(cat);
      }
    }

    return roots;
  }

  /**
   * Typeahead search for skills.
   */
  static async searchSkills(q: string) {
    return Skill.find({ name: { $regex: q, $options: 'i' } })
      .limit(10)
      .select('name slug');
  }
}
