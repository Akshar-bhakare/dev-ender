import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEvent extends Document {
  organizer: Types.ObjectId;
  organizerModel: 'User' | 'Company';
  title: string;
  description: string;
  date: Date;
  locationType: 'online' | 'physical';
  linkOrAddress?: string;
  price: number;
  currency: string;
  trustScore: number;
  venueVerified: boolean;
  reportCount: number;
  flagged: boolean;
  hidden: boolean;
  status: 'PENDING_APPROVAL' | 'AUTO_PUBLISHED' | 'PENDING_PAYMENT' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED' | 'PUBLISHED';
  payoutStatus: 'LOCKED' | 'PARTIAL_RELEASED' | 'RELEASED' | 'FROZEN';
  cancellationPolicy: {
    before7Days: string;
    before3Days: string;
    before48Hours: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    organizer: { type: Schema.Types.ObjectId, required: true, refPath: 'organizerModel' },
    organizerModel: { type: String, required: true, enum: ['User', 'Company'] },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    locationType: {
      type: String,
      enum: ['online', 'physical'],
      required: true
    },
    linkOrAddress: { type: String },
    price: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    trustScore: { type: Number, default: 0 },
    venueVerified: { type: Boolean, default: false },
    reportCount: { type: Number, default: 0 },
    flagged: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['PENDING_APPROVAL', 'AUTO_PUBLISHED', 'PENDING_PAYMENT', 'BLOCKED', 'COMPLETED', 'CANCELLED', 'PUBLISHED'],
      default: 'PENDING_APPROVAL'
    },
    payoutStatus: {
      type: String,
      enum: ['LOCKED', 'PARTIAL_RELEASED', 'RELEASED', 'FROZEN'],
      default: 'LOCKED'
    },
    cancellationPolicy: {
      before7Days: { type: String, default: 'FULL_REFUND' },
      before3Days: { type: String, default: 'HALF_REFUND' },
      before48Hours: { type: String, default: 'NO_REFUND' }
    }
  },
  { timestamps: true }
);

EventSchema.index({ date: 1 });
EventSchema.index({ organizer: 1, date: 1 });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
