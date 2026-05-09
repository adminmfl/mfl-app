import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchDashboardSummary } from '../services/dashboard.service';
import { toDashboardSummary } from '../mappers/dashboard.mapper';
import type { DashboardSummary } from '../types/dashboard.model';

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: queryKeys.user.dashboardSummary(),
    queryFn: async () => {
      const dto = await fetchDashboardSummary();
      return toDashboardSummary(dto);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
