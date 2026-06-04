import type { PaymentDTO, CreateOrderResponseDTO } from '../types/payment.dto';
import type { Payment, PaymentOrder, PaymentStatus } from '../types/payment.model';

export function toPayment(dto: PaymentDTO): Payment {
  return {
    paymentId: dto.payment_id,
    status: dto.status as PaymentStatus,
    purpose: dto.purpose,
    baseAmount: dto.base_amount,
    platformFee: dto.platform_fee,
    gstAmount: dto.gst_amount,
    totalAmount: dto.total_amount,
    currency: dto.currency,
    description: dto.description,
    receipt: dto.receipt,
    razorpayOrderId: dto.razorpay_order_id,
    razorpayPaymentId: dto.razorpay_payment_id,
    leagueId: dto.league_id,
    leagueName: dto.league_name,
    createdAt: dto.created_at,
    completedAt: dto.completed_at,
  };
}

export function toPaymentOrder(dto: CreateOrderResponseDTO): PaymentOrder {
  return {
    orderId: dto.orderId,
    amount: dto.amount,
    currency: dto.currency,
    keyId: dto.keyId,
  };
}
