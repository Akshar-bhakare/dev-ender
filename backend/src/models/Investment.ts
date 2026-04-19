import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInvestment extends Document {
  userId: Types.ObjectId;
  fundingRoundId: Types.ObjectId;
  amount: number;
  currency: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  status: 'pending' | 'success' | 'failed' | 'refunded' | 'frozen';
  createdAt: Date;
  updatedAt: Date;
}

const InvestmentSchema = new Schema<IInvestment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fundingRoundId: { type: Schema.Types.ObjectId, ref: 'FundingRound', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  stripeSessionId: { type: String },
  stripePaymentIntentId: { type: String },
  status: { type: String, enum: ['pending', 'success', 'failed', 'refunded', 'frozen'], default: 'pending' },
}, { timestamps: true });

InvestmentSchema.index({ userId: 1, createdAt: -1 });
InvestmentSchema.index({ fundingRoundId: 1 });
InvestmentSchema.index({ stripeSessionId: 1 });

export const Investment = mongoose.models.Investment || mongoose.model<IInvestment>('Investment', InvestmentSchema);
