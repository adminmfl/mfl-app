import type { PartnerActivityResponseDTO } from '../types/partner-activity.dto';
import type { PartnerActivityData } from '../types/partner-activity.model';

export function toPartnerActivityData(
  dto: PartnerActivityResponseDTO,
): PartnerActivityData {
  return {
    activities: dto.data.activities.map((a) => ({
      date: a.date,
      type: a.type,
      workoutType: a.workout_type,
      rrValue: a.rr_value,
      playerName: a.player_name,
      teamName: a.team_name,
      teamId: a.team_id,
    })),
    teams: dto.data.teams.map((t) => ({
      teamId: t.team_id,
      teamName: t.team_name,
    })),
  };
}
