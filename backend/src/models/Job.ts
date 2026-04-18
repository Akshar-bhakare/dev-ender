import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IJob extends Document {
  company: Types.ObjectId;
  title: string;
  description: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  status: 'open' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open'
    }
  },
  { timestamps: true }
);

// Indexes for job search and filtering
JobSchema.index({ company: 1, status: 1 });
JobSchema.index({ title: 'text', description: 'text' });

export const Job = mongoose.model<IJob>('Job', JobSchema);
