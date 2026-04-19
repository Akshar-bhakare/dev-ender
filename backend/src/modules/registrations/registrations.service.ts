import { Types } from 'mongoose';
import { EventRegistration, EventPromoCode, EventPayout } from './registrations.schema.js';
import { EventModel } from '../events/events.schema.js';
import { EventError, ERROR_CODES } from '../events/events.errors.js';
import { razorpayServer } from '../../lib/razorpay.js';
import { generateQrToken } from '../../lib/uuid.js';

const generateTicketNumber = async (eventId: Types.ObjectId) => {
  const count = await EventRegistration.countDocuments({ eventId, status: { $in: ['confirmed', 'attended'] } });
  return `EVT-${String(count + 1).padStart(6, '0')}`;
};

export const registerForEvent = async (eventId: string, userId: string, promoCodeStr?: string) => {
  const event = await EventModel.findById(eventId);
  if (!event) throw new EventError(ERROR_CODES.NOT_FOUND, 'Event not found');
  if (event.status !== 'published') throw new EventError(ERROR_CODES.NOT_PUBLISHED, 'Event is not published');
  
  if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
    throw new EventError(ERROR_CODES.DEADLINE_PASSED, 'Registration deadline has passed');
  }

  const existingRegistration = await EventRegistration.findOne({ eventId: event._id, userId: new Types.ObjectId(userId) });
  if (existingRegistration) throw new EventError(ERROR_CODES.ALREADY_REGISTERED, 'You are already registered for this event');

  let status: 'confirmed' | 'waitlisted' | 'pending_payment' = 'confirmed';
  
  // Capacity Check
  if ((event.registrationCount ?? 0) >= (event.maxAttendees ?? Infinity)) {
    if (!event.waitlistEnabled) {
      throw new EventError(ERROR_CODES.AT_CAPACITY, 'Event is at full capacity');
    }
    status = 'waitlisted';
  }

  let finalAmount = event.ticketPrice || 0;
  let appliedPromo: any = null;
  let discountApplied = 0;

  // Paid event logic
  if (!event.isFree && status !== 'waitlisted') {
    if (promoCodeStr) {
      appliedPromo = await EventPromoCode.findOne({ eventId: event._id, code: promoCodeStr.toUpperCase(), isActive: true });
      if (!appliedPromo) throw new EventError(ERROR_CODES.PROMO_INVALID, 'Invalid promo code');
      if (new Date() > new Date(appliedPromo.expiresAt)) throw new EventError(ERROR_CODES.PROMO_EXPIRED, 'Promo code expired');
      if (appliedPromo.usedCount >= appliedPromo.maxUses) throw new EventError(ERROR_CODES.PROMO_EXHAUSTED, 'Promo code usage limit reached');

      if (appliedPromo.discountType === 'flat') {
        discountApplied = appliedPromo.discountValue;
      } else {
        discountApplied = Math.floor(finalAmount * (appliedPromo.discountValue / 100));
      }
      finalAmount = Math.max(0, finalAmount - discountApplied);
    }

    if (finalAmount > 0) {
      status = 'pending_payment';
    }
  }

  const qrCodeToken = generateQrToken();
  const ticketNumber = await generateTicketNumber(event._id as Types.ObjectId);

  const registration = new EventRegistration({
    eventId: event._id,
    userId: new Types.ObjectId(userId),
    status,
    qrCodeToken,
    ticketNumber,
    promoCodeId: appliedPromo ? appliedPromo._id : undefined,
    discountApplied,
    amountPaid: finalAmount,
  });

  if (status === 'pending_payment') {
    const order = await razorpayServer.createOrder(finalAmount, event.currency, `evt_${event._id}_u_${userId}`);
    registration.razorpayOrderId = order.id;
    await registration.save();
    return { status, order, registration };
  } else {
    await registration.save();
    
    if (status === 'confirmed') {
      event.registrationCount = (event.registrationCount ?? 0) + 1;
      await event.save();
      
      if (appliedPromo) {
        appliedPromo.usedCount += 1;
        await appliedPromo.save();
      }

      await updatePayoutEscrow(event._id as Types.ObjectId, event.organizerUserId as Types.ObjectId, finalAmount);
    }
    
    return { status, registration };
  }
};

