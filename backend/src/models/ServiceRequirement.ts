import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IServiceRequirement extends Document {
  orgId: Types.ObjectId; // Buyer
  createdByMemberId: Types.ObjectId;
  title: string;
  description: string;
  categories: string[];
  skillsRequired: string[];
  budgetRange: {
    min: number;
    max: number;
    currency: string;
  };
  engagementModel: 'fixed' | 'hourly' | 'retainer';
  expectedStartDate?: Date;
  expectedDuration?: string;
  locationConstraints?: string;
  visibility: 'public' | 'invite-only' | 'network-only';
  status: 'draft' | 'published' | 'closed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const ServiceRequirementSchema = new Schema<IServiceRequirement>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    createdByMemberId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    categories: [{ type: String, trim: true }],
    skillsRequired: [{ type: String, trim: true }],
    budgetRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      currency: { type: String, default: 'USD' }
    },
    engagementModel: { 
      type: String, 
      enum: ['fixed', 'hourly', 'retainer'],
      required: true
    },
    expectedStartDate: { type: Date },
    expectedDuration: { type: String },
    locationConstraints: { type: String },
    visibility: { 
      type: String, 
      enum: ['public', 'invite-only', 'network-only'],
      default: 'public'
    },
    status: { 
      type: String, 
      enum: ['draft', 'published', 'closed', 'cancelled'],
      default: 'draft'
    }
  },
  { timestamps: true }
);

ServiceRequirementSchema.index({ title: 'text', description: 'text', skillsRequired: 'text' });
ServiceRequirementSchema.index({ status: 1, createdAt: -1 });

export const ServiceRequirement = mongoose.model<IServiceRequirement>(
  'ServiceRequirement', 
  ServiceRequirementSchema
);
