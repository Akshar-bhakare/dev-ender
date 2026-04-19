import axios from 'axios';

/**
 * OnfidoService — Wrapper for International Identity & Business Verification.
 * blueprint:
 * support business registry lookup, director verification, document validation, fraud detection, ownership validation.
 */
export class OnfidoService {
  private static API_BASE = 'https://api.onfido.com/v3.4';
  private static API_KEY = process.env.ONFIDO_API_TOKEN;

  /**
   * Creates an Onfido Applicant (User or Company).
   */
  static async createApplicant(data: {
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    type: 'individual' | 'business';
  }): Promise<string> {
    if (!this.API_KEY) {
      console.warn('[ONFIDO STUB] Creating applicant for:', data.email);
      return `mock_app_${Math.random().toString(36).slice(2, 10)}`;
    }

    // Real API call (if key exists)
    const response = await axios.post(`${this.API_BASE}/applicants`, {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        address: { country: data.country }
    }, {
        headers: { Authorization: `Token token=${this.API_KEY}` }
    });

    return response.data.id;
  }

  /**
   * Generates a SDK token for frontend capture.
   */
  static async generateSdkToken(applicantId: string): Promise<string> {
    if (!this.API_KEY) {
      return `mock_sdk_token_${applicantId}`;
    }

    const response = await axios.post(`${this.API_BASE}/sdk_token`, {
        applicant_id: applicantId,
        referrer: process.env.FRONTEND_URL || 'http://localhost:3000/*'
    }, {
        headers: { Authorization: `Token token=${this.API_KEY}` }
    });

    return response.data.token;
  }

  /**
   * Submits a full verification check.
   * BLUEPRINT: registry_lookup, director_verification, document, fraud, ownership
   */
  static async submitCheck(applicantId: string, type: 'individual' | 'business'): Promise<string> {
    if (!this.API_KEY) {
      console.log('[ONFIDO STUB] Submitting check for:', applicantId);
      return `mock_check_${Math.random().toString(36).slice(2, 10)}`;
    }

    const reportNames = type === 'individual' 
      ? ['document', 'facial_similarity_video', 'known_fraud']
      : ['business_tax_id_check', 'business_registration_check', 'director_verification'];

    const response = await axios.post(`${this.API_BASE}/checks`, {
        applicant_id: applicantId,
        report_names: reportNames
    }, {
        headers: { Authorization: `Token token=${this.API_KEY}` }
    });

    return response.data.id;
  }

  /**
   * Processes Onfido Webhook results.
   */
  static processCheckResult(check: any) {
    const status = check.status;
    const result = check.result;
    
    // Logic to update user/company trustScore based on Onfido result
    if (status === 'complete' && result === 'clear') {
        return { success: true, basePoints: 60 };
    }
    return { success: false, basePoints: 0 };
  }
}
