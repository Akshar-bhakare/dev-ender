import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IConnection extends Document {
  requester: Types.ObjectId;
  recipient: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const ConnectionSchema = new Schema<IConnection>(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness of connection request and optimize connection queries
ConnectionSchema.index({ requester: 1, recipient: 1 }, { unique: true });
ConnectionSchema.index({ recipient: 1, status: 1 });
ConnectionSchema.index({ requester: 1, status: 1 });

export const Connection = mongoose.model<IConnection>('Connection', ConnectionSchema);
