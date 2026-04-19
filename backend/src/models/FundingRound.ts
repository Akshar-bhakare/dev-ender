import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFundingRound extends Document {
  companyId: Types.ObjectId;
  title: string;
  pitch: string;
  valuation: number;
  targetAmount: number;
  raisedAmount: number;
  retailQuotaPercent: number;
  minimumInvestment: number;
  equityOffered: number;
  currency: string;
  status: 'draft' | 'pending_approval' | 'active' | 'closed' | 'cancelled' | 'frozen';
  adminApproved: boolean;
  trustScore: number;
  riskScore: number;
  founderVerified: boolean;
  financialDocsUploaded: boolean;
  registryMatched: boolean;
  escrowEnabled: boolean;
  maxInvestmentPerUser: number;
  traction: {
    monthlyRevenue: number;
    monthlyActiveUsers: number;
    revenueGrowthPercent: number;
    burnRate: number;
    runway: number;
  };
  metrics: Array<{ month: string; revenue: number; users: number; valuation: number }>;
  milestones: Array<{ title: string; targetAmount: number; released: boolean; releasedAt?: Date }>;
  closesAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FundingRoundSchema = new Schema<IFundingRound>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true },
  pitch: { type: String, required: true },
  valuation: { type: Number, required: true },
  targetAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  retailQuotaPercent: { type: Number, default: 20 },
  minimumInvestment: { type: Number, default: 1000 },
  equityOffered: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['draft', 'pending_approval', 'active', 'closed', 'cancelled', 'frozen'], default: 'draft' },
  adminApproved: { type: Boolean, default: false },
  trustScore: { type: Number, default: 0 },
  riskScore: { type: Number, default: 50 },
  founderVerified: { type: Boolean, default: false },
  financialDocsUploaded: { type: Boolean, default: false },
  registryMatched: { type: Boolean, default: false },
  escrowEnabled: { type: Boolean, default: true },
  maxInvestmentPerUser: { type: Number, default: 50000 },
  traction: {
    monthlyRevenue: { type: Number, default: 0 },
    monthlyActiveUsers: { type: Number, default: 0 },
    revenueGrowthPercent: { type: Number, default: 0 },
    burnRate: { type: Number, default: 0 },
    runway: { type: Number, default: 0 },
  },
  metrics: [{ month: String, revenue: Number, users: Number, valuation: Number }],
  milestones: [{ title: String, targetAmount: Number, released: { type: Boolean, default: false }, releasedAt: Date }],
  closesAt: { type: Date },
}, { timestamps: true });

FundingRoundSchema.index({ status: 1, createdAt: -1 });
FundingRoundSchema.index({ companyId: 1 });

export const FundingRound = mongoose.models.FundingRound || mongoose.model<IFundingRound>('FundingRound', FundingRoundSchema);
