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
