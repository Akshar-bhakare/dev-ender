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
  // Stub for now. Ideally decode refresh token, find user, check user.refreshTokens array, remove old, issue new.
  return reply.send({ success: true, message: 'Refresh token rotated (stubbed)'});
};

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  const reqObj = request as any;
  const user = reqObj.user as IUser; // Could also be company
  
  // Clear refresh tokens
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
  const { fullName, email, password, phone } = request.body as any;

  if (await User.exists({ email })) return reply.status(400).send({ success: false, error: { code: 'EMAIL_ALREADY_EXISTS', message: 'Email exists' }});

  // Send OTP before saving anything to DB
  await OtpService.sendEmailOtp(email, 'email_verify');

  // Store signup data in JWT — user is NOT saved to DB yet
  const passwordHash = await hashPassword(password);
  const signupSessionToken = generateToken({ pendingSignup: true, fullName, email, passwordHash, phone });
  return reply.send({ success: true, signupSessionToken, message: 'Step 1 complete. Check your email for OTP.' });
};

export const userStep2VerifyOtp = async (request: FastifyRequest, reply: FastifyReply) => {
  const { emailOtp } = request.body as any;
  const pending = (request as any).pendingSignup;

  const emailOk = await OtpService.verifyOtp(pending.email, emailOtp, 'email_verify');
  if (!emailOk) {
    return reply.status(400).send({ success: false, error: { code: 'INVALID_OTP', message: 'Invalid or expired OTP' }});
  }

  // OTP verified — now create the user
  if (await User.exists({ email: pending.email })) {
    return reply.status(400).send({ success: false, error: { code: 'EMAIL_ALREADY_EXISTS', message: 'Email exists' }});
  }

  const user = await User.create({
    fullName: pending.fullName,
    email: pending.email,
    passwordHash: pending.passwordHash,
    phone: pending.phone,
    role: 'professional',
    status: 'onboarding',
    signupStep: 2,
    emailVerified: true,
  });

  await TrustScoreService.addPoints({ userId: user._id.toString(), delta: 5, reason: 'Email verified' });
  await AuditLog.create({ userId: user._id, action: 'signup_step_2', ip: request.ip });

  // Issue a real session token now that user exists in DB
  const token = generateToken({ id: user._id, accountType: 'user' });
  return reply.send({ success: true, signupSessionToken: token, message: 'Step 2 complete' });
};

export const userStep3ProfessionalDetails = async (request: FastifyRequest, reply: FastifyReply) => {
  // Validation only — no DB write. Frontend buffers this and sends it at completion.
  const { jobTitle, industry, totalYearsExperience, currentCompany, linkedInUrl, bio } = request.body as any;
  if (!jobTitle || !industry) {
    return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'jobTitle and industry are required' } });
  }
  return reply.send({ success: true, message: 'Step 3 validated' });
};

export const userStep4FaceVerify = async (request: FastifyRequest, reply: FastifyReply) => {
  // Validation only — no DB write. Returns descriptor for frontend to buffer.
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
  // Validation only — no DB write. Frontend buffers and sends at completion.
  const { documentType, documentImageBase64 } = request.body as any;
  if (!documentType || !documentImageBase64) {
    return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Document required' } });
  }
  return reply.send({ success: true, message: 'Step 5 validated' });
};

export const userComplete = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const {
    // Step 3
    jobTitle, industry, totalYearsExperience, currentCompany, linkedInUrl, bio,
    // Step 4
    faceImageBase64, faceDescriptor,
    // Step 5
    documentType, documentImageBase64,
  } = request.body as any;

  // Apply professional details
  user.jobTitle = jobTitle;
  user.industry = industry;
  user.totalExperienceMonths = (totalYearsExperience || 0) * 12;
  user.currentCompany = currentCompany;
  if (linkedInUrl) { user.linkedInUrl = linkedInUrl; user.linkedInConnected = true; }
  user.bio = bio;

  // Apply face
  const faceUrl = await CloudinaryService.uploadImage(faceImageBase64, 'syncup/face-snapshots');
  user.faceSnapshotUrl = faceUrl;
  user.faceDescriptor = faceDescriptor;
  user.faceVerified = true;

  // Apply document
  const docUrl = await CloudinaryService.uploadImage(documentImageBase64, 'syncup/documents');
  const country = await OcrService.extractCountryFromImage(documentImageBase64);
  user.documentType = documentType;
  user.documentFrontUrl = docUrl;
  user.detectedCountry = country;
  user.documentVerificationStatus = 'pending';

  // Activate
  user.status = 'active';
  user.signupStep = 5;

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
  const { repFullName, email, password, phone } = request.body as any;

  if (await User.exists({ email })) return reply.status(400).send({ success: false, error: { code: 'EMAIL_ALREADY_EXISTS', message: 'Email exists' }});
  
  const passwordHash = await hashPassword(password);
  
  const user = await User.create({
    fullName: repFullName, email, passwordHash, phone, role: 'company_owner', status: 'onboarding'
  });

  const company = await Company.create({
    ownerId: user._id,
    legalName: `Draft_Company_${user._id}`, // temporary name until step 3
    displayName: repFullName,
    status: 'onboarding',
    signupStep: 1
  });

  await OtpService.sendEmailOtp(email, 'email_verify');
  // await OtpService.sendPhoneOtp(phone, 'phone_verify');

  const signupSessionToken = generateToken({ id: company._id, accountType: 'company' });
  return reply.send({ success: true, signupSessionToken, message: 'Company Step 1 complete' });
};

