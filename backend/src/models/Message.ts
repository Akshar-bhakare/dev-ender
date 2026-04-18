import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  thread: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    thread: { type: Schema.Types.ObjectId, ref: 'Thread', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

// Index to quickly load messages in a thread
MessageSchema.index({ thread: 1, createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
