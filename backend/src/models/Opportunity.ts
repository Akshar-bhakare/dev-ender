import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOpportunity extends Document {
  postedBy: Types.ObjectId;
  title: string;
  description: string;
  budget?: string;
  skillsRequired: string[];
  status: 'open' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const OpportunitySchema = new Schema<IOpportunity>(
  {
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    budget: { type: String },
    skillsRequired: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open'
    }
  },
  { timestamps: true }
);

OpportunitySchema.index({ status: 1, createdAt: -1 });
OpportunitySchema.index({ title: 'text', description: 'text' });

export const Opportunity = mongoose.model<IOpportunity>('Opportunity', OpportunitySchema);
