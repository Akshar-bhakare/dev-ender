import { z } from 'zod';

export const CreatePromoCodeSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  discountType: z.enum(['flat', 'percentage']),
  discountValue: z.number().min(1),
  maxUses: z.number().int().min(1),
  expiresAt: z.string().datetime().refine(val => new Date(val) > new Date(), 'Expiry date must be in the future'),
}).refine(data => {
  if (data.discountType === 'percentage' && data.discountValue > 100) {
    return false;
  }
  return true;
}, { message: "Percentage discount cannot exceed 100", path: ["discountValue"] });

export const RegisterEventSchema = z.object({
  promoCode: z.string().optional(),
});

export const CheckInSchema = z.object({
  qrCodeToken: z.string().uuid('Invalid QR code token'),
});
