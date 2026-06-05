import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchPayments } from '../services/payment.service';
import { toPayment } from '../mappers/payment.mapper';
import type { Payment } from '../types/payment.model';

export function usePayments() {
  return useQuery<Payment[]>({
    queryKey: queryKeys.user.payments(),
    queryFn: async () => {
      const dto = await fetchPayments();
      return dto.payments.map(toPayment);
    },
    staleTime: 5 * 60 * 1000,
  });
}
