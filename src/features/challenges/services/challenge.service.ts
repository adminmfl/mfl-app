/**
 * challenge.service.ts — re-export barrel.
 *
 * The original monolithic service has been split into focused modules:
 *   challenge-fetch.service.ts    — read/query operations
 *   challenge-mutation.service.ts — write/admin operations
 *   challenge-upload.service.ts   — file upload operations
 *
 * All existing imports from this path continue to work unchanged.
 */

export {
  fetchChallenges,
  fetchChallengeSubmissions,
  fetchChallengeLeaderboard,
  fetchChallengeTeams,
  fetchChallengeSubTeams,
  fetchChallengeSubTeamDetails,
  fetchChallengeTeamMembers,
  fetchTournamentMatches,
  fetchTournamentScores,
  toTournamentMatch,
} from './challenge-fetch.service';

export type { TournamentMatchRow } from './challenge-fetch.service';

export {
  createChallenge,
  updateChallenge,
  deleteChallenge,
  publishChallenge,
  validateChallengeSubmission,
  submitChallengeProof,
  assignChallengeTeamScore,
  createChallengeSubTeam,
  updateChallengeSubTeam,
  deleteChallengeSubTeam,
  createTournamentMatch,
  updateTournamentMatch,
  deleteTournamentMatch,
  finalizeTournamentScores,
} from './challenge-mutation.service';

export type { ChallengeMutationInput } from './challenge-mutation.service';

export {
  uploadChallengeDocument,
  uploadChallengeProof,
} from './challenge-upload.service';
