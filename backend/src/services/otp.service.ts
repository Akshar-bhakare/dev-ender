import { OtpRecord, OtpType } from '../models/OtpRecord.js';
import { hashString } from '../utils/auth.utils.js';
import { sendEmail } from './email.service.js';

export class OtpService {
  /**
   * Generates a 6-digit OTP
   */
  static generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generates, hashes, saves, and sends an email OTP
   */
  static async sendEmailOtp(email: string, type: OtpType): Promise<void> {
    const otp = this.generateOtp();
    const otpHash = hashString(otp);

    // Expire in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OtpRecord.create({
      target: email,
      otpHash,
      type,
      expiresAt
    });

    const subject = type === 'password_reset' ? 'Your SyncUp Password Reset Code' : 'Verify your SyncUp Email';
    const html = `<p>Your verification code is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`;

    await sendEmail(email, subject, html);
  }

  /**
   * Stub for Phone OTP
   */
  static async sendPhoneOtp(phone: string, type: OtpType): Promise<void> {
    const otp = '123456'; // STUB for hackathon
    const otpHash = hashString(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OtpRecord.create({
      target: phone,
      otpHash,
      type,
      expiresAt
    });

    console.log(`[STUB] Sent SMS to ${phone} with OTP: ${otp}`);
  }

  /**
   * Verifies an OTP
   */
  static async verifyOtp(target: string, otp: string, type: OtpType): Promise<boolean> {
    const otpHash = hashString(otp);
    
    // Find the latest valid, unused OTP
    const record = await OtpRecord.findOne({
      target,
      type,
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!record) {
      return false; // Not found, expired, or used
    }

    if (record.otpHash !== otpHash) {
      return false; // Mismatch
    }

    // Mark as used
    record.used = true;
    await record.save();

    return true;
  }
}
