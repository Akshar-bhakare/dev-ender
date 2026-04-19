import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User, Company, FundingRound, Investment, Portfolio } from './models/index.js';
import { generateEmbedding } from './utils/embedding.utils.js';

const MONGO_URI = process.env.MONGO_URI!;

const industries = ['Fintech', 'SaaS', 'AI / ML', 'Healthcare', 'EdTech', 'Logistics', 'Ecommerce'];
const companyNames = [
  'NeuralEdge', 'AquaPay', 'BioSynth', 'LogiFlow', 'EduVerse', 
  'CyberShield', 'GreenPeak', 'CloudSync', 'SwiftCart', 'OmniLedger'
];

const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

async function seedMarketplace() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing marketplace data
  await Company.deleteMany({});
  await FundingRound.deleteMany({});
  await Investment.deleteMany({});
  await Portfolio.deleteMany({});
  await User.deleteMany({ email: /@market\.syncup\.io$/ });

  const passwordHash = await bcrypt.hash('MarketPass123!', 10);

  // 1. Create 200 Investors (Normal Users)
  const investorDocs = [];
  for (let i = 0; i < 200; i++) {
    investorDocs.push({
      fullName: `Investor ${i}`,
      email: `investor${i}@market.syncup.io`,
      passwordHash,
      role: 'professional',
      status: 'active',
      signupStep: 5,
      trustScore: randInt(40, 95),
      industry: rand(industries),
      skills: [rand(['Finance', 'Investment', 'Strategy']), rand(['Tech', 'Market Analysis'])]
    });
  }
  const investors = await User.insertMany(investorDocs);
  console.log('Created 200 investors');

  // 2. Create 10 Verified Companies
  const companyDocs = [];
  for (let i = 0; i < 10; i++) {
    const name = companyNames[i];
    const owner = investors[i]; // Assign first 10 investors as owners for simplicity
    companyDocs.push({
      legalName: `${name} Private Limited`,
      displayName: name,
      name: name, // Fix for legacy unique index
      ownerId: owner._id,
      industry: rand(industries),
      description: `A pioneering ${rand(industries).toLowerCase()} startup focused on scaling innovative solutions.`,
      trustScore: randInt(70, 98),
      verificationStatus: 'verified',
      founderVerified: 'verified',
      documentUploaded: true,
      domainEmailVerified: true,
      logoUrl: `https://images.unsplash.com/photo-${1600000000 + randInt(0, 99999999)}?auto=format&fit=crop&q=80&w=200`,
      status: 'active'
    });
  }
  const companies = await Promise.all(companyDocs.map(doc => Company.create(doc)));
  console.log('Created 10 verified companies');

  // 3. Create 5 Active Funding Rounds
  const rounds = [];
  for (let i = 0; i < 5; i++) {
    const company = companies[i];
    const targetAmount = randInt(50, 200) * 100000; // 50L to 2Cr
    const valuation = targetAmount * 10;
    
    rounds.push({
      companyId: company._id,
      title: `${company.displayName} Seed Round`,
      pitch: `We are raising capital to expand our ${company.industry} operations globally. With 30% MoM growth, we are positioned to lead the market.`,
      valuation,
      targetAmount,
      raisedAmount: 0,
      retailQuotaPercent: 20,
      minimumInvestment: 10000,
      equityOffered: 10,
      currency: 'INR',
      status: 'active',
      adminApproved: true,
      trustScore: company.trustScore,
      riskScore: 100 - company.trustScore,
      founderVerified: true,
      financialDocsUploaded: true,
      registryMatched: true,
      traction: {
        monthlyRevenue: randInt(5, 50) * 10000,
        monthlyActiveUsers: randInt(1000, 50000),
        revenueGrowthPercent: randInt(10, 40),
        burnRate: randInt(2, 10) * 10000,
        runway: randInt(12, 24)
      },
      metrics: [
        { month: 'Jan', revenue: 10000, users: 1000, valuation: valuation * 0.7 },
        { month: 'Feb', revenue: 15000, users: 1500, valuation: valuation * 0.8 },
        { month: 'Mar', revenue: 22000, users: 2400, valuation: valuation * 0.9 },
        { month: 'Apr', revenue: 35000, users: 4000, valuation: valuation }
      ],
      embedding: await generateEmbedding(`${company.displayName} ${company.industry} expansion pitch`)
    });
  }
  const fundingRounds = await FundingRound.insertMany(rounds);
  console.log('Created 5 active funding rounds');

  // 4. Create 500 Investments
  const investments = [];
  for (let i = 0; i < 500; i++) {
    const investor = rand(investors);
    const round = rand(fundingRounds);
    const amount = randInt(1, 10) * 10000;
    
    investments.push({
      userId: investor._id,
      fundingRoundId: round._id,
      amount,
      status: 'success',
      createdAt: daysAgo(randInt(1, 30))
    });

    // Partial update to round (simulated, since we are doing bulk insert)
    round.raisedAmount += amount;
  }
  const createdInvestments = await Investment.insertMany(investments);
  console.log('Created 500 investments');

  // Update FundingRound raisedAmount in DB
  for (const round of fundingRounds) {
    await FundingRound.findByIdAndUpdate(round._id, { raisedAmount: round.raisedAmount });
  }

  // 5. Create Portfolios for all investors
  for (const investor of investors) {
    const myInvestments = createdInvestments.filter(inv => inv.userId.toString() === investor._id.toString());
    if (myInvestments.length > 0) {
      await Portfolio.create({
        userId: investor._id,
        investments: myInvestments.map(inv => inv._id),
        totalInvested: myInvestments.reduce((sum, inv) => sum + inv.amount, 0),
        lastUpdated: new Date()
      });
    }
  }
  console.log('Created portfolios for investors');

  console.log('✅ Marketplace Seed Complete!');
  await mongoose.disconnect();
}

seedMarketplace().catch(err => { console.error(err); process.exit(1); });
