import { api } from '../../../core/api';
import type { QuickStartPayload, QuickStartResponse } from './quick-start.types';

export async function createQuickStartLeague(
  payload: QuickStartPayload,
): Promise<QuickStartResponse> {
  const res = await api.post<QuickStartResponse>('/api/leagues/quick-start', payload);
  return res.data;
}
