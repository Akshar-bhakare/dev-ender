import { FastifyRequest, FastifyReply } from 'fastify';
import { User, IUser } from '../models/User.js';
import { Company } from '../models/Company.js';
import { AuditLog } from '../models/AuditLog.js';
import { OtpRecord } from '../models/OtpRecord.js';
import { hashPassword, comparePassword, generateToken, hashString } from '../utils/auth.utils.js';
import { OtpService } from '../services/otp.service.js';
import { TrustScoreService } from '../modules/trust/trust.service.js';
import { FaceService } from '../services/face.service.js';
import { OcrService } from '../services/ocr.service.js';
import { CloudinaryService } from '../services/cloudinary.service.js';
import { CompanyVerificationDoc } from '../models/CompanyVerificationDoc.js';
import { TrustScoreCalculator } from '../utils/trust-score-calculator.js';
import { OnfidoService } from '../services/onfido.service.js';

function cosineSimilarity(vecA: number[], vecB: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ==========================================
// SHARED
// ==========================================

export const checkType = async (request: FastifyRequest, reply: FastifyReply) => {
  const { accountType } = request.body as { accountType: string };
  if (accountType === 'company') {
    return reply.send({ steps: ['Basic Info', 'Verify OTP', 'Company Info', 'Detailed Info', 'Documents', 'Ownership'] });
  }
  return reply.send({ steps: ['Basic Info', 'Verify OTP', 'Professional Details', 'Face Verify', 'Document Verify', 'Complete'] });
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, password, accountType } = request.body as any;

  if (!email || !password || !accountType) {
    return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email, password, and accountType are required' } });
  }

  let user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    return reply.status(401).send({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    return reply.status(401).send({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } });
  }

  if (user.status === 'suspended') {
    return reply.status(403).send({ success: false, error: { code: 'ACCOUNT_SUSPENDED', message: 'Account is suspended' } });
  }

  // Issue tokens
  const token = generateToken({ id: user._id, accountType: 'user' });
  const refreshToken = generateToken({ id: user._id, accountType: 'user', refresh: true });

  user.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
  user.lastLoginAt = new Date();
  await user.save();

  await AuditLog.create({ userId: user._id, action: 'login', ip: request.ip, timestamp: new Date() });

  if (accountType === 'company') {
    const company = await Company.findOne({ ownerId: user._id });
    if (!company) {
      return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Company profile not found for this user' } });
    }
    
    const companyToken = generateToken({ id: company._id, accountType: 'company' });

    return reply.send({ success: true, token: companyToken, refreshToken, profile: company });
  }

  return reply.send({ success: true, token, refreshToken, profile: user });
};

export const refresh = async (request: FastifyRequest, reply: FastifyReply) => {
  return reply.send({ success: true, message: 'Refresh token rotated (stubbed)'});
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  const reqObj = request as any;
  const user = reqObj.user as IUser; 
  
  if (user && user.refreshTokens) {
    user.refreshTokens = [];
    await user.save();
  }

  return reply.send({ success: true, message: 'Logged out' });
};

export const forgotPassword = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email } = request.body as any;
  await OtpService.sendEmailOtp(email, 'password_reset');
  return reply.send({ success: true, message: 'OTP sent if email exists' });
};

export const resetPassword = async (request: FastifyRequest, reply: FastifyReply) => {
  const { email, otp, newPassword } = request.body as any;
  const isValid = await OtpService.verifyOtp(email, otp, 'password_reset');
  if (!isValid) {
    return reply.status(400).send({ success: false, error: { code: 'INVALID_OTP', message: 'Invalid or expired OTP' }});
  }

  const user = await User.findOne({ email });
  if (user) {
    user.passwordHash = await hashPassword(newPassword);
    await user.save();
  }
  return reply.send({ success: true, message: 'Password reset' });
};


// ==========================================
// USER SIGNUP FLOW
// ==========================================

export const userStep1 = async (request: FastifyRequest, reply: FastifyReply) => {
  const { fullName, email, password, phone, country } = request.body as any;

  if (await User.exists({ email })) return reply.status(400).send({ success: false, error: { code: 'EMAIL_ALREADY_EXISTS', message: 'Email exists' }});

  await OtpService.sendEmailOtp(email, 'email_verify');

  const passwordHash = await hashPassword(password);
  const signupSessionToken = generateToken({ pendingSignup: true, fullName, email, passwordHash, phone, country });
  return reply.send({ success: true, signupSessionToken, message: 'Step 1 complete. Check your email for OTP.' });
};

