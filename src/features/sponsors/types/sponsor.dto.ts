import type { SponsorCategory } from './sponsor.model';

export interface SponsorDTO {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  category: SponsorCategory;
}

export interface LeagueSponsorSlotDTO {
  id: string;
  league_id: string;
  category: SponsorCategory;
  sponsor_id: string;
  team_id: string | null;
  challenge_id: string | null;
  enabled: boolean;
  locked_by_admin: boolean;
  activation_start: string | null;
  activation_end: string | null;
  sponsor?: SponsorDTO | null;
  team?: { team_id: string; team_name: string } | null;
  challenge?: { challenge_id: string; challenge_name: string } | null;
}

export interface LeagueSponsorsResponseDTO {
  data: LeagueSponsorSlotDTO[];
}

export interface SponsorSlotUpdateDTO {
  slot_id: string;
  enabled?: boolean;
  team_id?: string;
  challenge_id?: string;
}
