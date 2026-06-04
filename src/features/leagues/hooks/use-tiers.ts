import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchTiers } from '../services/tier.service';
import type { TierConfig } from '../types/tier';

export function useTiers() {
  return useQuery<TierConfig[]>({
    queryKey: queryKeys.tiers.all,
    queryFn: fetchTiers,
    staleTime: 5 * 60 * 1000,
  });
}
