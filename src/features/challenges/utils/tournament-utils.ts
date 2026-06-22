import type { ChallengeTeam, TournamentMatch } from '../types/challenge.model';

export function groupMatches(matches: TournamentMatch[]): [string, TournamentMatch[]][] {
  const grouped = new Map<string, TournamentMatch[]>();
  matches.forEach((match) => {
    const roundName = match.roundName || `Round ${match.roundNumber}`;
    grouped.set(roundName, [...(grouped.get(roundName) ?? []), match]);
  });
  return Array.from(grouped.entries());
}

export function buildStandings(teams: ChallengeTeam[], matches: TournamentMatch[]) {
  const stats = new Map(
    teams.map((team) => [
      team.teamId,
      {
        teamId: team.teamId,
        teamName: team.teamName,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalDifference: 0,
      },
    ]),
  );

  matches.forEach((match) => {
    if (match.status !== 'completed' || !match.team1Id || !match.team2Id) return;
    const team1 = stats.get(match.team1Id);
    const team2 = stats.get(match.team2Id);
    if (!team1 || !team2) return;

    team1.played += 1;
    team2.played += 1;
    team1.goalsFor += match.score1;
    team2.goalsFor += match.score2;
    team1.goalDifference += match.score1 - match.score2;
    team2.goalDifference += match.score2 - match.score1;

    if (match.score1 > match.score2) {
      team1.won += 1;
      team1.points += 3;
      team2.lost += 1;
      team2.points += 1;
    } else if (match.score2 > match.score1) {
      team2.won += 1;
      team2.points += 3;
      team1.lost += 1;
      team1.points += 1;
    } else {
      team1.drawn += 1;
      team2.drawn += 1;
      team1.points += 2;
      team2.points += 2;
    }
  });

  return Array.from(stats.values()).sort(
    (a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor,
  );
}
