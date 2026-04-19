import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { connectDB } from '../src/config/db.js';

const HOSTS = [
  {
    _id: '65f0a1b2c3d4e5f678900001',
    fullName: "Alex Rivera",
    email: "alex.rivera@kaame.com",
    role: "professional",
    status: "active",
    passwordHash: "$2b$10$K7.vO/6M9l6.5PqX4L8y6.9Q8o1Zz6Y8g6Y8g6Y8g6Y8g6Y8g6Y8g", // password123
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2370&auto=format&fit=crop",
    bio: "Lead at KaaMe Core. Focused on building the world's most trusted professional ecosystem for elite talent.",
    industry: "Ecosystem Strategy",
    jobTitle: "Head of Ecosystem",
    trustScore: 98,
    trustLevel: "premium",
    permissionTier: 4,
    identityVerified: true,
    badges: ["verified_host", "core_team", "premium_organizer"]
  },
  {
    _id: '65f0a1b2c3d4e5f678900002',
    fullName: "Sarah Chen",
    email: "sarah.chen@designers.co",
    role: "professional",
    status: "active",
    passwordHash: "$2b$10$K7.vO/6M9l6.5PqX4L8y6.9Q8o1Zz6Y8g6Y8g6Y8g6Y8g6Y8g6Y8g",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2370&auto=format&fit=crop",
    bio: "Spatial UI/UX Specialist. Helping brands transition from 2D screens to immersive computing environments.",
    industry: "Design",
    jobTitle: "Spatial Designer",
    trustScore: 96,
    trustLevel: "high",
    permissionTier: 3,
    identityVerified: true,
    badges: ["verified_host", "top_rated_designer"]
  },
  {
    _id: '65f0a1b2c3d4e5f678900003',
    fullName: "Prof. Marcus Vane",
    email: "marcus.vane@quantum.edu",
    role: "professional",
    status: "active",
    passwordHash: "$2b$10$K7.vO/6M9l6.5PqX4L8y6.9Q8o1Zz6Y8g6Y8g6Y8g6Y8g6Y8g6Y8g",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2370&auto=format&fit=crop",
    bio: "Quantum Computing Researcher and Professor. Specializing in error correction and cryptographic hardware.",
    industry: "Quantum Tech",
    jobTitle: "Quantum Scientist",
    trustScore: 100,
    trustLevel: "premium",
    permissionTier: 4,
    identityVerified: true,
    badges: ["verified_host", "industry_expert", "pioneer"]
  },
  {
    _id: '65f0a1b2c3d4e5f678900004',
    fullName: "Elena Ross",
    email: "elena.ross@aether.ia",
    role: "professional",
    status: "active",
    passwordHash: "$2b$10$K7.vO/6M9l6.5PqX4L8y6.9Q8o1Zz6Y8g6Y8g6Y8g6Y8g6Y8g6Y8g",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=2370&auto=format&fit=crop",
    bio: "Policy expert and ethical AI advocate. Navigating the intersection of regulation and innovation.",
    industry: "AI Governance",
    jobTitle: "Policy Lead",
    trustScore: 94,
    trustLevel: "high",
    permissionTier: 3,
    identityVerified: true,
    badges: ["verified_host", "ethics_lead"]
  },
  {
    _id: '65f0a1b2c3d4e5f678900005',
    fullName: "David Goldman",
    email: "david.g@acme-cap.com",
    role: "professional",
    status: "active",
    passwordHash: "$2b$10$K7.vO/6M9l6.5PqX4L8y6.9Q8o1Zz6Y8g6Y8g6Y8g6Y8g6Y8g6Y8g",
    avatar: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2370&auto=format&fit=crop",
    bio: "Institutional FinTech disruption. Bridge building between traditional banking and next-gen liquidity protocols.",
    industry: "Finance",
    jobTitle: "Partner",
    trustScore: 98,
    trustLevel: "premium",
    permissionTier: 4,
    identityVerified: true,
    badges: ["verified_host", "institutional_partner"]
  },
  {
    _id: '65f0a1b2c3d4e5f678900006',
    fullName: "Dr. Aris Thorne",
    email: "aris.t@veda-genesis.com",
    role: "professional",
    status: "active",
    passwordHash: "$2b$10$K7.vO/6M9l6.5PqX4L8y6.9Q8o1Zz6Y8g6Y8g6Y8g6Y8g6Y8g6Y8g",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2370&auto=format&fit=crop",
    bio: "Biotech pioneer focused on radicial human longevity and CRISPR application systems.",
    industry: "Life Sciences",
    jobTitle: "Chief Scientist",
    trustScore: 99,
    trustLevel: "premium",
    permissionTier: 4,
    identityVerified: true,
    badges: ["verified_host", "longevity_expert"]
  },
  {
    _id: '65f0a1b2c3d4e5f678900007',
    fullName: "Ingrid Sigurd",
    email: "ingrid@earthfirst.is",
    role: "professional",
    status: "active",
    passwordHash: "$2b$10$K7.vO/6M9l6.5PqX4L8y6.9Q8o1Zz6Y8g6Y8g6Y8g6Y8g6Y8g6Y8g",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2370&auto=format&fit=crop",
    bio: "Renewable energy architect. Designing post-carbon infrastructure for high-scale economy transitions.",
    industry: "Clean Tech",
    jobTitle: "Architect",
    trustScore: 97,
    trustLevel: "high",
    permissionTier: 3,
    identityVerified: true,
    badges: ["verified_host", "sustainability_pioneer"]
  }
];

async function seed() {
  try {
    await connectDB();
    console.log('🌱 Starting host seeding...');

    for (const hostData of HOSTS) {
      const existing = await User.findById(hostData._id);
      if (existing) {
        Object.assign(existing, hostData);
        await existing.save();
        console.log(`✅ Updated host: ${hostData.fullName}`);
      } else {
        const newUser = new User(hostData);
        await newUser.save();
        console.log(`✨ Created host: ${hostData.fullName}`);
      }
    }

    console.log('🏁 Host seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
