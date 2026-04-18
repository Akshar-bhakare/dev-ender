import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  post: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  parentComment?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' }
  },
  { timestamps: true }
);

// Indexes to quickly fetch comments for a post
CommentSchema.index({ post: 1, createdAt: 1 });
CommentSchema.index({ parentComment: 1 });

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
