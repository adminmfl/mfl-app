export type SponsorCategory = 'title' | 'team' | 'challenge' | 'grand_finale';

export const SPONSOR_CATEGORY_LABELS: Record<SponsorCategory, string> = {
  title: 'Title Sponsor',
  team: 'Team Sponsor',
  challenge: 'Challenge Sponsor',
  grand_finale: 'Grand Finale Sponsor',
};

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string | null;
  websiteUrl: string | null;
  category: SponsorCategory;
}

export interface LeagueSponsorSlot {
  id: string;
  leagueId: string;
  category: SponsorCategory;
  sponsorId: string;
  teamId: string | null;
  challengeId: string | null;
  enabled: boolean;
  lockedByAdmin: boolean;
  activationStart: string | null;
  activationEnd: string | null;
  sponsor: Sponsor | null;
  team: { teamId: string; teamName: string } | null;
  challenge: { challengeId: string; challengeName: string } | null;
}
