import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMilestone extends Document {
  contractId: Types.ObjectId;
  title: string;
  description: string;
  amount: number;
  dueDate?: Date;
  status: 'planned' | 'inProgress' | 'submitted' | 'accepted' | 'rejected' | 'paid';
  deliverableLinks: string[];
  acceptedByMemberId?: Types.ObjectId;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date },
    status: { 
      type: String, 
      enum: ['planned', 'inProgress', 'submitted', 'accepted', 'rejected', 'paid'],
      default: 'planned'
    },
    deliverableLinks: [{ type: String }],
    acceptedByMemberId: { type: Schema.Types.ObjectId, ref: 'User' },
    acceptedAt: { type: Date }
  },
  { timestamps: true }
);

export const Milestone = mongoose.model<IMilestone>('Milestone', MilestoneSchema);
