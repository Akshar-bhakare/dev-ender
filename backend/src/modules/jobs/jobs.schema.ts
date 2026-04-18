// ============================================================
// jobs.schema.ts — Mongoose schemas for the Jobs module
// ============================================================

import mongoose, { Schema, Document, Types } from 'mongoose';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

// ──────────────────────────────────────────────────
// JobCategory
// ──────────────────────────────────────────────────
export interface IJobCategory extends Document {
  name: string;
  slug: string;
  parentId?: Types.ObjectId;
}

const JobCategorySchema = new Schema<IJobCategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'JobCategory', default: null },
  },
  { timestamps: true }
);

export const JobCategory = mongoose.model<IJobCategory>('JobCategory', JobCategorySchema);

// ──────────────────────────────────────────────────
// Skill
// ──────────────────────────────────────────────────
export interface ISkill extends Document {
  name: string;
  slug: string;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

SkillSchema.index({ name: 'text' });
export const Skill = mongoose.model<ISkill>('Skill', SkillSchema);

// ──────────────────────────────────────────────────
// JobListing
// ──────────────────────────────────────────────────
export type JobStatus = 'draft' | 'published' | 'paused' | 'closed' | 'expired';
export type JobType = 'full_time' | 'part_time' | 'contract' | 'freelance';
export type WorkMode = 'remote' | 'hybrid' | 'on_site';

export interface IJobListing extends Document {
  companyId: Types.ObjectId;
  postedByUserId: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  categoryId?: Types.ObjectId;
  jobType: JobType;
  workMode: WorkMode;
  location: { city?: string; state?: string; country?: string };
  minExperienceMonths: number;
  maxExperienceMonths?: number;
  minSalary?: number;
  maxSalary?: number;
  salaryCurrency: string;
  salaryVisible: boolean;
  requiredSkills: { skillId: Types.ObjectId; isPrimary: boolean }[];
  openings: number;
  status: JobStatus;
  isBoosted: boolean;
  applicationDeadline?: Date;
  expiresAt?: Date;
  viewCount: number;
  applicationCount: number;
  deletedAt?: Date;
}

const JobListingSchema = new Schema<IJobListing>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    postedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, minlength: 5, maxlength: 120, trim: true },
    slug: { type: String, unique: true, sparse: true },
    description: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'JobCategory' },
    jobType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'freelance'],
      required: true,
    },
    workMode: {
      type: String,
      enum: ['remote', 'hybrid', 'on_site'],
      required: true,
    },
    location: {
      city: String,
      state: String,
      country: String,
    },
    minExperienceMonths: { type: Number, required: true, min: 12 },
    maxExperienceMonths: { type: Number },
    minSalary: { type: Number },
    maxSalary: { type: Number },
    salaryCurrency: { type: String, default: 'INR' },
    salaryVisible: { type: Boolean, default: true },
    requiredSkills: [
      {
        skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    openings: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['draft', 'published', 'paused', 'closed', 'expired'],
      default: 'draft',
    },
    isBoosted: { type: Boolean, default: false },
    applicationDeadline: { type: Date },
    expiresAt: { type: Date },
    viewCount: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-generate slug from title + random id before save
JobListingSchema.pre('save', async function () {
  if (this.isNew && !this.slug) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    this.slug = `${baseSlug}-${nanoid()}`;
  }
});

// Compound index for search efficiency
JobListingSchema.index({ status: 1, isBoosted: -1, createdAt: -1 });
JobListingSchema.index({ companyId: 1, status: 1 });
JobListingSchema.index({ title: 'text', description: 'text' });
JobListingSchema.index({ deletedAt: 1 });

export const JobListing = mongoose.model<IJobListing>('JobListing', JobListingSchema);

// ──────────────────────────────────────────────────
// JobApplication
// ──────────────────────────────────────────────────
export type ApplicationStage =
  | 'applied'
  | 'shortlisted'
  | 'interviewing'
  | 'offered'
  | 'hired'
  | 'rejected';

export interface IJobApplication extends Document {
  jobId: Types.ObjectId;
  applicantId: Types.ObjectId;
  resumeUrl: string;
  coverLetter?: string;
  stage: ApplicationStage;
  stageUpdatedAt?: Date;
  stageUpdatedByUserId?: Types.ObjectId;
  rejectionReason?: string;
  notes?: string; // recruiter-only, never exposed to applicant
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'JobListing', required: true },
    applicantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resumeUrl: { type: String, required: true },
    coverLetter: { type: String },
    stage: {
      type: String,
      enum: ['applied', 'shortlisted', 'interviewing', 'offered', 'hired', 'rejected'],
      default: 'applied',
    },
    stageUpdatedAt: { type: Date },
    stageUpdatedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },
    notes: { type: String }, // recruiter-only
  },
  { timestamps: true }
);

// Unique constraint: one application per user per job
JobApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
JobApplicationSchema.index({ applicantId: 1, stage: 1 });

export const JobApplication = mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);

// ──────────────────────────────────────────────────
// JobInvitation
// ──────────────────────────────────────────────────
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface IJobInvitation extends Document {
  jobId: Types.ObjectId;
  invitedUserId: Types.ObjectId;
  invitedByUserId: Types.ObjectId;
  message?: string;
  status: InvitationStatus;
  expiresAt: Date;
}

const JobInvitationSchema = new Schema<IJobInvitation>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'JobListing', required: true },
    invitedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invitedByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'expired'],
      default: 'pending',
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

JobInvitationSchema.index({ invitedUserId: 1, status: 1 });
JobInvitationSchema.index({ jobId: 1 });

export const JobInvitation = mongoose.model<IJobInvitation>('JobInvitation', JobInvitationSchema);

// ──────────────────────────────────────────────────
// SavedJob
// ──────────────────────────────────────────────────
export interface ISavedJob extends Document {
  userId: Types.ObjectId;
  jobId: Types.ObjectId;
}

const SavedJobSchema = new Schema<ISavedJob>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'JobListing', required: true },
  },
  { timestamps: true }
);

// Unique constraint: one save per user per job
SavedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export const SavedJob = mongoose.model<ISavedJob>('SavedJob', SavedJobSchema);
