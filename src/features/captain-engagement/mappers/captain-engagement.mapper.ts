import type { AtRiskPlayerDTO, MilestoneDraftDTO } from '../types/captain-engagement.dto';
import type { CaptainAtRiskPlayer, MilestoneDraft } from '../types/captain-engagement.model';

export function toCaptainAtRiskPlayer(dto: AtRiskPlayerDTO): CaptainAtRiskPlayer {
  return {
    userId: dto.userId,
    username: dto.username,
    teamId: dto.teamId,
    reason: dto.reason,
    lastSubmissionAt: dto.lastSubmissionAt,
    teamAverage: dto.teamAverage,
    playerActivity: dto.playerActivity,
  };
}

export function toMilestoneDraft(dto: MilestoneDraftDTO): MilestoneDraft {
  return {
    id: dto.id,
    leagueId: dto.league_id,
    type: dto.type,
    targetScope: dto.target_scope,
    targetId: dto.target_id,
    content: dto.content,
    status: dto.status,
    milestoneType: dto.milestone_type,
    createdAt: dto.created_at,
    targetUsername: dto.target_user?.username ?? 'Player',
  };
}
