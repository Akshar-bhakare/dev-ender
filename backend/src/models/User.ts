import mongoose, { Schema, Document, Types } from 'mongoose';
import * as uuid from 'uuid';

export type TrustLevel = 'low' | 'medium' | 'high' | 'premium';
export type PermissionTier = 1 | 2 | 3 | 4;
export type UserRole = 'professional' | 'company_owner' | 'company_admin' | 'company_event_host' | 'admin';
export type UserStatus = 'onboarding' | 'active' | 'suspended' | 'deleted';
export type DocumentType = 'aadhaar' | 'passport' | 'driving_license' | 'national_id' | 'emirates_id' | 'other';
export type DocVerificationStatus = 'not_uploaded' | 'pending' | 'verified' | 'rejected';
export type BadgeKey = 'identity_verified' | 'phone_verified' | 'linkedin_connected' | 'company_verified' | 'trusted_organizer' | 'verified_founder' | 'premium_member';

export interface IUser extends Document {
  uid: string;
  // Core identity
  fullName: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  signupStep: number;

  // Verification flags
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean; // faceVerified + documentVerified

  // Face (stub — no face-api.js in hackathon)
  faceVerified: boolean;
  faceSnapshotUrl?: string;
  faceDescriptor: number[]; // 128 floats — select: false

  // Document
  documentType?: DocumentType;
  documentFrontUrl?: string;
  documentBackUrl?: string;
  documentOcrRaw?: string;
  documentVerificationStatus: DocVerificationStatus;
  detectedCountry?: string;
  detectedName?: string;
  detectedDOB?: string;
  detectedDocNumber?: string;

  // Professional profile
  jobTitle?: string;
  industry?: string;
  totalExperienceMonths: number;
  currentCompany?: string;
  linkedInUrl?: string;
  linkedInConnected: boolean;
  bio?: string;
  avatar?: string;
  profilePhotoUrl?: string;

  // Trust system
  trustScore: number;
  trustLevel: TrustLevel;
  permissionTier: PermissionTier;
  isVerified: boolean;
  badges: BadgeKey[];
  flagForManualReview: boolean;
  flagReason?: string;

  // Token management
  refreshTokens: Array<{ token: string; expiresAt: Date }>;

  // Social graph
  following: Types.ObjectId[];
  followers: Types.ObjectId[];
  skills: string[];
  education: Array<{ school: string; degree: string; field: string; startYear: number; endYear?: number }>;
  experience: Array<{ title: string; company: string; startYear: number; endYear?: number; current: boolean; description?: string }>;
  location?: string;
  website?: string;

  // Legacy fields (backward compat with existing code)
  name?: string; // alias for fullName
  company?: string;
  kycStatus?: 'pending' | 'verified' | 'rejected';
  kycVerifiedAt?: Date;
  docData?: { name?: string; dob?: string; docNumber?: string; expiry?: string; nationality?: string; docType?: string; };
  totalEventsHosted: number;
  avgRating: number;
  cancellationsCount: number;
  embedding?: number[];

  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, default: () => uuid.v7(), unique: true, index: true },

    // Core
    fullName: { type: String, required: true, minlength: 2, maxlength: 80 },
    name: { type: String }, // legacy alias
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, sparse: true },
    country: { type: String }, // For Onfido compliance
    role: { type: String, enum: ['professional', 'company_owner', 'admin'], default: 'professional' },
    status: { type: String, enum: ['onboarding', 'active', 'suspended', 'deleted'], default: 'onboarding' },
    signupStep: { type: Number, default: 1 },

    // verification Provider
    verificationProvider: { type: String, enum: ['manual_ocr', 'onfido'], default: 'manual_ocr' },
    onfidoApplicantId: { type: String },
    onfidoCheckId: { type: String },
    onfidoSdkToken: { type: String },

    // Verification flags
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    identityVerified: { type: Boolean, default: false },
    faceVerified: { type: Boolean, default: false },
    faceSnapshotUrl: { type: String, select: false },
    faceDescriptor: { type: [Number], default: [], select: false },

    // Document
    documentType: { type: String, enum: ['aadhaar', 'passport', 'driving_license', 'national_id', 'emirates_id', 'other'] },
    documentFrontUrl: { type: String, select: false },
    documentBackUrl: { type: String, select: false },
    documentOcrRaw: { type: String, select: false },
    documentVerificationStatus: { type: String, enum: ['not_uploaded', 'pending', 'verified', 'rejected'], default: 'not_uploaded' },
    detectedCountry: { type: String },
    detectedName: { type: String },
    detectedDOB: { type: String },
    detectedDocNumber: { type: String, select: false },

    // Professional
    jobTitle: { type: String },
    industry: { type: String },
    totalExperienceMonths: { type: Number, default: 0 },
    currentCompany: { type: String },
    linkedInUrl: { type: String },
    linkedInConnected: { type: Boolean, default: false },
    bio: { type: String, maxlength: 300 },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100' },
    profilePhotoUrl: { type: String },

    // Trust
    trustScore: { type: Number, default: 0, min: 0, max: 100 },
    trustLevel: { type: String, enum: ['low', 'medium', 'high', 'premium'], default: 'low' },
    permissionTier: { type: Number, default: 1, min: 1, max: 4 },
    isVerified: { type: Boolean, default: false },
    badges: [{ type: String }],
    flagForManualReview: { type: Boolean, default: false },
    flagReason: { type: String },

    // Tokens
    refreshTokens: [{ token: { type: String }, expiresAt: { type: Date } }],

    // Social graph
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    skills: [{ type: String }],
    education: [{
      school: String, degree: String, field: String,
      startYear: Number, endYear: Number
    }],
    experience: [{
      title: String, company: String,
      startYear: Number, endYear: Number,
      current: { type: Boolean, default: false },
      description: String
    }],
    location: { type: String },
    website: { type: String },
    company: { type: String },
    kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    kycVerifiedAt: { type: Date },
    docData: {
      name: String, dob: String, docNumber: String, expiry: String, nationality: String, docType: String
    },
    totalEventsHosted: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    cancellationsCount: { type: Number, default: 0 },
    embedding: { type: [Number], select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ phone: 1 }, { sparse: true });
UserSchema.index({ detectedDocNumber: 1 }, { sparse: true });
UserSchema.index({ trustScore: -1 });
UserSchema.index({ flagForManualReview: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
