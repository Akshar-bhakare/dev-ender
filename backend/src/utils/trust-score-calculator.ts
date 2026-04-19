import { ICompany } from '../models/Company.js';

export class TrustScoreCalculator {
  /**
   * Calculates a company's trust score based on individual verification signals.
   * blueprint:
   * domainVerified = +25
   * representativeVerified = +20
   * certificateVerified = +25
   * GSTVerified = +20
   * addressMatched = +10
   * linkedinMatched = +5
   */
  static calculate(company: any, representative: any): number {
    let score = 0;

    if (company.domainEmailVerified) score += 25;
    if (representative && representative.identityVerified) score += 20;
    if (company.certificateVerified) score += 25;
    if (company.gstVerified) score += 20;
    if (company.addressMatched) score += 10;
    if (company.socialLinks?.linkedin) score += 5;

    // Optional Domain Reputation (+5)
    if (company.domainAgeVerified) score += 5;

    // Mismatch Penalties
    if (company.verificationFlags && company.verificationFlags.includes('NAME_MISMATCH')) {
      score -= 40;
    }
    if (company.verificationFlags && company.verificationFlags.includes('DOMAIN_MISMATCH')) {
      score -= 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  static getLevel(score: number): 'low' | 'medium' | 'high' | 'premium' {
    if (score >= 90) return 'premium';
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  static getTier(score: number): 1 | 2 | 3 | 4 {
    if (score >= 90) return 4;
    if (score >= 70) return 3;
    if (score >= 40) return 2;
    return 1;
  }
}
