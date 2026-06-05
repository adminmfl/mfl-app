import { api } from '../../../core/api';
import type { WizardData, WizardResult, CloneableLeague } from './quick-start.types';

interface QuickStartPayload {
  template: string | null;
  league_name: string;
  league_type: string;
  player_count: number;
  num_teams: number;
  max_team_capacity: number;
  start_date: string;
  end_date: string;
  duration: number;
  rest_days: number;
  activities: string[];
  max_participants: number;
  is_public: boolean;
  scoring_formula: string;
  proof_requirement: string;
  notes_requirement: boolean;
  league_mode: string;
  clone_from_league_id: string | null;
}

export function buildPayload(data: WizardData, endDate: string): QuickStartPayload {
  const effectiveName =
    data.leagueName.trim() ||
    `${data.leagueType === 'corporate' ? 'Corporate' : data.leagueType === 'residential' ? 'Residential' : 'Custom'} ${data.duration}-Day League`;

  return {
    template: data.template,
    league_name: effectiveName,
    league_type: data.leagueType,
    player_count: data.playerCount,
    num_teams: data.numTeams,
    max_team_capacity: data.maxTeamCapacity,
    start_date: data.startDate,
    end_date: endDate,
    duration: data.duration,
    rest_days: data.restDays,
    activities: data.activities,
    max_participants: data.maxParticipants,
    is_public: data.isPublic,
    scoring_formula: data.scoringFormula,
    proof_requirement: data.proofRequirement,
    notes_requirement: data.notesRequirement,
    league_mode: data.leagueMode,
    clone_from_league_id: data.cloneFromLeagueId,
  };
}

export async function createQuickStartLeague(
  payload: QuickStartPayload,
): Promise<{ success: boolean; data: WizardResult }> {
  const res = await api.post<{ success: boolean; data: WizardResult }>(
    '/api/leagues/quick-start',
    payload,
  );
  return res.data;
}

export async function fetchCloneableLeagues(): Promise<CloneableLeague[]> {
  const res = await api.get<{ leagues: CloneableLeague[] }>(
    '/api/leagues/quick-start/clone',
  );
  return res.data.leagues ?? [];
}

export async function fetchCloneData(leagueId: string): Promise<Partial<WizardData>> {
  const res = await api.get<{ data: Record<string, any> }>(
    `/api/leagues/quick-start/clone?leagueId=${leagueId}`,
  );
  const d = res.data.data;
  return {
    template: null,
    cloneFromLeagueId: leagueId,
    leagueType: d.league_type || 'corporate',
    duration: d.duration || 40,
    activities: d.activities || [],
    restDays: d.rest_days ?? 1,
    playerCount: d.player_count || 20,
    numTeams: d.num_teams || 4,
    maxTeamCapacity: d.max_team_capacity || 10,
    scoringFormula: d.scoring_formula || 'standard',
    proofRequirement: d.proof_requirement || 'mandatory',
    leagueMode: d.league_mode || 'standard',
    isPublic: d.is_public || false,
  };
}
