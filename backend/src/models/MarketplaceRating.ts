import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMarketplaceRating extends Document {
  contractId: Types.ObjectId;
  raterOrgId: Types.ObjectId;
  rateeOrgId: Types.ObjectId;
  overallScore: number;
  qualityScore: number;
  communicationScore: number;
  timelinessScore: number;
  reviewText?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceRatingSchema = new Schema<IMarketplaceRating>(
  {
    contractId: { type: Schema.Types.ObjectId, ref: 'Contract', required: true, index: true },
    raterOrgId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    rateeOrgId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    overallScore: { type: Number, required: true, min: 1, max: 5 },
    qualityScore: { type: Number, required: true, min: 1, max: 5 },
    communicationScore: { type: Number, required: true, min: 1, max: 5 },
    timelinessScore: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, trim: true }
  },
  { timestamps: true }
);

MarketplaceRatingSchema.index({ raterOrgId: 1, rateeOrgId: 1 });

export const MarketplaceRating = mongoose.model<IMarketplaceRating>(
  'MarketplaceRating', 
  MarketplaceRatingSchema
);
