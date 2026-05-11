import type { LeaderboardResponseDTO, TeamRankingDTO, IndividualRankingDTO } from '../types/leaderboard.dto';
import type { Leaderboard, LeaderboardTeam, LeaderboardPlayer } from '../types/leaderboard.model';

function toPlayer(dto: IndividualRankingDTO): LeaderboardPlayer {
  return {
    userId: dto.user_id,
    displayName: dto.username,
    avatarUrl: dto.profile_picture_url ?? null,
    teamId: dto.team_id,
    teamName: dto.team_name,
    totalPoints: dto.points,
    avgRR: dto.avg_rr,
    rank: dto.rank,
    submissionCount: dto.submission_count,
  };
}

function toTeam(
  dto: TeamRankingDTO,
  individuals: IndividualRankingDTO[]
): LeaderboardTeam {
  // Group individuals that belong to this team
  const teamPlayers = individuals
    .filter((p) => p.team_id === dto.team_id)
    .map(toPlayer);

  return {
    teamId: dto.team_id,
    teamName: dto.team_name,
    totalPoints: dto.total_points,
    challengeBonus: dto.challenge_bonus,
    avgRR: dto.avg_rr,
    rank: dto.rank,
    memberCount: dto.member_count,
    submissionCount: dto.submission_count,
    players: teamPlayers,
  };
}

export function toLeaderboard(dto: LeaderboardResponseDTO): Leaderboard {
  const d = dto.data;
  return {
    teams: (d.teams || []).map((t) => toTeam(t, d.individuals || [])),
    individuals: (d.individuals || []).map(toPlayer),
    stats: {
      totalSubmissions: d.stats.total_submissions,
      approved: d.stats.approved,
      pending: d.stats.pending,
      rejected: d.stats.rejected,
      totalRR: d.stats.total_rr,
    },
    dateRange: {
      startDate: d.dateRange.startDate,
      endDate: d.dateRange.endDate,
    },
    leagueName: d.league.league_name,
  };
}