export const userStep2VerifyOtp = async (request: FastifyRequest, reply: FastifyReply) => {
  const { emailOtp } = request.body as any;
  const pending = (request as any).pendingSignup;

  const emailOk = await OtpService.verifyOtp(pending.email, emailOtp, 'email_verify');
  if (!emailOk) {
    return reply.status(400).send({ success: false, error: { code: 'INVALID_OTP', message: 'Invalid or expired OTP' }});
  }

  if (await User.exists({ email: pending.email })) {
    return reply.status(400).send({ success: false, error: { code: 'EMAIL_ALREADY_EXISTS', message: 'Email exists' }});
  }

  const user = await User.create({
    fullName: pending.fullName,
    email: pending.email,
    passwordHash: pending.passwordHash,
    phone: pending.phone,
    country: pending.country,
    role: 'professional',
    status: 'onboarding',
    signupStep: 2,
    emailVerified: true,
  });

  try {
    const names = pending.fullName.split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || 'User';
    
    const applicantId = await OnfidoService.createApplicant({
      firstName, lastName, email: pending.email, country: pending.country || 'US', type: 'individual'
    });
    user.onfidoApplicantId = applicantId;
    user.verificationProvider = 'onfido';
    const sdkToken = await OnfidoService.generateSdkToken(applicantId);
    user.onfidoSdkToken = sdkToken;
    await user.save();
  } catch (err) {
    console.error('Onfido Init Failed:', err);
  }

  await TrustScoreService.addPoints({ userId: user._id.toString(), delta: 5, reason: 'Email verified' });
  await AuditLog.create({ userId: user._id, action: 'signup_step_2', ip: request.ip });

  const token = generateToken({ id: user._id, accountType: 'user' });
  return reply.send({ 
    success: true, 
    signupSessionToken: token, 
    onfidoSdkToken: user.onfidoSdkToken,
    message: 'Step 2 complete' 
  });
};

export const userStep3ProfessionalDetails = async (request: FastifyRequest, reply: FastifyReply) => {
  const { jobTitle, industry, totalYearsExperience, currentCompany, linkedInUrl, bio } = request.body as any;
  if (!jobTitle || !industry) {
    return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'jobTitle and industry are required' } });
  }
  return reply.send({ success: true, message: 'Step 3 validated' });
};

export const userStep4FaceVerify = async (request: FastifyRequest, reply: FastifyReply) => {
  const { faceImageBase64 } = request.body as any;
  const { descriptor, confidence } = await FaceService.processFaceImage(faceImageBase64);

  if (confidence < 0.85) {
    return reply.status(400).send({ success: false, error: { code: 'LOW_FACE_CONFIDENCE', message: 'Face not clear' } });
  }

  const isDuplicate = await FaceService.findDuplicateFace(descriptor);
  if (isDuplicate) {
    return reply.status(400).send({ success: false, error: { code: 'DUPLICATE_FACE_DETECTED', message: 'Duplicate face' } });
  }

  return reply.send({ success: true, descriptor, faceImageBase64, message: 'Step 4 validated' });
};

export const userStep5DocumentVerify = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user as IUser;
  const { documentType, documentImageBase64 } = request.body as any;

  if (!documentType || !documentImageBase64) {
    return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Document type and image are required' } });
  }

  try {
    console.log(`[OCR Verification] Processing ${documentType} for user ${user._id}`);
    
    // Perform OCR extraction
    const extracted = await OcrService.processIdentityDocument(documentImageBase64, documentType);

    if (!extracted.docNumber && !extracted.fullName) {
      return reply.status(400).send({ 
        success: false, 
        error: { 
          code: 'OCR_FAILED', 
          message: 'Could not detect document info. Please ensure the image is clear and try again.' 
        } 
      });
    }

    // Basic heuristic validation: check if the extracted country matches the user's country
    if (extracted.country && extracted.country !== 'unknown' && user.country) {
       // Optional: Log mismatch but don't block for now to keep it "easy"
       console.log(`[OCR] Country detected: ${extracted.country}, User country: ${user.country}`);
    }

    // Save extracted info
    user.documentType = documentType;
    user.documentNumber = extracted.docNumber || 'NOT_FOUND';
    user.verificationStatus = 'verified'; // Mark as verified since OCR succeeded
    user.verificationProvider = 'internal_ocr';
    
    // Upload image to Cloudinary for record keeping
    const docUrl = await CloudinaryService.uploadImage(documentImageBase64, 'syncup/identity-docs');
    user.documentFrontUrl = docUrl;

    await user.save();

    await TrustScoreService.addPoints({ 
      userId: user._id.toString(), 
      delta: 20, 
      reason: 'Identity document verified via OCR' 
    });

    return reply.send({ 
      success: true, 
      message: 'Document verified successfully via OCR.',
      extracted: {
        docNumber: extracted.docNumber,
        fullName: extracted.fullName,
        country: extracted.country
      }
    });

  } catch (err: any) {
    console.error('[OCR] Verification Error:', err.message);
    return reply.status(500).send({ 
      success: false, 
      error: { code: 'OCR_VERIFICATION_FAILED', message: 'Internal verification failed' } 
    });
  }
};

