export interface PartnerActivity {
  date: string;
  type: string;
  workoutType: string;
  rrValue: number;
  playerName: string;
  teamName: string;
  teamId: string | null;
}

export interface PartnerTeam {
  teamId: string;
  teamName: string;
}

export interface PartnerActivityData {
  activities: PartnerActivity[];
  teams: PartnerTeam[];
}
