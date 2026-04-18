import { IVerificationSignal } from '../../models/OwnershipClaim.js';

export interface SignalWeight {
  type: string;
  weight: number;
}

const DEFAULT_WEIGHTS: SignalWeight[] = [
  { type: 'registry', weight: 50 },
  { type: 'domain', weight: 30 },
  { type: 'document', weight: 30 },
  { type: 'email', weight: 10 },
  { type: 'social', weight: 10 },
];

export class ScoringEngine {
  /**
   * calculateScore
   * Final contribution = weight * confidence (0-1)
   * Score is capped at 100
   */
  static calculateScore(signals: IVerificationSignal[]): number {
    let totalScore = 0;

    signals.forEach(signal => {
      const config = DEFAULT_WEIGHTS.find(w => w.type === signal.type);
      if (config) {
        // contribution = weight * confidence
        // e.g., registry (+50) * 0.8 confidence = 40 points
        const contribution = config.weight * (signal.confidence || 0);
        totalScore += contribution;
      }
    });

    return Math.min(Math.round(totalScore), 100);
  }

  /**
   * getAutomatedStatus
   * SCORE >= 70: Auto Verified
   * 40-70: Manual Review
   * < 40: Rejected
   */
  static getDecision(score: number): 'verified' | 'under_review' | 'rejected' {
    if (score >= 70) return 'verified';
    if (score >= 40) return 'under_review';
    return 'rejected';
  }
}
