import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReaction extends Document {
  post: Types.ObjectId;
  user: Types.ObjectId;
  type: 'like' | 'celebrate' | 'support' | 'insightful' | 'funny';
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema = new Schema<IReaction>(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['like', 'celebrate', 'support', 'insightful', 'funny'],
      required: true
    }
  },
  { timestamps: true }
);

// A user can only react once to a specific post
ReactionSchema.index({ post: 1, user: 1 }, { unique: true });
ReactionSchema.index({ post: 1, type: 1 });

export const Reaction = mongoose.model<IReaction>('Reaction', ReactionSchema);
