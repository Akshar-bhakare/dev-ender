import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IContract extends Document {
  requirementId: Types.ObjectId;
  proposalId: Types.ObjectId;
  buyerOrgId: Types.ObjectId;
  providerOrgId: Types.ObjectId;
  title: string;
  scopeOfWork: string;
  startDate?: Date;
  endDate?: Date;
  totalValue: number;
  paymentTerms?: string;
  status: 'draft' | 'active' | 'onHold' | 'completed' | 'terminated';
  createdByMemberId: Types.ObjectId; // User from buyer side
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    requirementId: { type: Schema.Types.ObjectId, ref: 'ServiceRequirement', required: true },
    proposalId: { type: Schema.Types.ObjectId, ref: 'Proposal', required: true },
    buyerOrgId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    providerOrgId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    title: { type: String, required: true },
    scopeOfWork: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    totalValue: { type: Number, required: true },
    paymentTerms: { type: String },
    status: { 
      type: String, 
      enum: ['draft', 'active', 'onHold', 'completed', 'terminated'],
      default: 'draft'
    },
    createdByMemberId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

ContractSchema.index({ buyerOrgId: 1, providerOrgId: 1 });

export const Contract = mongoose.model<IContract>('Contract', ContractSchema);
