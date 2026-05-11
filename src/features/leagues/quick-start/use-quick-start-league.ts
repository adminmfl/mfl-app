import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { createQuickStartLeague, buildPayload } from './quick-start.service';
import type { WizardData, WizardResult } from './quick-start.types';
import { addDaysToDate } from './quick-start.types';

export function useQuickStartLeague() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; data: WizardResult }, Error, WizardData>({
    mutationFn: (wizardData) => {
      const endDate = addDaysToDate(wizardData.startDate, wizardData.duration);
      const payload = buildPayload(wizardData, endDate);
      return createQuickStartLeague(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.leagues() });
    },
  });
}
