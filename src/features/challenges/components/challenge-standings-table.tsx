import { useMemo } from 'react';
import { View } from 'react-native';

import { AppText } from '../../../components/app-text';
import { ScreenState } from '../../../components/screen-state';
import type { TournamentMatch } from '../types/challenge.model';

interface ChallengeStandingsTableProps {
  matches: TournamentMatch[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

interface TeamStats {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalDifference: number;
}

export function ChallengeStandingsTable({
  matches,
  isLoading,
  isError,
  onRetry,
}: ChallengeStandingsTableProps) {
  const standings = useMemo(() => buildStandings(matches ?? []), [matches]);

  if (isLoading) {
    return <ScreenState screen="challenge-detail" state="loading" />;
  }

  if (isError) {
    return (
      <ScreenState
        screen="challenge-detail"
        state="error"
        actionLabel="Retry"
        onAction={onRetry}
      />
    );
  }

  if (standings.length === 0) {
    return (
      <ScreenState
        screen="challenge-detail"
        state="empty"
        message="No standings data yet"
      />
    );
  }

  return (
    <View className="gap-2">
      <View className="rounded-xl bg-default-100 p-3">
        <AppText className="text-xs text-muted">
          Win: 3 pts - Draw: 2 pts - Participated/Loss: 1 pt
        </AppText>
      </View>
      {standings.map((team, index) => (
        <View
          key={team.teamId}
          className="flex-row items-center rounded-xl border border-default-200 p-3 gap-3"
        >
          <AppText className="w-6 text-sm font-bold text-muted">{index + 1}</AppText>
          <View className="flex-1">
            <AppText className="text-sm font-bold text-foreground">{team.teamName}</AppText>
            <AppText className="text-xs text-muted">
              P {team.played} - W {team.won} - D {team.drawn} - L {team.lost}
            </AppText>
          </View>
          <AppText className="text-base font-bold text-foreground">{team.points}</AppText>
        </View>
      ))}
    </View>
  );
}

function buildStandings(matches: TournamentMatch[]): TeamStats[] {
  const stats = new Map<string, TeamStats>();

  const ensureTeam = (id: string | null, name: string | null) => {
    if (!id) return;
    if (!stats.has(id)) {
      stats.set(id, {
        teamId: id,
        teamName: name || 'Unknown',
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalDifference: 0,
      });
    }
  };

  matches.forEach((match) => {
    ensureTeam(match.team1Id, match.team1Name);
    ensureTeam(match.team2Id, match.team2Name);

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
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor,
  );
}
