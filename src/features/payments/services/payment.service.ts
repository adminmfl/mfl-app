import { api } from '../../../core/api';
import type {
  PaymentsResponseDTO,
  CreateOrderRequestDTO,
  CreateOrderResponseDTO,
  VerifyPaymentRequestDTO,
  VerifyPaymentResponseDTO,
} from '../types/payment.dto';

export async function fetchPayments(): Promise<PaymentsResponseDTO> {
  const res = await api.get<PaymentsResponseDTO>('/api/user/payments');
  return res.data;
}

export async function createOrder(
  payload: CreateOrderRequestDTO,
): Promise<CreateOrderResponseDTO> {
  const res = await api.post<CreateOrderResponseDTO>('/api/payments/order', payload);
  return res.data;
}

export async function verifyPayment(
  payload: VerifyPaymentRequestDTO,
): Promise<VerifyPaymentResponseDTO> {
  const res = await api.post<VerifyPaymentResponseDTO>('/api/payments/verify', payload);
  return res.data;
}
