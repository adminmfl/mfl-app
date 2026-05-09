import { api } from '../../../core/api';
import type { DashboardSummaryDTO } from '../types/dashboard.dto';

export async function fetchDashboardSummary(): Promise<DashboardSummaryDTO> {
  const res = await api.get<DashboardSummaryDTO>('/api/user/dashboard-summary');
  return res.data;
}
