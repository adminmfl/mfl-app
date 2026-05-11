export interface AwardCard {
  title: string;
  subtitle: string;
  recipient: string;
  fallback: string;
  pointsLabel?: string;
}

export interface FinaleAwards {
  winnerAwards: AwardCard[];
  teamCharacterAwards: AwardCard[];
  leadershipAwards: AwardCard[];
  individualAwards: AwardCard[];
}
