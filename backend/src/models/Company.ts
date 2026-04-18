import mongoose, { Schema, Document, Types } from 'mongoose';
import slugifyLib from 'slugify';

export type CompanyType = 'private_limited' | 'public_limited' | 'llp' | 'partnership' | 'sole_proprietorship' | 'ngo' | 'startup' | 'other';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';
export type FounderVerified = 'not_claimed' | 'pending_review' | 'verified' | 'rejected';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type CompanyStatus = 'onboarding' | 'active' | 'suspended';
export type MemberRole = 'owner' | 'admin' | 'recruiter' | 'member';
export type RepresentativeRole = 'founder' | 'co_founder' | 'director' | 'ceo' | 'authorized_rep';

export interface ICompany extends Document {
  // Identity
  legalName: string;
  displayName: string;
  slug: string;
  ownerId: Types.ObjectId;

  // Company info
  type?: CompanyType;
  industry?: string;
  size?: CompanySize;
  yearEstablished?: number;
  website?: string;
  description?: string;

  // Legal
  registrationNumber?: string;
  gstNumber?: string;
  taxId?: string;
  panNumber?: string;

  // Location
  registeredCountry?: string;
  registeredState?: string;
  registeredCity?: string;
  address?: string;

  // Media / social
  logoUrl?: string;
  googleMapsUrl?: string;
  socialLinks?: { linkedin?: string; twitter?: string; instagram?: string; };

  // Documents (Cloudinary)
  registrationCertificateUrl?: string;
  gstCertificateUrl?: string;
  representativeIdUrl?: string;

  // Ownership / founder
  representativeRole?: RepresentativeRole;
  ownershipPercentage?: number;
  founderStatement?: string;
  founderVerified: FounderVerified;

  // Verification state
  domainEmailVerified: boolean;
  documentUploaded: boolean;
  documentVerificationStatus: 'not_uploaded' | 'pending' | 'verified' | 'rejected';
  verificationStatus: VerificationStatus;

  // Signup flow
  status: CompanyStatus;
  signupStep: number;

  // Trust
  trustScore: number;
  trustLevel: 'low' | 'medium' | 'high' | 'premium';
  permissionTier: 1 | 2 | 3 | 4;
  flagForManualReview: boolean;
  flagReason?: string;
  badges: string[];

  // Members
  members: Array<{ userId: Types.ObjectId; role: MemberRole }>;

  // Legacy fields
  name?: string;
  identityVerified?: boolean;
  totalEventsHosted?: number;
  avgRating?: number;
  cancellationsCount?: number;
  admins?: Types.ObjectId[];
  locations?: string[];

  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    legalName: { type: String, required: true, unique: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    type: { type: String, enum: ['private_limited', 'public_limited', 'llp', 'partnership', 'sole_proprietorship', 'ngo', 'startup', 'other'] },
    industry: { type: String },
    size: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'] },
    yearEstablished: { type: Number },
    website: { type: String },
    description: { type: String, maxlength: 500 },

    registrationNumber: { type: String },
    gstNumber: { type: String },
    taxId: { type: String },
    panNumber: { type: String },

    registeredCountry: { type: String },
    registeredState: { type: String },
    registeredCity: { type: String },
    address: { type: String },

    logoUrl: { type: String },
    googleMapsUrl: { type: String },
    socialLinks: {
      linkedin: String,
      twitter: String,
      instagram: String,
    },

    registrationCertificateUrl: { type: String, select: false },
    gstCertificateUrl: { type: String, select: false },
    representativeIdUrl: { type: String, select: false },

    representativeRole: { type: String, enum: ['founder', 'co_founder', 'director', 'ceo', 'authorized_rep'] },
    ownershipPercentage: { type: Number, min: 0, max: 100 },
    founderStatement: { type: String },
    founderVerified: { type: String, enum: ['not_claimed', 'pending_review', 'verified', 'rejected'], default: 'not_claimed' },

    domainEmailVerified: { type: Boolean, default: false },
    documentUploaded: { type: Boolean, default: false },
    documentVerificationStatus: { type: String, enum: ['not_uploaded', 'pending', 'verified', 'rejected'], default: 'not_uploaded' },
    verificationStatus: { type: String, enum: ['unverified', 'pending', 'verified', 'rejected'], default: 'unverified' },

    status: { type: String, enum: ['onboarding', 'active', 'suspended'], default: 'onboarding' },
    signupStep: { type: Number, default: 1 },

    trustScore: { type: Number, default: 0, min: 0, max: 100 },
    trustLevel: { type: String, enum: ['low', 'medium', 'high', 'premium'], default: 'low' },
    permissionTier: { type: Number, default: 1, min: 1, max: 4 },
    flagForManualReview: { type: Boolean, default: false },
    flagReason: { type: String },
    badges: [{ type: String }],

    members: [{
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['owner', 'admin', 'recruiter', 'member'], default: 'member' }
    }],

    // Legacy
    name: { type: String },
    identityVerified: { type: Boolean, default: false },
    totalEventsHosted: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    cancellationsCount: { type: Number, default: 0 },
    admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    locations: [{ type: String }],
  },
  { timestamps: true }
);

CompanySchema.pre('save', function (next) {
  if (this.isNew || this.isModified('legalName')) {
    const slug = (slugifyLib as any).default || slugifyLib;
    // @ts-ignore
    this.slug = slug(this.legalName, { lower: true, strict: true }) + '-' + Math.random().toString(36).slice(2, 7);
  }
  next();
});

CompanySchema.index({ legalName: 'text', industry: 'text' });
CompanySchema.index({ trustScore: -1 });

export const Company = mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);
