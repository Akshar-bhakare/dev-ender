import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IServiceProfile extends Document {
  orgId: Types.ObjectId;
  title: string;
  description: string;
  categories: string[];
  skills: string[];
  minBudget?: number;
  preferredEngagementModel?: 'fixed' | 'hourly' | 'retainer';
  caseStudies: Array<{
    title: string;
    link?: string;
    description: string;
  }>;
  geoPreferences: string[];
  averageResponseTime?: number; // In hours
  successRate?: number; // Percentage
  createdAt: Date;
  updatedAt: Date;
}

const ServiceProfileSchema = new Schema<IServiceProfile>(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    categories: [{ type: String, trim: true }],
    skills: [{ type: String, trim: true }],
    minBudget: { type: Number },
    preferredEngagementModel: { 
      type: String, 
      enum: ['fixed', 'hourly', 'retainer']
    },
    caseStudies: [
      {
        title: { type: String, required: true },
        link: { type: String },
        description: { type: String, required: true }
      }
    ],
    geoPreferences: [{ type: String, trim: true }],
    averageResponseTime: { type: Number },
    successRate: { type: Number, min: 0, max: 100 }
  },
  { timestamps: true }
);

ServiceProfileSchema.index({ title: 'text', description: 'text', skills: 'text' });
ServiceProfileSchema.index({ categories: 1 });

export const OrganizationServiceProfile = mongoose.model<IServiceProfile>(
  'OrganizationServiceProfile', 
  ServiceProfileSchema
);
