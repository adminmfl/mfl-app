export type ChallengeType = 'individual' | 'team' | 'sub_team' | 'tournament';
export type ChallengeStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'submission_closed'
  | 'published'
  | 'closed';

export interface Challenge {
  challengeId: string;
  leagueId: string;
  name: string;
  description: string | null;
  challengeType: ChallengeType;
  totalPoints: number;
  isCustom: boolean;
  isUniqueWorkout: boolean;
  docUrl: string | null;
  templateId: string | null;
  startDate: string | null;
  endDate: string | null;
  status: ChallengeStatus;
  mySubmission: any | null;
  stats: { pending: number; approved: number; rejected: number } | null;
}

export interface ChallengePreset {
  presetId: string;
  name: string;
  description: string | null;
  docUrl: string | null;
  challengeType: ChallengeType;
}

export interface ChallengeSubmission {
  submissionId: string;
  leagueMemberId: string;
  teamId: string | null;
  subTeamId: string | null;
  userId: string;
  username: string;
  teamName: string | null;
  proofUrl: string | null;
  status: 'pending' | 'approved' | 'rejected';
  pointsAwarded: number | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface ChallengeLeaderboardEntry {
  teamId: string;
  teamName: string;
  score: number;
  rank: number;
}

export interface ChallengeTeam {
  teamId: string;
  teamName: string;
  memberCount: number;
}

export interface ChallengeSubTeam {
  subTeamId: string;
  name: string;
}

export interface ChallengeSubTeamMember {
  leagueMemberId: string;
  userId: string;
  fullName: string;
}

export interface ChallengeSubTeamDetails extends ChallengeSubTeam {
  teamId: string;
  members: ChallengeSubTeamMember[];
}

export interface ChallengeTeamMember {
  leagueMemberId: string;
  userId: string;
  fullName: string;
}

export type TournamentMatchStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface TournamentMatch {
  matchId: string;
  leagueChallengeId: string;
  roundNumber: number;
  roundName: string | null;
  groupId: string | null;
  team1Id: string | null;
  team2Id: string | null;
  team1Name: string | null;
  team2Name: string | null;
  score1: number;
  score2: number;
  winnerId: string | null;
  status: TournamentMatchStatus;
  startTime: string | null;
  location: string | null;
}

export interface TournamentMatchInput {
  roundNumber: number;
  roundName: string;
  team1Id: string;
  team2Id: string;
  startTime: string;
  status: TournamentMatchStatus;
  score1: number;
  score2: number;
}

export interface TournamentScore {
  teamId: string;
  score: number;
}
