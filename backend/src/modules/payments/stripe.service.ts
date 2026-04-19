import Stripe from 'stripe';
import { Event, Registration } from '../../models/index.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key', {
  apiVersion: '2025-01-27' as any, // Use latest stable
});

export class StripeService {
  /**
   * createCheckoutSession
   * 1. Check if event is free or paid.
   * 2. If free, throw error (or handled by caller).
   * 3. Create a pending registration.
   * 4. Create Stripe Checkout Session.
   */
  static async createCheckoutSession(eventId: string, userId: string) {
    let event = await Event.findById(eventId);
    
    // DEMO MODE: Fallback for mock IDs like 'e1', 'e2'
    if (!event && eventId.startsWith('e')) {
      console.log(`[Stripe] Using Demo Mode for mock event ID: ${eventId}`);
      event = {
        title: "KaaMe Founders Sync (Demo)",
        description: "Official Dev-Clash professional sync event.",
        price: 25,
        currency: 'usd',
        _id: eventId
      } as any;
    }

    if (!event) throw new Error('Event not found');
    const eventPrice = event.price ?? (event as any).ticketPrice ?? 0;
    if (eventPrice <= 0) throw new Error('This is a free event');

    // Create a pending registration
    const registration = await Registration.findOneAndUpdate(
      { event: eventId, user: userId },
      { 
        status: 'going', 
        paymentStatus: 'pending',
        amountPaid: eventPrice
      },
      { upsert: true, new: true }
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: event.currency || 'usd',
            product_data: {
              name: `Registration: ${event.title}`,
              description: event.description.substring(0, 100),
            },
            unit_amount: Math.round(eventPrice * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/events/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/events/cancel`,
      metadata: {
        registrationId: (registration._id as any).toString(),
        eventId: eventId.toString(),
        userId: userId.toString(),
      },
    });

    registration.stripeSessionId = session.id;
    await registration.save();

    return session.url;
  }

  /**
   * handleWebhook
   * Verifies Stripe signature and updates registration based on payment result.
   */
  static async handleWebhook(payload: any, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');

    let stripeEvent: Stripe.Event;

    try {
      stripeEvent = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      throw new Error(`Webhook Error: ${err.message}`);
    }

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      const registrationId = session.metadata?.registrationId;

      if (registrationId) {
        await Registration.findByIdAndUpdate(registrationId, {
          paymentStatus: 'paid'
        });
        console.log(`✅ Payment successful for registration ${registrationId}`);
      }
    } else if (stripeEvent.type === 'checkout.session.async_payment_failed') {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      const registrationId = session.metadata?.registrationId;

      if (registrationId) {
        await Registration.findByIdAndUpdate(registrationId, {
          paymentStatus: 'failed'
        });
        console.log(`❌ Payment failed for registration ${registrationId}`);
      }
    }

    return { received: true };
  }
}
