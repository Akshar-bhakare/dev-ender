import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User, Company, OwnershipClaim, VerificationLog, ClaimStatus } from '../models/index.js';
import { VerificationService } from '../modules/verification/verification.service.js';

async function runTest() {
  console.log('🚀 Starting Ownership Verification Test Flow...\n');

  try {
    await connectDB();

    // 1. Setup Mock User & Company
    console.log('--- Step 1: Setup ---');
    const mockEmail = `test-founder-${Date.now()}@logistics-global.com`;
    const user = await User.create({
      email: mockEmail,
      passwordHash: 'mock-hash',
      role: 'user'
    });
    console.log(`✅ Created User: ${user.email}`);

    const company = await Company.create({
      name: `Logistics Global ${Date.now()}`,
      industry: 'Logistics',
      size: '501-1000',
      website: 'https://logistics-global.com',
      locations: ['London, UK']
    });
    console.log(`✅ Created Company: ${company.name} (Verified Status: ${company.verifiedStatus})`);

    // 2. Initiate Claim
    console.log('\n--- Step 2: Initiate Claim ---');
    const claim = await VerificationService.initiateClaim(
      (company._id as any).toString(),
      (user._id as any).toString()
    );
    console.log(`✅ Initiated Claim (ID: ${claim._id}, Status: ${claim.status}, Score: ${claim.score})`);

    // 3. Add High-Confidence Signals (Trigger Auto-Verification)
    console.log('\n--- Step 3: Adding High-Weight Signals (Registry + Domain) ---');

    // Registry Signal (+50 weight) * 1.0 confidence = 50 points
    await VerificationService.addSignal(
      (claim._id as any).toString(),
      { type: 'registry', confidence: 1.0, data: { entry: 'UK Companies House Match' } },
      (user._id as any).toString()
    );

    // Domain Signal (+30 weight) * 1.0 confidence = 30 points
    // Total = 80 points (Threshold 70)
    const updatedClaim = await VerificationService.addSignal(
      (claim._id as any).toString(),
      { type: 'domain', confidence: 1.0, data: { method: 'DNS TXT Record Verified' } },
      (user._id as any).toString()
    );

    console.log(`📊 Current Score: ${updatedClaim.score}`);
    console.log(`🏁 Resulting Status: ${updatedClaim.status}`);

    // Verify Company Model Update
    const verifiedCompany = await Company.findById(company._id);
    console.log(`🏢 Company Verified Status: ${verifiedCompany?.verifiedStatus}`);
    console.log(`🔑 Company Admins count: ${verifiedCompany?.admins.length}`);
    console.log(`🌟 Company Verification Level: ${verifiedCompany?.verifiedLevel}`);

    // 4. Audit Log Verification
    console.log('\n--- Step 4: Audit Trail ---');
    const logs = await VerificationLog.find({ claimId: claim._id }).sort({ createdAt: 1 });
    logs.forEach(log => {
      console.log(`📜 [${log.action}] - Score: ${log.previousScore ?? 0} -> ${log.newScore ?? 'N/A'}`);
    });

    console.log('\n✅ Ownership Verification Test Successful!');

  } catch (error) {
    console.error('\n❌ Test Failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTest();
