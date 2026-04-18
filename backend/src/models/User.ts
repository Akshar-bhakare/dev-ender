import mongoose, { Schema, Document } from 'mongoose';
import * as uuid from 'uuid';


export interface IUser extends Document {
  uid: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'SUPER_ADMIN' | 'CANDIDATE' | 'BUSINESS';
  status: 'active' | 'suspended' | 'deleted';
  avatar?: string;
  company?: string;
  bio?: string;
  embedding?: number[];
  faceVerified: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected';
  kycVerifiedAt?: Date;
  docData?: {
    name?: string;
    dob?: string;
    docNumber?: string;
    expiry?: string;
    nationality?: string;
    docType?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    uid: {
      type: String,
      default: () => uuid.v7(),
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
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
      enum: ['SUPER_ADMIN', 'CANDIDATE', 'BUSINESS'], 
      default: 'CANDIDATE' 
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active'
    },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100' },
    company: { type: String, default: 'Independent' },
    bio: { type: String, default: '' },
    embedding: {
      type: [Number],
      select: false // Never return in API
    },
    faceVerified: {
      type: Boolean,
      default: false
    },
    kycStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    kycVerifiedAt: {
      type: Date
    },
    docData: {
      name: String,
      dob: String,
      docNumber: String,
      expiry: String,
      nationality: String,
      docType: String
    }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
