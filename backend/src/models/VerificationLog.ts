import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVerificationLog extends Document {
  claimId: Types.ObjectId;
  action: string;
  previousScore?: number;
  newScore?: number;
  metadata?: any;
  performerId?: Types.ObjectId; // User or System
  createdAt: Date;
}

const VerificationLogSchema = new Schema<IVerificationLog>(
  {
    claimId: { type: Schema.Types.ObjectId, ref: 'OwnershipClaim', required: true },
    action: { type: String, required: true },
    previousScore: { type: Number },
    newScore: { type: Number },
    metadata: { type: Schema.Types.Mixed },
    performerId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

VerificationLogSchema.index({ claimId: 1, createdAt: -1 });

export const VerificationLog = mongoose.model<IVerificationLog>('VerificationLog', VerificationLogSchema);
