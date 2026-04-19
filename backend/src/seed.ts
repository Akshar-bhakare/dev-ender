import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from './models/User.js';
import { Post } from './models/Post.js';
import { Connection } from './models/Connection.js';
import { Comment } from './models/Comment.js';

const MONGO_URI = process.env.MONGO_URI!;

const industries = ['Technology', 'Finance', 'Healthcare', 'Design', 'Marketing', 'Education', 'Legal', 'Consulting'];
const jobTitles = ['Software Engineer', 'Product Manager', 'UX Designer', 'Data Scientist', 'Marketing Lead', 'CTO', 'Founder', 'DevOps Engineer', 'Business Analyst', 'Full Stack Developer'];
const companies = ['TechCorp', 'NeuralFlow', 'EcoSynthetix', 'FinEdge', 'DesignHub', 'DataMind', 'CloudBase', 'StartupX', 'GrowthLab', 'InnovateCo'];
const skills = ['React', 'Node.js', 'Python', 'Machine Learning', 'Product Strategy', 'UI/UX', 'Data Analysis', 'Cloud Architecture', 'Marketing', 'Leadership'];
const avatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150',
];

const postContents = [
  "Just shipped a major feature that reduces our API latency by 60%. The secret? Aggressive caching + smarter query design.",
  "Hiring 3 senior engineers for our AI team. DM me if you're passionate about building at scale. Remote-first, equity included.",
  "Raised our seed round today. 18 months of grinding, 200+ rejections, and finally a yes that changes everything. 🚀",
  "Hot take: Most 'AI startups' are just wrappers around GPT-4. Real moats come from proprietary data and distribution.",
  "Just got my identity verified on SyncUp. The face + document verification process is genuinely impressive. Trust matters.",
  "Looking for co-founders with design + growth backgrounds. We're building the future of professional networking. Serious inquiries only.",
  "5 lessons from scaling our team from 3 to 50 people in 18 months: 1. Hire for culture first. 2. Document everything. 3. Async > sync meetings.",
  "Our B2B SaaS hit $1M ARR today. We bootstrapped the entire way. No VC, no debt. Just product-market fit and relentless execution.",
  "The best engineers I've worked with all share one trait: they ask 'why' before 'how'. Problem framing > solution jumping.",
  "Hosting a verified networking event in Mumbai next month. Only verified professionals on SyncUp can attend. Link in bio.",
  "We're seeking strategic partners in the fintech space. If you're building in payments or lending, let's talk.",
  "Just published our engineering blog post on distributed systems. 3 years of learnings condensed into 2000 words.",
  "Reminder: Your network is your net worth. But only if it's built on trust and genuine relationships.",
  "We're open to funding conversations. Pre-Series A, strong traction, clear path to profitability. Reach out.",
  "The future of work is verified identity + trusted networks. That's why I joined SyncUp as an early adopter.",
  "Just completed a 90-day no-meeting sprint. Productivity went up 40%. Async communication is underrated.",
  "Looking for a technical co-founder. I have the business, the customers, and the vision. You bring the code.",
  "Our design system just went open source. 200+ components, fully accessible, production-ready. Check it out.",
  "Unpopular opinion: Most startup advice is survivorship bias dressed up as wisdom. Build for your specific context.",
  "We're hiring across all functions. If you want to work on hard problems with great people, apply now.",
];

const opportunityTags = ['hiring', 'seeking_funding', 'hosting_event', 'looking_for_partners', null, null, null];

