import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { verifyPayment } from '../services/payment.service';
import type { VerifyPaymentRequestDTO, VerifyPaymentResponseDTO } from '../types/payment.dto';

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation<VerifyPaymentResponseDTO, Error, VerifyPaymentRequestDTO>({
    mutationFn: async (payload) => {
      return verifyPayment(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.payments() });
    },
  });
}
