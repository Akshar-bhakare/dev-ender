import mongoose, { Schema, Document, Types } from 'mongoose';

export enum ClaimStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export interface IVerificationSignal {
  type: 'registry' | 'domain' | 'email' | 'document' | 'social';
  confidence: number; // 0 to 1
  verifiedAt: Date;
  data: any; // Raw API response or parsed document data
}

export interface IOwnershipClaim extends Document {
  companyId: Types.ObjectId;
  userId: Types.ObjectId;
  status: ClaimStatus;
  score: number; // 0 to 100
  signals: IVerificationSignal[];
  documents: string[]; // Array of file URLs
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSignalSchema = new Schema<IVerificationSignal>({
  type: { type: String, enum: ['registry', 'domain', 'email', 'document', 'social'], required: true },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  verifiedAt: { type: Date, default: Date.now },
  data: { type: Schema.Types.Mixed }
}, { _id: false });

const OwnershipClaimSchema = new Schema<IOwnershipClaim>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
      type: String, 
      enum: Object.values(ClaimStatus), 
      default: ClaimStatus.PENDING 
    },
    score: { type: Number, default: 0, min: 0, max: 100 },
    signals: [VerificationSignalSchema],
    documents: [{ type: String }],
    adminNotes: { type: String }
  },
  { timestamps: true }
);

// Ensure a user can't have multiple pending claims for the same company
OwnershipClaimSchema.index({ companyId: 1, userId: 1, status: 1 });

export const OwnershipClaim = mongoose.model<IOwnershipClaim>('OwnershipClaim', OwnershipClaimSchema);