const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing seed data (keep real registered users)
  await Post.deleteMany({});
  await Connection.deleteMany({});
  await Comment.deleteMany({});
  await User.deleteMany({ email: /@seed\.syncup\.io$/ });

  console.log('Cleared old seed data');

  const passwordHash = await bcrypt.hash('SeedPass123!', 10);

  // Create 50 seed users
  const userDocs = [];
  for (let i = 0; i < 50; i++) {
    const firstName = ['Alex', 'Jordan', 'Morgan', 'Taylor', 'Casey', 'Riley', 'Avery', 'Quinn', 'Blake', 'Drew'][i % 10];
    const lastName = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore'][Math.floor(i / 5) % 10];
    const trustScore = randInt(20, 95);

    userDocs.push({
      fullName: `${firstName} ${lastName}`,
      email: `user${i}@seed.syncup.io`,
      passwordHash,
      phone: `+91${randInt(7000000000, 9999999999)}`,
      role: 'professional',
      status: 'active',
      signupStep: 5,
      emailVerified: true,
      identityVerified: trustScore > 60,
      faceVerified: trustScore > 50,
      documentVerificationStatus: trustScore > 60 ? 'verified' : 'pending',
      jobTitle: rand(jobTitles),
      industry: rand(industries),
      currentCompany: rand(companies),
      bio: `Passionate about ${rand(industries).toLowerCase()} and building things that matter.`,
      avatar: rand(avatars),
      trustScore,
      trustLevel: trustScore >= 80 ? 'premium' : trustScore >= 60 ? 'high' : trustScore >= 40 ? 'medium' : 'low',
      permissionTier: trustScore >= 80 ? 4 : trustScore >= 60 ? 3 : trustScore >= 40 ? 2 : 1,
      isVerified: trustScore > 60,
      badges: trustScore > 60 ? ['identity_verified'] : [],
      skills: [rand(skills), rand(skills)].filter((v, i, a) => a.indexOf(v) === i),
      totalExperienceMonths: randInt(12, 180),
      createdAt: daysAgo(randInt(10, 90)),
    });
  }

  const users = await User.insertMany(userDocs);
  console.log(`Created ${users.length} seed users`);

  // Create follow relationships (each user follows ~5 others)
  for (const user of users) {
    const toFollow = users.filter(u => u._id.toString() !== user._id.toString())
      .sort(() => Math.random() - 0.5).slice(0, 5);

    await User.findByIdAndUpdate(user._id, { $set: { following: toFollow.map(u => u._id) } });
    for (const target of toFollow) {
      await User.findByIdAndUpdate(target._id, { $addToSet: { followers: user._id } });
    }
  }
  console.log('Created follow relationships');

  // Create connections (each user connected to ~3 others)
  const connectionPairs = new Set<string>();
  for (const user of users) {
    const targets = users.filter(u => u._id.toString() !== user._id.toString())
      .sort(() => Math.random() - 0.5).slice(0, 3);

    for (const target of targets) {
      const key = [user._id.toString(), target._id.toString()].sort().join('-');
      if (!connectionPairs.has(key)) {
        connectionPairs.add(key);
        await Connection.create({
          requester: user._id,
          recipient: target._id,
          status: 'accepted',
          createdAt: daysAgo(randInt(1, 60)),
        });
      }
    }
  }
  console.log(`Created ${connectionPairs.size} connections`);

  // Create 200 posts
  const postDocs = [];
  for (let i = 0; i < 200; i++) {
    const author = rand(users);
    const likers = users.sort(() => Math.random() - 0.5).slice(0, randInt(0, 20));
    postDocs.push({
      author: author._id,
      content: rand(postContents),
      mediaUrls: Math.random() > 0.6 ? [`https://images.unsplash.com/photo-${1600000000 + randInt(0, 99999999)}?auto=format&fit=crop&q=80&w=800`] : [],
      visibility: 'public',
      likes: likers.map(u => u._id),
      commentCount: randInt(0, 15),
      opportunityTag: rand(opportunityTags),
      createdAt: daysAgo(randInt(0, 90)),
    });
  }

  const posts = await Post.insertMany(postDocs);
  console.log(`Created ${posts.length} posts`);

  // Create comments on some posts
  const commentTexts = [
    "This is exactly what I needed to hear today. 🙌",
    "Great insight! Would love to connect and discuss further.",
    "Congrats! Well deserved after all the hard work.",
    "Totally agree. The fundamentals never change.",
    "This is the way. Verified networks > random connections.",
    "Impressive numbers. What's your tech stack?",
    "Following for more content like this!",
    "This resonates deeply. Building trust takes time.",
  ];

  const commentDocs = [];
  for (const post of posts.slice(0, 80)) {
    const numComments = randInt(0, 5);
    for (let i = 0; i < numComments; i++) {
      commentDocs.push({
        post: post._id,
        author: rand(users)._id,
        content: rand(commentTexts),
        createdAt: new Date(post.createdAt.getTime() + randInt(1, 48) * 60 * 60 * 1000),
      });
    }
  }
  await Comment.insertMany(commentDocs);
  console.log(`Created ${commentDocs.length} comments`);

  console.log('✅ Seed complete!');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
