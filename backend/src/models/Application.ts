import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IApplication extends Document {
  job: Types.ObjectId;
  applicant: Types.ObjectId;
  resumeUrl?: string;
  coverLetter?: string;
  status: 'applied' | 'interviewing' | 'rejected' | 'accepted';
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resumeUrl: { type: String },
    coverLetter: { type: String, trim: true },
    status: {
      type: String,
      enum: ['applied', 'interviewing', 'rejected', 'accepted'],
      default: 'applied'
    }
  },
  { timestamps: true }
);

// Prevent duplicate applications for the same job by the same user
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
ApplicationSchema.index({ job: 1, status: 1 });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
