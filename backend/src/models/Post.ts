import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPost extends Document {
  author: Types.ObjectId;
  onBehalfOfCompany?: Types.ObjectId;
  content: string;
  mediaUrls: string[];
  visibility: 'public' | 'connections_only';
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    onBehalfOfCompany: { type: Schema.Types.ObjectId, ref: 'Company' },
    content: { type: String, required: true, trim: true },
    mediaUrls: [{ type: String }],
    visibility: {
      type: String,
      enum: ['public', 'connections_only'],
      default: 'public'
    }
  },
  { timestamps: true }
);

// Indexes for feed queries
PostSchema.index({ createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ onBehalfOfCompany: 1, createdAt: -1 });

export const Post = mongoose.model<IPost>('Post', PostSchema);