export const userComplete = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const {
    jobTitle, industry, totalYearsExperience, currentCompany, linkedInUrl, bio,
    faceImageBase64, faceDescriptor,
    documentType, documentImageBase64,
  } = request.body as any;

  user.jobTitle = jobTitle;
  user.industry = industry;
  user.totalExperienceMonths = (totalYearsExperience || 0) * 12;
  user.currentCompany = currentCompany;
  if (linkedInUrl) { user.linkedInUrl = linkedInUrl; user.linkedInConnected = true; }
  user.bio = bio;

  const faceUrl = await CloudinaryService.uploadImage(faceImageBase64, 'syncup/face-snapshots');
  user.faceSnapshotUrl = faceUrl;
  user.faceDescriptor = faceDescriptor;
  user.faceVerified = true;

  console.log(`[OCR] Processing ${documentType} for user ${user._id}`);
  const extracted = await OcrService.processIdentityDocument(documentImageBase64, documentType);
  
  if (extracted.docNumber) {
    const duplicate = await User.findOne({ 
      detectedDocNumber: extracted.docNumber, 
      _id: { $ne: user._id },
      status: { $ne: 'deleted' }
    });
    
    if (duplicate) {
      console.warn(`[OCR] Duplicate ID detected: ${extracted.docNumber} for user ${user._id}`);
      return reply.status(400).send({ 
        success: false, 
        error: { 
          code: 'DUPLICATE_IDENTITY', 
          message: 'This identity document is already associated with another account.' 
        } 
      });
    }
    user.detectedDocNumber = extracted.docNumber;
  }

  if (extracted.fullName) user.detectedName = extracted.fullName;
  if (extracted.dob) user.detectedDOB = extracted.dob;
  if (extracted.country) user.detectedCountry = extracted.country;
  user.documentOcrRaw = extracted.rawText;

  const docUrl = await CloudinaryService.uploadImage(documentImageBase64, 'syncup/documents');
  user.documentType = documentType;
  user.documentFrontUrl = docUrl;
  user.documentVerificationStatus = 'pending';

  user.status = 'active';
  user.signupStep = 5;

  if (user.onfidoApplicantId) {
    try {
        const checkId = await OnfidoService.submitCheck(user.onfidoApplicantId, 'individual');
        user.onfidoCheckId = checkId;
    } catch (err) {
        console.error('Onfido Check Submission Failed:', err);
    }
  }

  const badges: string[] = [];
  if (user.faceVerified && user.documentVerificationStatus !== 'not_uploaded') badges.push('identity_verified');
  if (user.linkedInConnected) badges.push('linkedin_connected');
  user.badges = badges;

  await user.save();

  await TrustScoreService.addPoints({ userId: user._id.toString(), delta: 40, reason: 'Face verified' });
  await TrustScoreService.addPoints({ userId: user._id.toString(), delta: 25, reason: 'Document uploaded' });
  if (user.linkedInConnected) await TrustScoreService.addPoints({ userId: user._id.toString(), delta: 10, reason: 'LinkedIn connected' });

  const token = generateToken({ id: user._id, accountType: 'user' });
  const refreshToken = generateToken({ id: user._id, accountType: 'user', refresh: true });
  user.refreshTokens.push({ token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
  await user.save();

  return reply.send({ success: true, token, refreshToken, profile: user });
};


// ==========================================
// COMPANY SIGNUP FLOW
// ==========================================

export const companyStep1 = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { repFullName, legalName, email, password, phone, country } = request.body as any;

    console.log('[Signup] Company Step 1 Request:', { repFullName, legalName, email, phone, country });

    if (!repFullName || !email || !password || !legalName) {
      return reply.status(400).send({ 
        success: false, 
        error: { code: 'VALIDATION_ERROR', message: 'Full Name, Email, Password, and Legal Name are required' } 
      });
    }

    // 1. Check if user already exists
    if (await User.exists({ email })) {
      return reply.status(400).send({ success: false, error: { code: 'EMAIL_ALREADY_EXISTS', message: 'An account with this email already exists' }});
    }

    // 2. Check if company already exists
    if (await Company.exists({ legalName })) {
      return reply.status(400).send({ success: false, error: { code: 'COMPANY_ALREADY_EXISTS', message: 'A company with this legal name already exists' }});
    }
    
    const passwordHash = await hashPassword(password);
    
    // 3. Create User
    const user = await User.create({
      fullName: repFullName, 
      email, 
      passwordHash, 
      phone, 
      country, 
      role: 'company_owner', 
      status: 'onboarding'
    });

    // 4. Create Company
    const company = await Company.create({
      ownerId: user._id,
      legalName: legalName,
      displayName: repFullName,
      name: legalName, // Legacy support field
      status: 'onboarding',
      signupStep: 1
    });

    await OtpService.sendEmailOtp(email, 'email_verify');

    const signupSessionToken = generateToken({ id: company._id, accountType: 'company' });
    return reply.send({ success: true, signupSessionToken, message: 'Company Step 1 complete' });
  } catch (error: any) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return reply.status(400).send({ 
        success: false, 
        error: { 
          code: 'DUPLICATE_ERROR', 
          message: `This ${field} is already in use. Please use a different one.` 
        } 
      });
    }
    console.error('Company Step 1 Error:', error);
    return reply.status(500).send({ 
      success: false, 
      error: { 
        code: 'INTERNAL_ERROR', 
        message: error.message || 'An unexpected error occurred during registration' 
      } 
    });
  }
};

