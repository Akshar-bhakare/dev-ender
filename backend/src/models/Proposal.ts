import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProposal extends Document {
  requirementId: Types.ObjectId;
  providerOrgId: Types.ObjectId;
  submittedByMemberId: Types.ObjectId;
  proposalSummary: string;
  approach: string;
  timelineEstimate: string;
  pricingModel: 'fixed' | 'hourly';
  priceQuote: number;
  assumptions?: string;
  attachments: string[];
  status: 'submitted' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: Date;
  updatedAt: Date;
}

const ProposalSchema = new Schema<IProposal>(
  {
    requirementId: { type: Schema.Types.ObjectId, ref: 'ServiceRequirement', required: true, index: true },
    providerOrgId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    submittedByMemberId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    proposalSummary: { type: String, required: true },
    approach: { type: String, required: true },
    timelineEstimate: { type: String, required: true },
    pricingModel: { 
      type: String, 
      enum: ['fixed', 'hourly'],
      required: true
    },
    priceQuote: { type: Number, required: true },
    assumptions: { type: String },
    attachments: [{ type: String }],
    status: { 
      type: String, 
      enum: ['submitted', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
      default: 'submitted'
    }
  },
  { timestamps: true }
);

export const Proposal = mongoose.model<IProposal>('Proposal', ProposalSchema);