export const companyStep2VerifyOtp = async (request: FastifyRequest, reply: FastifyReply) => {
  const { emailOtp, phoneOtp } = request.body as any;
  const company = (request as any).company;
  const user = await User.findById(company.ownerId);

  const emailOk = await OtpService.verifyOtp(user!.email, emailOtp, 'email_verify');
  // const phoneOk = await OtpService.verifyOtp(user!.phone!, phoneOtp, 'phone_verify');

  if (!emailOk) {
    return reply.status(400).send({ success: false, error: { code: 'INVALID_OTP', message: 'Invalid or expired OTP' }});
  }

  user!.emailVerified = true;
  // user!.phoneVerified = true;
  await user!.save();

  company.signupStep = 2;
  await company.save();

  await TrustScoreService.addPoints({ companyId: company._id.toString(), delta: 5, reason: 'Email verified' });
  await TrustScoreService.addPoints({ companyId: company._id.toString(), delta: 10, reason: 'Phone verified' });

  return reply.send({ success: true, message: 'Company Step 2 complete' });
};

export const companyStep3BasicInfo = async (request: FastifyRequest, reply: FastifyReply) => {
  const { legalName, displayName, type, industry, size, yearEstablished, website, description, country, state, city } = request.body as any;
  const company = (request as any).company;
  const user = await User.findById(company.ownerId);

  const existingCompany = await Company.findOne({ legalName: { $regex: new RegExp(`^${legalName}$`, 'i') }, _id: { $ne: company._id } });
  if (existingCompany) {
    await TrustScoreService.addPoints({ companyId: company._id.toString(), delta: -40, reason: 'Duplicate company name' });
    company.flagForManualReview = true;
    company.flagReason = 'Duplicate company name';
    await company.save();
    return reply.status(400).send({ success: false, error: { code: 'DUPLICATE_COMPANY_DETECTED', message: 'Company name matches existing record' }});
  }

  company.legalName = legalName;
  company.displayName = displayName;
  company.type = type;
  company.industry = industry;
  company.size = size;
  company.yearEstablished = yearEstablished;
  company.website = website;
  company.description = description;
  company.registeredCountry = country;
  company.registeredState = state;
  company.registeredCity = city;
  company.signupStep = 3;

  // basic domain verification
  if (website && user!.email) {
    try {
      const emailDomain = user!.email.split('@')[1];
      const webDomain = new URL(website).hostname.replace('www.', '');
      if (emailDomain === webDomain) {
        company.domainEmailVerified = true;
      }
    } catch (e) {
      // Ignored
    }
  }

  await company.save();

  if (company.domainEmailVerified) {
    await TrustScoreService.addPoints({ companyId: company._id.toString(), delta: 30, reason: 'Domain matched email' });
  }

  return reply.send({ success: true, message: 'Company Step 3 complete' });
};

export const companyStep4DetailedInfo = async (request: FastifyRequest, reply: FastifyReply) => {
  const { registrationNumber, gstNumber, taxId, panNumber, address, logoUrl, googleMapsUrl, socialLinks } = request.body as any;
  const company = (request as any).company;

  company.registrationNumber = registrationNumber;
  company.gstNumber = gstNumber;
  company.taxId = taxId;
  company.panNumber = panNumber;
  company.address = address;
  company.logoUrl = logoUrl;
  company.googleMapsUrl = googleMapsUrl;
  if(socialLinks) company.socialLinks = socialLinks;
  company.signupStep = 4;
  
  await company.save();

  if (registrationNumber) await TrustScoreService.addPoints({ companyId: company._id.toString(), delta: 25, reason: 'Registration Number' });
  if (gstNumber || taxId) await TrustScoreService.addPoints({ companyId: company._id.toString(), delta: 20, reason: 'GST/Tax ID' });
  if (googleMapsUrl) await TrustScoreService.addPoints({ companyId: company._id.toString(), delta: 10, reason: 'Google Maps url' });

  return reply.send({ success: true, message: 'Company Step 4 complete' });
};

export const companyStep5Documents = async (request: FastifyRequest, reply: FastifyReply) => {
  const { registrationCertificateBase64, gstCertificateBase64, representativeIdBase64 } = request.body as any;
  const company = (request as any).company;

  if (registrationCertificateBase64) {
    company.registrationCertificateUrl = await CloudinaryService.uploadImage(registrationCertificateBase64, 'syncup/company-docs');
  }
  if (gstCertificateBase64) {
    company.gstCertificateUrl = await CloudinaryService.uploadImage(gstCertificateBase64, 'syncup/company-docs');
  }
  if (representativeIdBase64) {
    company.representativeIdUrl = await CloudinaryService.uploadImage(representativeIdBase64, 'syncup/rep-docs');
  }

  company.documentUploaded = true;
  company.documentVerificationStatus = 'pending';
  company.signupStep = 5;
  await company.save();

  if (company.registrationCertificateUrl) {
    await TrustScoreService.addPoints({ companyId: company._id.toString(), delta: 25, reason: 'Uploaded CoI' });
  }

  return reply.send({ success: true, message: 'Company Step 5 complete' });
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

  company.status = 'active';
  
  // Set badges based on milestones
  const badges = [];
  if (company.founderVerified === 'verified') badges.push('verified_founder');
  if (company.trustScore >= 85) badges.push('premium_member');
  if (company.verificationStatus === 'verified') badges.push('company_verified');
  company.badges = badges;

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
