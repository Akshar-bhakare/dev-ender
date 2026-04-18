import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  identityVerified: boolean;
  totalEventsHosted: number;
  avgRating: number;
  cancellationsCount: number;
  trustScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['user', 'admin'], 
      default: 'user' 
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active'
    },
    identityVerified: { type: Boolean, default: false },
    totalEventsHosted: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    cancellationsCount: { type: Number, default: 0 },
    trustScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
