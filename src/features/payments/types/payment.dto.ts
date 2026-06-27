// Backend GET /api/user/payments returns: { payments: [...] }
export interface PaymentDTO {
  payment_id: string;
  status: string;
  purpose: string;
  base_amount: number;
  platform_fee: number;
  gst_amount: number;
  total_amount: number;
  currency: string;
  description: string | null;
  receipt: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  league_id: string | null;
  league_name: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface PaymentsResponseDTO {
  payments: PaymentDTO[];
}

// Backend POST /api/payments/order expects: { leagueData: { tier_id, league_name, ... } }
// Returns: { orderId, amount, currency, keyId }
export interface CreateOrderRequestDTO {
  leagueData: {
    tier_id: string;
    league_name: string;
    start_date: string;
    end_date: string;
    max_participants?: number;
    num_teams?: number;
    rest_days: number;
    rr_config: Record<string, unknown>;
    is_public: boolean;
    is_exclusive: boolean;
  };
}

export interface CreateOrderResponseDTO {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

// Backend POST /api/payments/verify expects: { orderId, paymentId, signature }
// Returns: { success, payment: { payment_id, status, league_id } }
export interface VerifyPaymentRequestDTO {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifyPaymentResponseDTO {
  success: boolean;
  payment: {
    payment_id: string;
    status: string;
    league_id: string | null;
  };
}
