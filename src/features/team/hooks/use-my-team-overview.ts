import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../core/config';
import { fetchTeamMembers } from '../services/team.service';
import { fetchLeaderboard } from '../../leaderboard/services/leaderboard.service';
import { toTeamMember } from '../mappers/team.mapper';
import type { TeamMember, MyTeamStats } from '../types/team.model';

export interface MyTeamOverviewData {
  members: TeamMember[];
  stats: MyTeamStats;
}

export function useMyTeamOverview(leagueId: string, teamId: string | null, teamCapacity: number) {
  return useQuery<MyTeamOverviewData>({
    queryKey: queryKeys.leagues.teamMembers(leagueId, teamId ?? ''),
    queryFn: async () => {
      if (!teamId) throw new Error('No team assigned');

      const [membersRes, lbRes] = await Promise.all([
        fetchTeamMembers(leagueId, teamId),
        fetchLeaderboard(leagueId).catch(() => null),
      ]);

      // Build enrichment map from leaderboard individuals
      const enrichMap = new Map<string, { points: number; avgRr: number; profilePictureUrl: string | null }>();
      if (lbRes?.success && lbRes.data?.individuals) {
        for (const ind of lbRes.data.individuals) {
          enrichMap.set(String(ind.user_id), {
            points: Number(ind.points || 0),
            avgRr: Number(ind.avg_rr || 0),
            profilePictureUrl: ind.profile_picture_url ?? null,
          });
        }
      }

      // Map members with leaderboard enrichment
      const members = (membersRes.data || []).map((dto) => {
        const enriched = enrichMap.get(String(dto.user_id));
        return toTeamMember(
          dto,
          enriched?.points ?? 0,
          enriched?.avgRr ?? 0,
          enriched?.profilePictureUrl,
        );
      });

      // Extract team stats from leaderboard
      let teamRank = '#--';
      let teamPoints = 0;
      let teamAvgRR = 0;
      let teamName: string | null = null;

      if (lbRes?.success && lbRes.data?.teams) {
        const team = lbRes.data.teams.find(
          (t) => String(t.team_id) === String(teamId),
        );
        if (team) {
          teamRank = `#${team.rank ?? '--'}`;
          teamPoints = team.total_points ?? team.points ?? 0;
          teamAvgRR = team.avg_rr ?? 0;
          teamName = team.team_name ?? null;
        }
      }

      return {
        members,
        stats: { teamRank, teamPoints, teamAvgRR, teamName, memberCapacity: teamCapacity },
      };
    },
    enabled: !!leagueId && !!teamId,
    staleTime: 2 * 60 * 1000,
  });
}
