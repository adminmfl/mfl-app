export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  paymentId: string;
  status: PaymentStatus;
  purpose: string;
  baseAmount: number;
  platformFee: number;
  gstAmount: number;
  totalAmount: number;
  currency: string;
  description: string | null;
  receipt: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  leagueId: string | null;
  leagueName: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

// ─── Razorpay SDK types ─────────────────────────────────────────────────────

export interface RazorpayOptions {
  description: string;
  image: string;
  currency: string;
  key: string;
  amount: number;
  name: string;
  order_id: string;
  theme: { color: string };
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayErrorResponse {
  code: number;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: {
    order_id: string;
    payment_id: string;
  };
}

/** Shape thrown by the Razorpay SDK on failure. */
export interface RazorpaySdkError {
  error?: RazorpayErrorResponse;
  message?: string;
  description?: string;
}