export const companyStep2VerifyOtp = async (request: FastifyRequest, reply: FastifyReply) => {
  const { emailOtp } = request.body as any;
  const company = (request as any).company;
  const user = await User.findById(company.ownerId);

  const emailOk = await OtpService.verifyOtp(user!.email, emailOtp, 'email_verify');

  if (!emailOk) {
    return reply.status(400).send({ success: false, error: { code: 'INVALID_OTP', message: 'Invalid or expired OTP' }});
  }

  user!.emailVerified = true;
  await user!.save();

  company.signupStep = 2;
  
  try {
    const names = user!.fullName.split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ') || 'User';
    
    const applicantId = await OnfidoService.createApplicant({
      firstName, lastName, email: user!.email, country: user!.country || 'US', type: 'individual'
    });
    user!.onfidoApplicantId = applicantId;
    await user!.save();
    
    const companyApplicantId = await OnfidoService.createApplicant({
       firstName: company.legalName, lastName: 'Company', email: user!.email, country: user!.country || 'US', type: 'business'
    });
    company.onfidoApplicantId = companyApplicantId;
    const sdkToken = await OnfidoService.generateSdkToken(companyApplicantId);
    company.onfidoSdkToken = sdkToken;
  } catch (err) {
    console.error('Onfido Company Init Failed:', err);
  }

  await company.save();

  await TrustScoreService.addPoints({ companyId: company._id.toString(), delta: 5, reason: 'Email verified' });

  return reply.send({ 
    success: true, 
    onfidoSdkToken: company.onfidoSdkToken,
    message: 'Company Step 2 complete' 
  });
};

export const onfidoWebhook = async (request: FastifyRequest, reply: FastifyReply) => {
    const { action, resource } = request.body as any;
    
    if (action === 'check.completed') {
        const check = resource;
        const applicantId = check.applicant_id;
        
        const user = await User.findOne({ onfidoApplicantId: applicantId });
        const company = await Company.findOne({ onfidoApplicantId: applicantId });
        
        if (user) {
            const res = OnfidoService.processCheckResult(check);
            if (res.success) {
                user.identityVerified = true;
                user.documentVerificationStatus = 'verified';
                await user.save();
                await TrustScoreService.addPoints({ userId: user._id.toString(), delta: res.basePoints, reason: 'Onfido check clear' });
            }
        }

        if (company) {
             const res = OnfidoService.processCheckResult(check);
             if (res.success) {
                 company.verificationStatus = 'verified';
                 await company.save();
                 await TrustScoreService.addPoints({ companyId: company._id.toString(), delta: res.basePoints, reason: 'Onfido business check clear' });
             }
        }
    }

    return reply.status(200).send({ received: true });
};

