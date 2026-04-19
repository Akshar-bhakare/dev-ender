import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * hostEligibilityGuard — Decision engine for event hosting.
 * BLUEPRINT:
 * canHostEvent =
 *   company.status === "VERIFIED" &&
 *   representative.identityVerified === true &&
 *   company.trustScore >= 70
 */
export const hostEligibilityGuard = async (request: FastifyRequest, reply: FastifyReply) => {
  const company = (request as any).company;
  const user = (request as any).user;

  // 1. Check if logged in as company
  if (!company) {
    return reply.status(403).send({
      success: false,
      error: { code: 'NOT_A_COMPANY', message: 'Only verified companies can host professional events.' }
    });
  }

  // 2. Check Company Status
  const isVerified = company.verificationStatus === 'verified' || company.status === 'active'; 
  // Note: for hackathon, 'active' might be enough if status hasn't moved to 'VERIFIED' yet.
  
  if (company.verificationStatus !== 'verified') {
    return reply.status(403).send({
      success: false,
      error: { 
        code: 'COMPANY_NOT_VERIFIED', 
        message: 'Your company verification is still pending. Complete doc verification to host events.' 
      }
    });
  }

  // 3. Check Representative Identity
  if (!user || !user.identityVerified) {
    return reply.status(403).send({
      success: false,
      error: { 
        code: 'REP_NOT_VERIFIED', 
        message: 'As the company representative, you must verify your personal identity (Face + ID) before hosting.' 
      }
    });
  }

  // 4. Check Trust Score Threshold
  const THRESHOLD = 70;
  if (company.trustScore < THRESHOLD) {
    return reply.status(403).send({
      success: false,
      error: { 
        code: 'INSUFFICIENT_TRUST', 
        message: `Your company trust score (${company.trustScore}) is below the required threshold (${THRESHOLD}) for hosting.` 
      }
    });
  }
};
