import { OwnershipClaim, ClaimStatus, VerificationLog } from '../../models/index.js';
import { Company } from '../../models/Company.js';
import { ScoringEngine } from './scoring.engine.js';
import { Types } from 'mongoose';

export class VerificationService {
  /**
   * initiateClaim
   * Creates a new claim and triggers initial scoring.
   */
  static async initiateClaim(companyId: string, userId: string) {
    // Check if there's already an active claim for this company by this user
    const existing = await OwnershipClaim.findOne({ 
      companyId, 
      userId, 
      status: { $in: [ClaimStatus.PENDING, ClaimStatus.UNDER_REVIEW] } 
    });
    if (existing) throw new Error('You already have an active claim for this company.');

    // Check if company is already verified
    const company = await Company.findById(companyId);
    if (!company) throw new Error('Company not found');

    const claim = await OwnershipClaim.create({
      companyId,
      userId,
      status: ClaimStatus.PENDING,
      score: 0
    });

    await VerificationLog.create({
      claimId: (claim._id as any),
      action: 'CLAIM_INITIATED',
      metadata: { userId, companyId }
    });

    return claim;
  }

  /**
   * addSignal
   * Adds a verification signal (e.g., Domain check result) and recalculates score.
   */
  static async addSignal(claimId: string, signalData: any, performerId?: string) {
    const claim = await OwnershipClaim.findById(claimId);
    if (!claim) throw new Error('Claim not found');
    if (claim.status === ClaimStatus.VERIFIED || claim.status === ClaimStatus.REJECTED) {
      throw new Error('Claim is already finalized.');
    }

    const previousScore = claim.score;
    claim.signals.push(signalData);
    
    // Recalculate score
    const newScore = ScoringEngine.calculateScore(claim.signals);
    claim.score = newScore;

    // Automated Decision Engine
    // (We auto-verify or upgrade status if it was pending or already under automated review)
    if (claim.status === ClaimStatus.PENDING || claim.status === ClaimStatus.UNDER_REVIEW) {
      const decision = ScoringEngine.getDecision(newScore);
      if (decision === 'verified') {
        await this.finalizeVerification(claim, performerId);
      } else if (decision === 'rejected') {
        claim.status = ClaimStatus.REJECTED;
      } else if (decision === 'under_review') {
        claim.status = ClaimStatus.UNDER_REVIEW;
      }
    }

    await claim.save();

    await VerificationLog.create({
      claimId: (claim._id as any),
      action: 'SIGNAL_ADDED',
      previousScore,
      newScore,
      metadata: { signalType: signalData.type },
      performerId: performerId ? new Types.ObjectId(performerId) : undefined
    });

    return claim;
  }

  /**
   * finalizeVerification
   * Triggered by high score or admin approval.
   * Updates Company model and claim status.
   */
  static async finalizeVerification(claim: any, performerId?: string) {
    claim.status = ClaimStatus.VERIFIED;
    
    // Update Company Model
    const company = await Company.findById(claim.companyId);
    if (company) {
      company.verifiedStatus = true;
      // Grant ownership rights
      if (!company.admins.includes(claim.userId)) {
        company.admins.push(claim.userId);
      }
      // Increase level based on score
      company.verifiedLevel = Math.max(company.verifiedLevel || 0, Math.floor(claim.score / 20)); 
      await company.save();
    }

    await VerificationLog.create({
      claimId: claim._id,
      action: 'CLAIM_VERIFIED',
      newScore: claim.score,
      performerId: performerId ? new Types.ObjectId(performerId) : undefined
    });
  }

  /**
   * adminReview
   * Manual override by an admin.
   */
  static async adminReview(claimId: string, status: ClaimStatus, notes: string, adminId: string) {
    const claim = await OwnershipClaim.findById(claimId);
    if (!claim) throw new Error('Claim not found');

    const previousStatus = claim.status;
    claim.status = status;
    claim.adminNotes = notes;

    if (status === ClaimStatus.VERIFIED) {
      await this.finalizeVerification(claim, adminId);
    }

    await claim.save();

    await VerificationLog.create({
      claimId: (claim._id as any),
      action: 'ADMIN_REVIEW_DECISION',
      metadata: { previousStatus, newStatus: status, notes },
      performerId: new Types.ObjectId(adminId)
    });

    return claim;
  }
}
