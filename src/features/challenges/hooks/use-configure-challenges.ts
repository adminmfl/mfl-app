import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import {
  assignChallengeTeamScore,
  createChallenge,
  createChallengeSubTeam,
  createTournamentMatch,
  deleteChallenge,
  deleteChallengeSubTeam,
  deleteTournamentMatch,
  fetchChallengeSubTeamDetails,
  fetchChallengeSubTeams,
  fetchChallengeSubmissions,
  fetchChallengeTeamMembers,
  fetchChallengeTeams,
  fetchChallenges,
  fetchTournamentMatches,
  fetchTournamentScores,
  finalizeTournamentScores,
  publishChallenge,
  updateChallenge,
  updateChallengeSubTeam,
  updateTournamentMatch,
  validateChallengeSubmission,
  type ChallengeMutationInput,
} from '../services/challenge.service';
import {
  toChallenge,
  toChallengePreset,
  toChallengeSubmission,
} from '../mappers/challenge.mapper';
import type {
  Challenge,
  ChallengePreset,
  ChallengeSubmission,
  ChallengeSubTeam,
  ChallengeSubTeamDetails,
  ChallengeTeam,
  ChallengeTeamMember,
  TournamentMatch,
  TournamentMatchInput,
  TournamentScore,
} from '../types/challenge.model';

export interface ConfigureChallengesData {
  challenges: Challenge[];
  presets: ChallengePreset[];
}

export function useConfigureChallenges(leagueId: string) {
  return useQuery<ConfigureChallengesData>({
    queryKey: queryKeys.leagues.challenges(leagueId),
    queryFn: async () => {
      const dto = await fetchChallenges(leagueId);
      return {
        challenges: dto.data.active.map(toChallenge),
        presets: dto.data.availablePresets.map(toChallengePreset),
      };
    },
    enabled: !!leagueId,
    staleTime: 60 * 1000,
  });
}

export function useChallengeAdminActions(leagueId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.leagues.challenges(leagueId) });
    queryClient.invalidateQueries({ queryKey: ['challenges', leagueId] });
  };

  const createMutation = useMutation({
    mutationFn: (input: ChallengeMutationInput) => createChallenge(leagueId, input),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ challengeId, input }: { challengeId: string; input: Partial<ChallengeMutationInput> }) =>
      updateChallenge(leagueId, challengeId, input),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (challengeId: string) => deleteChallenge(leagueId, challengeId),
    onSuccess: invalidate,
  });

  const validateMutation = useMutation({
    mutationFn: ({
      submissionId,
      status,
      awardedPoints,
    }: {
      submissionId: string;
      status: 'approved' | 'rejected';
      awardedPoints?: number | null;
    }) => validateChallengeSubmission(submissionId, { status, awardedPoints }),
    onSuccess: invalidate,
  });

  const teamScoreMutation = useMutation({
    mutationFn: ({
      challengeId,
      teamId,
      score,
    }: {
      challengeId: string;
      teamId: string;
      score: number;
    }) => assignChallengeTeamScore(leagueId, challengeId, { teamId, score }),
    onSuccess: invalidate,
  });

  const publishMutation = useMutation({
    mutationFn: (challengeId: string) => publishChallenge(leagueId, challengeId),
    onSuccess: invalidate,
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    validateMutation,
    teamScoreMutation,
    publishMutation,
  };
}

export function useChallengeReviewSubmissions(
  leagueId: string,
  challengeId: string,
  filters: { teamId?: string; subTeamId?: string },
) {
  return useQuery<ChallengeSubmission[]>({
    queryKey: [
      ...queryKeys.leagues.challenges(leagueId),
      challengeId,
      'submissions',
      filters.teamId ?? '',
      filters.subTeamId ?? '',
    ],
    queryFn: async () => {
      const dto = await fetchChallengeSubmissions(leagueId, challengeId, filters);
      return dto.data.map(toChallengeSubmission);
    },
    enabled: !!leagueId && !!challengeId,
    staleTime: 30 * 1000,
  });
}

