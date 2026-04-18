import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  status: 'HELD' | 'REFUNDED' | 'RELEASED';
  payoutStatus: 'LOCKED' | 'PARTIAL_RELEASED' | 'RELEASED' | 'FROZEN';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['HELD', 'REFUNDED', 'RELEASED'],
      default: 'HELD'
    },
    payoutStatus: {
      type: String,
      enum: ['LOCKED', 'PARTIAL_RELEASED', 'RELEASED', 'FROZEN'],
      default: 'LOCKED'
    },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String }
  },
  { timestamps: true }
);

PaymentSchema.index({ eventId: 1, userId: 1 });
PaymentSchema.index({ stripeSessionId: 1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
