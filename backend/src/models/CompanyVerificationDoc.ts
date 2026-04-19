import mongoose, { Schema, Document, Types } from 'mongoose';

export type CompanyDocType = 'incorporation_cert' | 'gst_cert' | 'business_pan' | 'director_id' | 'address_proof';

export interface ICompanyVerificationDoc extends Document {
  companyId: Types.ObjectId;
  docType: CompanyDocType;
  fileUrl: string;
  extractedText: string;
  extractedFields: {
    registrationNumber?: string;
    gstin?: string;
    pan?: string;
    legalName?: string;
    address?: string;
    dateOfIncorporation?: string;
  };
  mismatchFound: boolean;
  mismatchDetails?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  uploadedAt: Date;
}

const CompanyVerificationDocSchema = new Schema<ICompanyVerificationDoc>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    docType: { type: String, enum: ['incorporation_cert', 'gst_cert', 'business_pan', 'director_id', 'address_proof'], required: true },
    fileUrl: { type: String, required: true },
    extractedText: { type: String },
    extractedFields: {
      registrationNumber: String,
      gstin: String,
      pan: String,
      legalName: String,
      address: String,
      dateOfIncorporation: String,
    },
    mismatchFound: { type: Boolean, default: false },
    mismatchDetails: { type: String },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    uploadedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const CompanyVerificationDoc = mongoose.models.CompanyVerificationDoc || mongoose.model<ICompanyVerificationDoc>('CompanyVerificationDoc', CompanyVerificationDocSchema);