export function useChallengeTeams(leagueId: string) {
  return useQuery<ChallengeTeam[]>({
    queryKey: [...queryKeys.leagues.teams(leagueId), 'challenge-config'],
    queryFn: async () => {
      const teams = await fetchChallengeTeams(leagueId);
      return teams.map((team) => ({
        teamId: team.team_id,
        teamName: team.team_name,
        memberCount: team.member_count ?? 0,
      }));
    },
    enabled: !!leagueId,
    staleTime: 60 * 1000,
  });
}

export function useChallengeSubTeams(leagueId: string, challengeId: string, teamId: string) {
  return useQuery<ChallengeSubTeam[]>({
    queryKey: [
      ...queryKeys.leagues.challenges(leagueId),
      challengeId,
      'subteams',
      teamId,
    ],
    queryFn: async () => {
      const rows = await fetchChallengeSubTeams(leagueId, challengeId, teamId);
      return rows.map((row) => ({
        subTeamId: row.subteam_id,
        name: row.name,
      }));
    },
    enabled: !!leagueId && !!challengeId && !!teamId,
    staleTime: 30 * 1000,
  });
}

export function useChallengeSubTeamManager(
  leagueId: string,
  challengeId: string,
  teamId: string,
) {
  return useQuery<ChallengeSubTeamDetails[]>({
    queryKey: [
      ...queryKeys.leagues.challenges(leagueId),
      challengeId,
      'subteam-manager',
      teamId,
    ],
    queryFn: () => fetchChallengeSubTeamDetails(leagueId, challengeId, teamId),
    enabled: !!leagueId && !!challengeId && !!teamId,
    staleTime: 30 * 1000,
  });
}

export function useChallengeTeamMembers(leagueId: string, teamId: string) {
  return useQuery<ChallengeTeamMember[]>({
    queryKey: [...queryKeys.leagues.teams(leagueId), teamId, 'members'],
    queryFn: () => fetchChallengeTeamMembers(leagueId, teamId),
    enabled: !!leagueId && !!teamId,
    staleTime: 30 * 1000,
  });
}

export function useSubTeamAdminActions(leagueId: string, challengeId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.leagues.challenges(leagueId) });
  };

  const createMutation = useMutation({
    mutationFn: (input: { teamId: string; name: string; memberIds: string[] }) =>
      createChallengeSubTeam(leagueId, challengeId, input),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      subTeamId,
      input,
    }: {
      subTeamId: string;
      input: { name: string; memberIds: string[] };
    }) => updateChallengeSubTeam(leagueId, challengeId, subTeamId, input),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (subTeamId: string) => deleteChallengeSubTeam(leagueId, challengeId, subTeamId),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation };
}

export function useTournamentMatches(leagueId: string, challengeId: string) {
  return useQuery<TournamentMatch[]>({
    queryKey: [
      ...queryKeys.leagues.challenges(leagueId),
      challengeId,
      'tournament-matches',
    ],
    queryFn: () => fetchTournamentMatches(leagueId, challengeId),
    enabled: !!leagueId && !!challengeId,
    staleTime: 30 * 1000,
  });
}

export function useTournamentScores(leagueId: string, challengeId: string) {
  return useQuery<TournamentScore[]>({
    queryKey: [
      ...queryKeys.leagues.challenges(leagueId),
      challengeId,
      'tournament-scores',
    ],
    queryFn: () => fetchTournamentScores(leagueId, challengeId),
    enabled: !!leagueId && !!challengeId,
    staleTime: 30 * 1000,
  });
}

export function useTournamentAdminActions(leagueId: string, challengeId: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.leagues.challenges(leagueId) });
  };

  const createMutation = useMutation({
    mutationFn: (input: TournamentMatchInput) => createTournamentMatch(leagueId, challengeId, input),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ matchId, input }: { matchId: string; input: TournamentMatchInput }) =>
      updateTournamentMatch(leagueId, challengeId, matchId, input),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (matchId: string) => deleteTournamentMatch(leagueId, challengeId, matchId),
    onSuccess: invalidate,
  });

  const finalizeMutation = useMutation({
    mutationFn: (scores: TournamentScore[]) => finalizeTournamentScores(leagueId, challengeId, scores),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation, finalizeMutation };
}
