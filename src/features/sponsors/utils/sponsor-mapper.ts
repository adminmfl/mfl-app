import type { LeagueSponsorSlotDTO } from '../types/sponsor.dto';
import type { LeagueSponsorSlot } from '../types/sponsor.model';

export function toLeagueSponsorSlot(dto: LeagueSponsorSlotDTO): LeagueSponsorSlot {
  return {
    id: dto.id,
    leagueId: dto.league_id,
    category: dto.category,
    sponsorId: dto.sponsor_id,
    teamId: dto.team_id,
    challengeId: dto.challenge_id,
    enabled: dto.enabled,
    lockedByAdmin: dto.locked_by_admin,
    activationStart: dto.activation_start,
    activationEnd: dto.activation_end,
    sponsor: dto.sponsor
      ? {
          id: dto.sponsor.id,
          name: dto.sponsor.name,
          logoUrl: dto.sponsor.logo_url,
          websiteUrl: dto.sponsor.website_url,
          category: dto.sponsor.category,
        }
      : null,
    team: dto.team
      ? { teamId: dto.team.team_id, teamName: dto.team.team_name }
      : null,
    challenge: dto.challenge
      ? { challengeId: dto.challenge.challenge_id, challengeName: dto.challenge.challenge_name }
      : null,
  };
}
