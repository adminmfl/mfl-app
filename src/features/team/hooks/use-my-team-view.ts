import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchTeamMembers, fetchTeamSummary } from '../services/team.service';
import { fetchLeaderboard } from '../../leaderboard/services/leaderboard.service';
import { toTeamMember } from '../mappers/team.mapper';
import type { TeamViewData } from '../types/team.model';

export function useMyTeamView(
  leagueId: string,
  teamId: string | null,
  teamCapacity: number,
  teamLogoUrl: string | null,
) {
  return useQuery<TeamViewData>({
    queryKey: queryKeys.leagues.teamView(leagueId, teamId ?? ''),
    queryFn: async () => {
      if (!teamId) throw new Error('No team assigned');

      const [membersRes, lbRes, summaryRes] = await Promise.all([
        fetchTeamMembers(leagueId, teamId),
        fetchLeaderboard(leagueId).catch(() => null),
        fetchTeamSummary(leagueId).catch(() => null),
      ]);

      // Build enrichment map from leaderboard individuals
      const enrichMap = new Map<
        string,
        { points: number; avgRr: number; profilePictureUrl: string | null }
      >();
      if (lbRes?.success && lbRes.data?.individuals) {
        for (const ind of lbRes.data.individuals) {
          enrichMap.set(String(ind.user_id), {
            points: Number(ind.points || 0),
            avgRr: Number(ind.avg_rr || 0),
            profilePictureUrl: ind.profile_picture_url ?? null,
          });
        }
      }

      // Map members with leaderboard enrichment, sorted by points desc then avg_rr desc
      const members = (membersRes.data || [])
        .map((dto) => {
          const enriched = enrichMap.get(String(dto.user_id));
          return toTeamMember(
            dto,
            enriched?.points ?? 0,
            enriched?.avgRr ?? 0,
            enriched?.profilePictureUrl,
          );
        })
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          return b.avgRr - a.avgRr;
        });

      // Extract team stats from leaderboard
      let teamRank = '#--';
      let teamPoints = 0;
      let teamAvgRR = 0;
      let teamName: string | null = null;
      let activityPoints: number | null = null;
      let challengePoints: number | null = null;

      if (lbRes?.success && lbRes.data?.teams) {
        const team = lbRes.data.teams.find(
          (t) => String(t.team_id) === String(teamId),
        );
        if (team) {
          teamRank = `#${team.rank ?? '--'}`;
          teamPoints = team.total_points ?? team.points ?? 0;
          teamAvgRR = team.avg_rr ?? 0;
          teamName = team.team_name ?? null;
          activityPoints =
            typeof team.points === 'number' ? Math.max(0, team.points) : 0;
          challengePoints =
            typeof team.challenge_bonus === 'number'
              ? Math.max(0, team.challenge_bonus)
              : null;
        }
      }

      // Extract summary stats
      let restUsed: number | null = null;
      let missedDays: number | null = null;
      if (summaryRes?.success && summaryRes.data) {
        if (typeof summaryRes.data.restUsed === 'number') {
          restUsed = summaryRes.data.restUsed;
        }
        if (typeof summaryRes.data.missedDays === 'number') {
          missedDays = summaryRes.data.missedDays;
        }
      }

      return {
        members,
        stats: {
          teamRank,
          teamPoints,
          teamAvgRR,
          teamName,
          memberCapacity: teamCapacity,
          activityPoints,
          challengePoints,
          restUsed,
          missedDays,
          teamLogoUrl,
        },
      };
    },
    enabled: !!leagueId && !!teamId,
    staleTime: 2 * 60 * 1000,
  });
}
