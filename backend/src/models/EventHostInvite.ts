import mongoose, { Schema, Document, Types } from 'mongoose';

export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface IEventHostInvite extends Document {
  email: string;
  companyId: Types.ObjectId;
  role: 'COMPANY_ADMIN' | 'COMPANY_EVENT_HOST';
  inviteToken: string;
  expiresAt: Date;
  status: InviteStatus;
  isJoinInvite: boolean;
  invitedBy: Types.ObjectId;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EventHostInviteSchema = new Schema<IEventHostInvite>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    role: { type: String, enum: ['COMPANY_ADMIN', 'COMPANY_EVENT_HOST'], default: 'COMPANY_EVENT_HOST' },
    inviteToken: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'expired', 'revoked'], default: 'pending' },
    isJoinInvite: { type: Boolean, default: false },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    acceptedAt: { type: Date },
  },
  { timestamps: true }
);

EventHostInviteSchema.index({ email: 1, companyId: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });
EventHostInviteSchema.index({ inviteToken: 1 });

export const EventHostInvite = mongoose.models.EventHostInvite || mongoose.model<IEventHostInvite>('EventHostInvite', EventHostInviteSchema);
