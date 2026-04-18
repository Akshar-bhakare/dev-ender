import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IEventRegistration extends Document {
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'waitlisted' | 'attended';
  qrCodeToken: string;
  ticketNumber: string;
  paymentId?: string;
  razorpayOrderId?: string;
  amountPaid?: number;
  promoCodeId?: Types.ObjectId;
  discountApplied?: number;
  checkedInAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventRegistrationSchema = new Schema<IEventRegistration>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'cancelled', 'waitlisted', 'attended'],
      default: 'confirmed',
    },
    qrCodeToken: { type: String, required: true, unique: true },
    ticketNumber: { type: String, required: true, unique: true },
    paymentId: { type: String },
    razorpayOrderId: { type: String },
    amountPaid: { type: Number },
    promoCodeId: { type: Schema.Types.ObjectId, ref: 'EventPromoCode' },
    discountApplied: { type: Number },
    checkedInAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

EventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });
EventRegistrationSchema.index({ qrCodeToken: 1 });
EventRegistrationSchema.index({ razorpayOrderId: 1 });

export const EventRegistration = mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema);

export interface IEventPromoCode extends Document {
  eventId: Types.ObjectId;
  code: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  maxUses: number;
  usedCount: number;
  expiresAt: Date;
  isActive: boolean;
  createdByUserId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventPromoCodeSchema = new Schema<IEventPromoCode>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    code: { type: String, required: true, uppercase: true },
    discountType: { type: String, enum: ['flat', 'percentage'], required: true },
    discountValue: { type: Number, required: true },
    maxUses: { type: Number, required: true },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    createdByUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

EventPromoCodeSchema.index({ eventId: 1, code: 1 }, { unique: true });

export const EventPromoCode = mongoose.model<IEventPromoCode>('EventPromoCode', EventPromoCodeSchema);

export interface IEventPayout extends Document {
  eventId: Types.ObjectId;
  organizerUserId: Types.ObjectId;
  totalCollected: number;
  platformFee: number;
  payoutAmount: number;
  status: 'holding' | 'released' | 'refund_initiated' | 'refunded';
  releasedAt?: Date;
  refundInitiatedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventPayoutSchema = new Schema<IEventPayout>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, unique: true },
    organizerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    totalCollected: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    payoutAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['holding', 'released', 'refund_initiated', 'refunded'],
      default: 'holding',
    },
    releasedAt: { type: Date },
    refundInitiatedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export const EventPayout = mongoose.model<IEventPayout>('EventPayout', EventPayoutSchema);

