import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

let razorpayClient: Razorpay | null = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayClient = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export const razorpayServer = {
  createOrder: async (amount: number, currency: string = 'INR', receipt: string) => {
    if (!razorpayClient) {
      // Stub response for local testing if Razorpay keys are absent
      console.warn('RAZORPAY KEYS NOT SET. STUBBING ORDER CREATION.');
      return {
        id: `order_stub_${Date.now()}`,
        currency,
        amount,
        receipt,
        status: 'created',
      };
    }
    return razorpayClient.orders.create({
      amount,
      currency,
      receipt,
      payment_capture: true,
    });
  },

  verifyWebhookSignature: (payload: string, signature: string, secret: string): boolean => {
    if (!secret) return false;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return generatedSignature === signature;
  }
};
