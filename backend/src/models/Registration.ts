import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRegistration extends Document {
  event: Types.ObjectId;
  user: Types.ObjectId;
  status: 'going' | 'maybe';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  stripeSessionId?: string;
  amountPaid?: number;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['going', 'maybe'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    stripeSessionId: { type: String },
    amountPaid: { type: Number }
  },
  { timestamps: true }
);

// Prevent duplicate registrations
RegistrationSchema.index({ event: 1, user: 1 }, { unique: true });
RegistrationSchema.index({ event: 1, status: 1 });

export const Registration = mongoose.model<IRegistration>('Registration', RegistrationSchema);
