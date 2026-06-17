import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchDashboardSummary } from '../services/dashboard.service';
import type { DashboardSummaryDTO } from '../types/dashboard.dto';
import type { DashboardSummary } from '../types/dashboard.model';

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: queryKeys.user.dashboardSummary(),
    queryFn: async () => {
      const dto = await fetchDashboardSummary();
      return dto.data as DashboardSummaryDTO['data'];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
