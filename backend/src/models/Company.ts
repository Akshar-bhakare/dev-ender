import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  industry: string;
  size: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  description?: string;
  website?: string;
  logoUrl?: string;
  admins: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    industry: { type: String, required: true, trim: true },
    size: { 
      type: String, 
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      required: true
    },
    description: { type: String, trim: true },
    website: { type: String, trim: true },
    logoUrl: { type: String },
    admins: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

CompanySchema.index({ name: 'text', industry: 'text' });

export const Company = mongoose.model<ICompany>('Company', CompanySchema);
