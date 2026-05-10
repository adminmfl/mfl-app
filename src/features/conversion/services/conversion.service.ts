import { api } from '../../../core/api/client';

export interface ConversionCandidate {
  id: string;
  userId: string;
  sourceLeagueId: string;
  shownAt: string | null;
  nudgedAt: string | null;
  converted: boolean;
  convertedAt: string | null;
}

interface ConversionCandidateResponse {
  success: boolean;
  candidate: {
    id: string;
    user_id: string;
    source_league_id: string;
    shown_at: string | null;
    nudged_at: string | null;
    converted: boolean;
    converted_at: string | null;
  } | null;
}

export async function fetchConversionCandidate(
  sourceLeagueId: string,
): Promise<ConversionCandidate | null> {
  const { data } = await api.get<ConversionCandidateResponse>(
    '/api/user/conversion-candidate',
    { params: { source_league_id: sourceLeagueId } },
  );

  if (!data.success || !data.candidate) return null;

  const c = data.candidate;
  return {
    id: c.id,
    userId: c.user_id,
    sourceLeagueId: c.source_league_id,
    shownAt: c.shown_at,
    nudgedAt: c.nudged_at,
    converted: c.converted,
    convertedAt: c.converted_at,
  };
}

export type ConversionStage = 'shown' | 'clicked' | 'created';

export async function trackConversionEvent(
  stage: ConversionStage,
  sourceLeagueId: string,
): Promise<void> {
  await api.post('/api/conversion/track', {
    conversion_stage: stage,
    source_league_id: sourceLeagueId,
  });
}
