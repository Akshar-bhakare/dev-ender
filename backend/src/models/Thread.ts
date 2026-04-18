import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IThread extends Document {
  participants: Types.ObjectId[];
  type: 'direct' | 'group';
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ThreadSchema = new Schema<IThread>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    type: {
      type: String,
      enum: ['direct', 'group'],
      default: 'direct'
    },
    lastMessageAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Index to quickly fetch threads for a user sorted by most recent message
ThreadSchema.index({ participants: 1, lastMessageAt: -1 });

export const Thread = mongoose.model<IThread>('Thread', ThreadSchema);
