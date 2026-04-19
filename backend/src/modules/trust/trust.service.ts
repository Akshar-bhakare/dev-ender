import { Error } from 'mongoose';
import { User, IUser, PermissionTier, TrustLevel } from '../../models/User.js';
import { Company, ICompany } from '../../models/Company.js';
import { AuditLog } from '../../models/AuditLog.js';

export class TrustScoreService {
  /**
   * Calculates the new trust level and permission tier based on a trust score.
   * Returns { level, tier }
   */
  static getTrustRankings(score: number, isCompany: boolean = false): { level: TrustLevel; tier: PermissionTier } {
    let level: TrustLevel = 'low';
    let tier: PermissionTier = 1;

    if (isCompany) {
      if (score >= 85) { level = 'premium'; tier = 4; }
      else if (score >= 70) { level = 'high'; tier = 3; }
      else if (score >= 40) { level = 'medium'; tier = 2; }
      else { level = 'low'; tier = 1; }
    } else {
      // User levels
      if (score >= 85) { level = 'premium'; tier = 4; }
      else if (score >= 60) { level = 'high'; tier = 3; }
      else if (score >= 30) { level = 'medium'; tier = 2; }
      else { level = 'low'; tier = 1; }
    }

    return { level, tier };
  }

  /**
   * Adds or deducts points from a given user or company.
   */
  static async addPoints(params: {
    userId?: string;
    companyId?: string;
    delta: number;
    reason: string;
    ip?: string;
    userAgent?: string;
  }) {
    if (!params.userId && !params.companyId) {
      throw new Error('Must provide userId or companyId');
    }

    let targetDoc: IUser | ICompany | null = null;
    let isCompany = false;

    if (params.userId) {
      targetDoc = await User.findById(params.userId);
    } else if (params.companyId) {
      targetDoc = await Company.findById(params.companyId);
      isCompany = true;
    }

    if (!targetDoc) {
      throw new Error('Target document not found');
    }

    const oldScore = targetDoc.trustScore || 0;
    // Clamp score between 0 and 100
    let newScore = Math.max(0, Math.min(100, oldScore + params.delta));

    // Calculate new rankings
    const { level, tier } = this.getTrustRankings(newScore, isCompany);

    targetDoc.trustScore = newScore;
    targetDoc.trustLevel = level;
    targetDoc.permissionTier = tier;
    
    if (!isCompany) {
       // if user hits score >= 60, mark as verified globally
       if (newScore >= 60) {
           (targetDoc as IUser).isVerified = true;
       } else {
           (targetDoc as IUser).isVerified = false;
       }
    }

    await targetDoc.save();

    // Log the action
    await AuditLog.create({
      userId: targetDoc._id,
      action: 'trust_score_update',
      ip: params.ip,
      userAgent: params.userAgent,
      metadata: { delta: params.delta, reason: params.reason, oldScore, newScore }
    });

    return { newScore, level, tier };
  }
}
