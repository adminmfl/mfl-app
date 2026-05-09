import { useMutation } from '@tanstack/react-query';
import { createOrder } from '../services/payment.service';
import { toPaymentOrder } from '../mappers/payment.mapper';
import type { CreateOrderRequestDTO } from '../types/payment.dto';
import type { PaymentOrder } from '../types/payment.model';

export function useCreateOrder() {
  return useMutation<PaymentOrder, Error, CreateOrderRequestDTO>({
    mutationFn: async (payload) => {
      const dto = await createOrder(payload);
      return toPaymentOrder(dto);
    },
  });
}