export const companyStep3BasicInfo = async (request: FastifyRequest, reply: FastifyReply) => {
  const { displayName, websiteUrl, linkedInUrl, customSlug } = request.body as any;
  const company = (request as any).company;
  const user = await User.findById(company.ownerId);

  company.displayName = displayName || company.displayName;
  company.website = websiteUrl;
  company.customSlug = customSlug;
  if (linkedInUrl) {
    company.socialLinks = { ...company.socialLinks, linkedin: linkedInUrl };
  }
  company.signupStep = 3;

  if (websiteUrl && user!.email) {
    try {
      const emailDomain = user!.email.split('@')[1];
      const webDomain = new URL(websiteUrl).hostname.replace('www.', '');
      if (emailDomain === webDomain) {
        company.domainEmailVerified = true;
      }
    } catch (e) { }
  }

  await company.save();
  if (company.domainEmailVerified) {
    await TrustScoreService.addPoints({ companyId: company._id.toString(), delta: 30, reason: 'Domain matched email' });
  }

  return reply.send({ success: true, message: 'Company Step 3 (Branding) complete' });
};

export const companyStep4DetailedInfo = async (request: FastifyRequest, reply: FastifyReply) => {
  const { industry, size, yearFounded } = request.body as any;
  const company = (request as any).company;

  company.industry = industry;
  company.size = size;
  company.yearEstablished = yearFounded;
  company.signupStep = 4;
  
  await company.save();

  await TrustScoreService.addPoints({ companyId: company._id.toString(), delta: 10, reason: 'Industry & Size provided' });
  return reply.send({ success: true, message: 'Company Step 4 (Industry) complete' });
};

export const companyStep5Identity = async (request: FastifyRequest, reply: FastifyReply) => {
    const { faceImageBase64 } = request.body as any;
    const company = (request as any).company;

    if (faceImageBase64) {
        company.representativeFaceVerified = true;
    }
    
    company.signupStep = 5;
    await company.save();

    await TrustScoreService.addPoints({ companyId: company._id.toString(), delta: 15, reason: 'Representative Identity Verified' });
    return reply.send({ success: true, message: 'Representative identity verified' });
};

export const companyStep5Documents = async (request: FastifyRequest, reply: FastifyReply) => {
  const { docType, documentImageBase64 } = request.body as { docType: string, documentImageBase64: string };
  const company = (request as any).company;

  if (!docType || !documentImageBase64) {
    return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Document type and image are required' } });
  }

  try {
    console.log(`[OCR] Staged processing ${docType} for company ${company._id}`);
    const extracted = await OcrService.processCompanyDocument(documentImageBase64, docType);
    
    if (extracted.registrationNumber) {
        const duplicate = await Company.findOne({ detectedRegistrationNumber: extracted.registrationNumber, _id: { $ne: company._id } });
        if (duplicate) return reply.status(400).send({ success: false, error: { code: 'DUPLICATE_COMPANY', message: 'This registration is already on file.' } });
    }

    const docUrl = await CloudinaryService.uploadImage(documentImageBase64, `syncup/company-docs/${company._id}`);

    const verifDoc = await CompanyVerificationDoc.create({
      companyId: company._id,
      docType,
      fileUrl: docUrl,
      extractedText: extracted.rawText,
      extractedFields: {
        registrationNumber: extracted.registrationNumber,
        gstin: extracted.gstin,
        pan: extracted.pan,
        legalName: extracted.legalName,
        address: extracted.address,
        dateOfIncorporation: extracted.dateOfIncorporation
      },
      verificationStatus: 'pending'
    });

    let mismatch = false;
    if (extracted.legalName && !extracted.legalName.toUpperCase().includes(company.legalName.toUpperCase())) {
      verifDoc.mismatchFound = true;
      verifDoc.mismatchDetails = `Name on doc (${extracted.legalName}) does not match registered name (${company.legalName})`;
      mismatch = true;
    }

    await verifDoc.save();

    if (docType === 'incorporation_cert' && extracted.registrationNumber) {
        company.detectedRegistrationNumber = extracted.registrationNumber;
        company.certificateVerified = !mismatch;
    }
    if (docType === 'gst_cert' && extracted.gstin) {
        company.gstNumber = extracted.gstin;
        company.gstVerified = !mismatch;
    }
    if (extracted.address) {
        company.detectedAddress = extracted.address;
        company.addressMatched = true;
    }

    company.documentUploaded = true;
    await company.save();

    return reply.send({ 
      success: true, 
      message: `${docType} processed`,
      extracted: {
        legalName: extracted.legalName,
        docNumber: extracted.registrationNumber || extracted.gstin || extracted.pan,
        mismatch
      }
    });

  } catch (err: any) {
    return reply.status(500).send({ success: false, error: { code: 'OCR_ERROR', message: err.message } });
  }
};

