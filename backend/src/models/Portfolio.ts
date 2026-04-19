import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPortfolio extends Document {
  userId: Types.ObjectId;
  investments: Types.ObjectId[]; // Array of Investment IDs
  totalInvested: number;
  totalReturns: number;
  expectedReturns: number;
  lastUpdated: Date;
}

const PortfolioSchema = new Schema<IPortfolio>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  investments: [{ type: Schema.Types.ObjectId, ref: 'Investment' }],
  totalInvested: { type: Number, default: 0 },
  totalReturns: { type: Number, default: 0 },
  expectedReturns: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

PortfolioSchema.index({ userId: 1 });

export const Portfolio = mongoose.models.Portfolio || mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