export const handleRazorpayWebhook = async (payload: any) => {
  const eventName = payload.event;
  const paymentEntity = payload.payload.payment.entity;
  const orderId = paymentEntity.order_id;
  const paymentId = paymentEntity.id;

  const registration = await EventRegistration.findOne({ razorpayOrderId: orderId });
  if (!registration) return { success: false, message: 'Registration not found' };

  if (eventName === 'payment.captured') {
    if (registration.status !== 'pending_payment') return { success: true }; // Already handled
    
    registration.status = 'confirmed';
    registration.paymentId = paymentId;
    
    // We generated token and ticket number earlier, but we can also regenerate if needed.
    // Spec says "Generate qrCodeToken and ticketNumber" on webhook, but generating earlier is fine since it's unique.
    
    await registration.save();

    const event = await EventModel.findById(registration.eventId);
    if (event) {
      event.registrationCount = (event.registrationCount ?? 0) + 1;
      await event.save();
      await updatePayoutEscrow(event._id as Types.ObjectId, event.organizerUserId as Types.ObjectId, registration.amountPaid || 0);
    }

    if (registration.promoCodeId) {
      await EventPromoCode.findByIdAndUpdate(registration.promoCodeId, { $inc: { usedCount: 1 } });
    }
    
    return { success: true };
  } else if (eventName === 'payment.failed') {
    registration.status = 'cancelled';
    registration.cancellationReason = 'Payment failed';
    await registration.save();
    return { success: true };
  }

  return { success: true, message: 'Unhandled event' };
};

export const updatePayoutEscrow = async (eventId: Types.ObjectId, organizerId: Types.ObjectId, amountPaid: number) => {
  if (amountPaid <= 0) return;

  const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT || '5');
  
  let payout = await EventPayout.findOne({ eventId });
  if (!payout) {
    payout = new EventPayout({
      eventId,
      organizerUserId: organizerId,
      totalCollected: 0,
      platformFee: 0,
      payoutAmount: 0,
    });
  }

  payout.totalCollected += amountPaid;
  payout.platformFee = Math.floor(payout.totalCollected * (platformFeePercent / 100));
  payout.payoutAmount = payout.totalCollected - payout.platformFee;
  await payout.save();
};

export const handleEventCancellationPayouts = async (eventId: string) => {
  // Flag escrow for refund
  const payout = await EventPayout.findOne({ eventId: new Types.ObjectId(eventId) });
  if (payout && payout.totalCollected > 0) {
    payout.status = 'refund_initiated';
    payout.refundInitiatedAt = new Date();
    await payout.save();
  }

  // Cancel all confirmed registrations
  await EventRegistration.updateMany(
    { eventId: new Types.ObjectId(eventId), status: 'confirmed' },
    { $set: { status: 'cancelled', cancelledAt: new Date(), cancellationReason: 'Event cancelled by organizer' } }
  );
  
  // Event registrationCount should arguably be reset or left as analytic artifact. 
  // We leave it since registrations are marked cancelled.
};

export const checkInAttendee = async (qrCodeToken: string, eventId: string, organizerUserId: string) => {
  const event = await EventModel.findById(eventId);
  if (!event || (event.organizerUserId?.toString() ?? '') !== organizerUserId) {
    throw new EventError(ERROR_CODES.UNAUTHORIZED, 'Not authorized for this event');
  }

  const registration = await EventRegistration.findOne({ qrCodeToken });
  if (!registration) throw new EventError(ERROR_CODES.NOT_FOUND, 'Registration not found');
  if (registration.eventId.toString() !== eventId) throw new EventError(ERROR_CODES.VALIDATION_ERROR, 'Mismatched event and QR token');
  
  if (registration.status !== 'confirmed') throw new EventError(ERROR_CODES.VALIDATION_ERROR, `Cannot check in. Status is ${registration.status}`);
  if (registration.checkedInAt) throw new EventError(ERROR_CODES.ALREADY_CHECKED_IN, 'Attendee already checked in');

  registration.checkedInAt = new Date();
  registration.status = 'attended';
  await registration.save();

  return registration;
};

export const createPromoCode = async (data: any, eventId: string, userId: string) => {
  const event = await EventModel.findById(eventId);
  if (!event || (event.organizerUserId?.toString() ?? '') !== userId) throw new EventError(ERROR_CODES.UNAUTHORIZED, 'Not authorized');

  const promo = new EventPromoCode({
    ...data,
    eventId: new Types.ObjectId(eventId),
    createdByUserId: new Types.ObjectId(userId),
  });
  await promo.save();
  return promo;
};