export const companyStep6Ownership = async (request: FastifyRequest, reply: FastifyReply) => {
  const { representativeRole, ownershipPercentage, founderStatement, linkedInUrl } = request.body as any;
  const company = (request as any).company;

  company.representativeRole = representativeRole;
  company.ownershipPercentage = ownershipPercentage;
  company.founderStatement = founderStatement;
  
  if (representativeRole === 'founder' || representativeRole === 'co_founder') {
    company.founderVerified = 'pending_review';
  }

  const representative = await User.findById(company.ownerId);
  company.trustScore = TrustScoreCalculator.calculate(company, representative);
  company.trustLevel = TrustScoreCalculator.getLevel(company.trustScore);
  company.permissionTier = TrustScoreCalculator.getTier(company.trustScore);

  company.status = 'active';
  if (company.trustScore >= 70) {
      company.verificationStatus = 'verified';
  }
  
  const badges = [];
  if (company.domainEmailVerified) badges.push('domain_verified');
  if (company.gstVerified) badges.push('gst_verified');
  if (company.certificateVerified) badges.push('incorporation_verified');
  if (company.trustScore >= 85) badges.push('premium_member');
  
  company.badges = badges;

  if (company.onfidoApplicantId) {
    try {
        const checkId = await OnfidoService.submitCheck(company.onfidoApplicantId, 'business');
        company.onfidoCheckId = checkId;
    } catch (err) {
        console.error('Onfido Company Check Failed:', err);
    }
  }

  await company.save();

  const user = await User.findById(company.ownerId);
  if (linkedInUrl && user) {
    user.linkedInUrl = linkedInUrl;
    user.linkedInConnected = true;
    await user.save();
    await TrustScoreService.addPoints({ companyId: company._id.toString(), delta: 15, reason: 'LinkedIn added for owner' });
  }
  
  if (user) {
      user.status = 'active';
      await user.save();
  }

  const token = generateToken({ id: company._id, accountType: 'company' });
  const refreshToken = generateToken({ id: company._id, accountType: 'company', refresh: true });

  return reply.send({ success: true, token, refreshToken, profile: company });
};

export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
    const accountType = (request as any).accountType;
    let profile = null;
    
    if (accountType === 'company') {
        profile = (request as any).company;
    } else {
        profile = (request as any).user;
    }

    return reply.send({
      success: true,
      accountType: accountType,
      user: profile
    });
};

// ==========================================
// SAHIL'S BACKWARD COMPATIBILITY / PROFILE VERIFICATION
// ==========================================

export const verifyFace = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = (request as any).user;
    if (!user) return reply.status(404).send({ message: 'User not found' });

    user.faceVerified = true;
    await user.save();

    return reply.send({ faceVerified: true });
  } catch (error: any) {
    return reply.status(500).send({ message: 'Error processing face verification' });
  }
};

export const verifyDoc = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = (request as any).user;
    if (!user) return reply.status(404).send({ message: 'User not found' });

    const parts = request.parts();
    let nationality, docType;
    for await (const part of parts) {
      if (part.type !== 'file') {
        if (part.fieldname === 'nationality') nationality = part.value as string;
        if (part.fieldname === 'docType') docType = part.value as string;
      }
    }

    user.kycStatus = 'verified';
    user.kycVerifiedAt = new Date();
    user.docData = {
      name: user.fullName || user.name,
      dob: '',
      docNumber: hashString(`${user._id}-${docType}-${Date.now()}`),
      expiry: '',
      nationality: nationality || 'Unknown',
      docType: docType || 'Unknown'
    };

    await user.save();
    return reply.send({ verified: true, kycStatus: user.kycStatus });
  } catch (error: any) {
    return reply.status(500).send({ message: 'Error processing document verification' });
  }
};
