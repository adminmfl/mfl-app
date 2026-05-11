import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { api } from '../../../core/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LeagueActivity {
  activity_id: string;
  activity_name: string;
  description: string | null;
  value: string;
  measurement_type: 'duration' | 'distance' | 'hole' | 'steps' | 'none';
  settings?: Record<string, any> | null;
  frequency?: number | null;
  frequency_type?: 'daily' | 'weekly' | 'monthly' | null;
  proof_requirement?: 'not_required' | 'optional' | 'mandatory';
  notes_requirement?: 'not_required' | 'optional' | 'mandatory';
  points_per_session?: number;
  min_value?: number | null;
  age_group_overrides?: Record<string, any> | null;
  outcome_config?: Record<string, any> | null;
  submission_window_days?: number | null;
  custom_field_label?: string | null;
  custom_field_placeholder?: string | null;
  custom_field_label_2?: string | null;
  custom_field_placeholder_2?: string | null;
  max_images?: number | null;
}

interface LeagueActivitiesResponse {
  success: boolean;
  data: {
    activities: LeagueActivity[];
    isLeagueSpecific: boolean;
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLeagueActivities(leagueId: string | null) {
  return useQuery<LeagueActivity[]>({
    queryKey: queryKeys.leagues.activities(leagueId ?? ''),
    queryFn: async () => {
      if (!leagueId) return [];
      const res = await api.get<LeagueActivitiesResponse>(
        `/api/leagues/${leagueId}/activities`,
      );
      return res.data?.data?.activities ?? [];
    },
    enabled: !!leagueId,
    staleTime: 5 * 60 * 1000,
  });
}
