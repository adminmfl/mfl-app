import Feather from '@expo/vector-icons/Feather';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';
import { Button, Card, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type {
  Challenge,
  ChallengeTeam,
  TournamentMatch,
  TournamentMatchInput,
  TournamentMatchStatus,
} from '../types/challenge.model';
import {
  useTournamentAdminActions,
  useTournamentMatches,
  useTournamentScores,
} from '../hooks/use-configure-challenges';
import { formatChallengeDate } from '../utils/challenge-config-utils';

type TournamentTab = 'fixtures' | 'standings' | 'scores';

const inputStyle = {
  backgroundColor: mflColors.card,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 10,
  fontSize: 15,
  color: mflColors.text,
};

const STATUS_OPTIONS: Array<{ value: TournamentMatchStatus; label: string }> = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface ChallengeTournamentPanelProps {
  leagueId: string;
  challenge: Challenge;
  teams: ChallengeTeam[];
  defaultTab: TournamentTab;
  onClose: () => void;
  onPublish: (challenge: Challenge) => Promise<void>;
}

export function ChallengeTournamentPanel({
  leagueId,
  challenge,
  teams,
  defaultTab,
  onClose,
  onPublish,
}: ChallengeTournamentPanelProps) {
  const [activeTab, setActiveTab] = useState<TournamentTab>(defaultTab);
  const [showMatchForm, setShowMatchForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<TournamentMatch | null>(null);
  const [matchForm, setMatchForm] = useState<TournamentMatchForm>(emptyMatchForm());
  const [scoreInputs, setScoreInputs] = useState<Record<string, string>>({});

  const matchesQuery = useTournamentMatches(leagueId, challenge.challengeId);
  const scoresQuery = useTournamentScores(leagueId, challenge.challengeId);
  const actions = useTournamentAdminActions(leagueId, challenge.challengeId);

  const matches = matchesQuery.data ?? [];

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, challenge.challengeId]);

  useEffect(() => {
    const next: Record<string, string> = {};
    teams.forEach((team) => {
      const existing = scoresQuery.data?.find((score) => score.teamId === team.teamId);
      next[team.teamId] = existing ? String(existing.score) : '';
    });
    setScoreInputs(next);
  }, [scoresQuery.data, teams]);

  const standings = useMemo(() => buildStandings(teams, matches), [matches, teams]);

  const startCreateMatch = () => {
    setEditingMatch(null);
    setMatchForm(emptyMatchForm());
    setShowMatchForm(true);
  };

  const startEditMatch = (match: TournamentMatch) => {
    setEditingMatch(match);
    setMatchForm({
      roundNumber: String(match.roundNumber || 1),
      roundName: match.roundName ?? '',
      team1Id: match.team1Id ?? '',
      team2Id: match.team2Id ?? '',
      startDate: match.startTime ? match.startTime.slice(0, 10) : '',
      status: match.status,
      score1: String(match.score1 ?? 0),
      score2: String(match.score2 ?? 0),
    });
    setShowMatchForm(true);
  };

  const resetMatchForm = () => {
    setShowMatchForm(false);
    setEditingMatch(null);
    setMatchForm(emptyMatchForm());
  };

  const handleSaveMatch = async () => {
    if (matchForm.team1Id && matchForm.team1Id === matchForm.team2Id) {
      Alert.alert('Invalid Teams', 'Team 1 and Team 2 must be different.');
      return;
    }

    const input: TournamentMatchInput = {
      roundNumber: Math.max(1, Number(matchForm.roundNumber) || 1),
      roundName: matchForm.roundName.trim() || 'Group Stage',
      team1Id: matchForm.team1Id,
      team2Id: matchForm.team2Id,
      startTime: matchForm.startDate ? new Date(matchForm.startDate).toISOString() : '',
      status: matchForm.status,
      score1: Number(matchForm.score1) || 0,
      score2: Number(matchForm.score2) || 0,
    };

    try {
      if (editingMatch) {
        await actions.updateMutation.mutateAsync({ matchId: editingMatch.matchId, input });
        Alert.alert('Match Updated', 'The tournament match has been updated.');
      } else {
        await actions.createMutation.mutateAsync(input);
        Alert.alert('Match Created', 'The tournament match has been created.');
      }
      await matchesQuery.refetch();
      resetMatchForm();
    } catch (error) {
      Alert.alert('Save Failed', error instanceof Error ? error.message : 'Failed to save match.');
    }
  };

  const handleDeleteMatch = (match: TournamentMatch) => {
    Alert.alert('Delete Match?', 'Delete this tournament match?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await actions.deleteMutation.mutateAsync(match.matchId);
            await matchesQuery.refetch();
            Alert.alert('Match Deleted', 'The match has been deleted.');
          } catch (error) {
            Alert.alert('Delete Failed', error instanceof Error ? error.message : 'Failed to delete match.');
          }
        },
      },
    ]);
  };

  const handleFinalize = async () => {
    const scores = teams.map((team) => ({
      teamId: team.teamId,
      score: Number(scoreInputs[team.teamId]) || 0,
    }));

    if (scores.every((score) => score.score === 0)) {
      Alert.alert('No Scores Assigned', 'Assign points to at least one team.');
      return;
    }

    try {
      await actions.finalizeMutation.mutateAsync(scores);
      if (challenge.status !== 'published') {
        await onPublish(challenge);
      } else {
        Alert.alert('Scores Updated', 'Tournament points have been updated.');
      }
      await scoresQuery.refetch();
    } catch (error) {
      Alert.alert('Finalize Failed', error instanceof Error ? error.message : 'Failed to update tournament scores.');
    }
  };

  const isSaving =
    actions.createMutation.isPending ||
    actions.updateMutation.isPending ||
    actions.deleteMutation.isPending ||
    actions.finalizeMutation.isPending;

  return (
    <Card className="p-4 gap-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <AppText className="text-lg font-bold text-foreground">Manage Tournament</AppText>
          <AppText className="text-xs text-muted mt-1">
            Schedule matches, update scores, and publish tournament points for {challenge.name}.
          </AppText>
        </View>
        <Button variant="secondary" size="sm" onPress={onClose}>
          <Button.Label>Close</Button.Label>
        </Button>
      </View>

      <View className="flex-row rounded-xl bg-default-100 p-1">
        {(['fixtures', 'standings', 'scores'] as TournamentTab[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            className="flex-1 rounded-lg py-2"
            style={{ backgroundColor: activeTab === tab ? mflColors.card : 'transparent' }}
          >
            <AppText
              className="text-xs font-bold text-center uppercase"
              style={{ color: activeTab === tab ? mflColors.text : mflColors.textMuted }}
            >
              {tab}
            </AppText>
          </Pressable>
        ))}
      </View>

      {activeTab === 'fixtures' ? (
        <View className="gap-3">
          <Button variant="primary" size="md" onPress={startCreateMatch}>
            <Feather name="plus" size={16} color="#fff" />
            <Button.Label>Add Match</Button.Label>
          </Button>

          {showMatchForm ? (
            <MatchForm
              form={matchForm}
              teams={teams}
              isSaving={isSaving}
              editing={!!editingMatch}
              onChange={(patch) => setMatchForm((current) => ({ ...current, ...patch }))}
              onCancel={resetMatchForm}
              onSubmit={handleSaveMatch}
            />
          ) : null}

          {matchesQuery.isLoading ? (
            <View className="items-center py-4">
              <Spinner size="sm" />
            </View>
          ) : matches.length === 0 ? (
            <View className="rounded-xl border border-dashed border-default-200 p-4">
              <AppText className="text-sm text-muted text-center">No matches scheduled yet.</AppText>
            </View>
          ) : (
            <View className="gap-3">
              {groupMatches(matches).map(([roundName, roundMatches]) => (
                <View key={roundName} className="gap-2">
                  <AppText className="text-sm font-bold text-foreground">{roundName}</AppText>
                  {roundMatches.map((match) => (
                    <MatchCard
                      key={match.matchId}
                      match={match}
                      onEdit={() => startEditMatch(match)}
                      onDelete={() => handleDeleteMatch(match)}
                    />
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
      ) : null}

      {activeTab === 'standings' ? (
        <View className="gap-2">
          <View className="rounded-xl bg-default-100 p-3">
            <AppText className="text-xs text-muted">
              Win: 3 pts - Draw: 2 pts - Participated/Loss: 1 pt
            </AppText>
          </View>
          {standings.map((team, index) => (
            <View key={team.teamId} className="flex-row items-center rounded-xl border border-default-200 p-3 gap-3">
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
      ) : null}

      {activeTab === 'scores' ? (
        <View className="gap-3">
          <View className="rounded-xl bg-default-100 p-3">
            <AppText className="text-xs text-muted">
              Assign final leaderboard points to each team. Saving publishes the tournament when it is not already published.
            </AppText>
          </View>
          {scoresQuery.isLoading ? (
            <View className="items-center py-4">
              <Spinner size="sm" />
            </View>
          ) : (
            <View className="gap-3">
              {teams.map((team) => (
                <View key={team.teamId} className="flex-row items-center gap-3 rounded-xl border border-default-200 p-3">
                  <View className="w-9 h-9 rounded-full bg-default-100 items-center justify-center">
                    <AppText className="text-xs font-bold text-foreground">
                      {team.teamName.slice(0, 2).toUpperCase()}
                    </AppText>
                  </View>
                  <AppText className="flex-1 text-sm font-semibold text-foreground">{team.teamName}</AppText>
                  <TextInput
                    style={{ ...inputStyle, width: 86, textAlign: 'right' }}
                    value={scoreInputs[team.teamId] ?? ''}
                    onChangeText={(value) => setScoreInputs((current) => ({ ...current, [team.teamId]: value }))}
                    placeholder="0"
                    placeholderTextColor={mflColors.textMuted}
                    keyboardType="numeric"
                  />
                </View>
              ))}
              <Button
                variant="primary"
                size="lg"
                onPress={handleFinalize}
                isDisabled={isSaving}
              >
                {isSaving ? <Spinner size="sm" /> : <Button.Label>Save Scores</Button.Label>}
              </Button>
            </View>
          )}
        </View>
      ) : null}
    </Card>
  );
}

interface TournamentMatchForm {
  roundNumber: string;
  roundName: string;
  team1Id: string;
  team2Id: string;
  startDate: string;
  status: TournamentMatchStatus;
  score1: string;
  score2: string;
}

function emptyMatchForm(): TournamentMatchForm {
  return {
    roundNumber: '1',
    roundName: 'Group Stage',
    team1Id: '',
    team2Id: '',
    startDate: new Date().toISOString().slice(0, 10),
    status: 'scheduled',
    score1: '0',
    score2: '0',
  };
}

function MatchForm({
  form,
  teams,
  isSaving,
  editing,
  onChange,
  onCancel,
  onSubmit,
}: {
  form: TournamentMatchForm;
  teams: ChallengeTeam[];
  isSaving: boolean;
  editing: boolean;
  onChange: (patch: Partial<TournamentMatchForm>) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <View className="rounded-xl border border-default-200 p-3 gap-3">
      <AppText className="text-base font-bold text-foreground">
        {editing ? 'Edit Match' : 'Add Match'}
      </AppText>

      <View className="flex-row gap-3">
        <Field label="Round" className="flex-1">
          <TextInput
            style={inputStyle}
            value={form.roundNumber}
            onChangeText={(value) => onChange({ roundNumber: value })}
            keyboardType="numeric"
            placeholder="1"
            placeholderTextColor={mflColors.textMuted}
          />
        </Field>
        <Field label="Date" className="flex-1">
          <TextInput
            style={inputStyle}
            value={form.startDate}
            onChangeText={(value) => onChange({ startDate: value })}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={mflColors.textMuted}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />
        </Field>
      </View>

      <Field label="Round Name">
        <TextInput
          style={inputStyle}
          value={form.roundName}
          onChangeText={(value) => onChange({ roundName: value })}
          placeholder="Group Stage"
          placeholderTextColor={mflColors.textMuted}
        />
      </Field>

      <TeamPicker
        label="Team 1"
        teams={teams}
        value={form.team1Id}
        disabledTeamId={form.team2Id}
        onChange={(team1Id) => onChange({ team1Id })}
      />
      <TeamPicker
        label="Team 2"
        teams={teams}
        value={form.team2Id}
        disabledTeamId={form.team1Id}
        onChange={(team2Id) => onChange({ team2Id })}
      />

      <View className="gap-2">
        <AppText className="text-xs font-semibold text-muted uppercase">Status</AppText>
        <View className="flex-row flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => (
            <Pressable
              key={status.value}
              onPress={() => onChange({ status: status.value })}
              className="rounded-full border px-3 py-2"
              style={{
                backgroundColor: form.status === status.value ? mflColors.brand : mflColors.card,
                borderColor: form.status === status.value ? mflColors.brand : mflColors.border,
              }}
            >
              <AppText
                className="text-xs font-bold"
                style={{ color: form.status === status.value ? '#fff' : mflColors.text }}
              >
                {status.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      {form.status !== 'scheduled' || editing ? (
        <View className="flex-row gap-3">
          <Field label="Score 1" className="flex-1">
            <TextInput
              style={inputStyle}
              value={form.score1}
              onChangeText={(value) => onChange({ score1: value })}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={mflColors.textMuted}
            />
          </Field>
          <Field label="Score 2" className="flex-1">
            <TextInput
              style={inputStyle}
              value={form.score2}
              onChangeText={(value) => onChange({ score2: value })}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={mflColors.textMuted}
            />
          </Field>
        </View>
      ) : null}

      <View className="flex-row gap-3">
        <Button variant="secondary" size="md" onPress={onCancel} className="flex-1">
          <Button.Label>Cancel</Button.Label>
        </Button>
        <Button variant="primary" size="md" onPress={onSubmit} isDisabled={isSaving} className="flex-1">
          {isSaving ? <Spinner size="sm" /> : <Button.Label>Save Match</Button.Label>}
        </Button>
      </View>
    </View>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <View className={`gap-2 ${className ?? ''}`}>
      <AppText className="text-xs font-semibold text-muted uppercase">{label}</AppText>
      {children}
    </View>
  );
}

function TeamPicker({
  label,
  teams,
  value,
  disabledTeamId,
  onChange,
}: {
  label: string;
  teams: ChallengeTeam[];
  value: string;
  disabledTeamId: string;
  onChange: (teamId: string) => void;
}) {
  return (
    <View className="gap-2">
      <AppText className="text-xs font-semibold text-muted uppercase">{label}</AppText>
      <View className="flex-row flex-wrap gap-2">
        {teams.map((team) => {
          const selected = value === team.teamId;
          const disabled = disabledTeamId === team.teamId;
          return (
            <Pressable
              key={team.teamId}
              disabled={disabled}
              onPress={() => onChange(team.teamId)}
              className="rounded-full border px-3 py-2"
              style={{
                opacity: disabled ? 0.4 : 1,
                backgroundColor: selected ? mflColors.brand : mflColors.card,
                borderColor: selected ? mflColors.brand : mflColors.border,
              }}
            >
              <AppText
                className="text-xs font-bold"
                style={{ color: selected ? '#fff' : mflColors.text }}
              >
                {team.teamName}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MatchCard({
  match,
  onEdit,
  onDelete,
}: {
  match: TournamentMatch;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View className="rounded-xl border border-default-200 overflow-hidden">
      <View className="flex-row items-center justify-between bg-default-100 px-3 py-2">
        <AppText className="text-xs text-muted">
          {formatChallengeDate(match.startTime)} - {match.status}
        </AppText>
        <View className="flex-row gap-2">
          <Button variant="secondary" size="sm" onPress={onEdit}>
            <Button.Label>Edit</Button.Label>
          </Button>
          <Button variant="secondary" size="sm" onPress={onDelete}>
            <Button.Label style={{ color: mflColors.danger }}>Delete</Button.Label>
          </Button>
        </View>
      </View>
      <View className="flex-row items-center p-4 gap-3">
        <TeamMatchSide name={match.team1Name || 'TBD'} />
        <View className="items-center px-2">
          <AppText className="text-xl font-bold text-foreground">
            {match.status === 'scheduled' ? 'vs' : `${match.score1} - ${match.score2}`}
          </AppText>
        </View>
        <TeamMatchSide name={match.team2Name || 'TBD'} />
      </View>
    </View>
  );
}

function TeamMatchSide({ name }: { name: string }) {
  return (
    <View className="flex-1 items-center gap-2">
      <View className="w-10 h-10 rounded-full bg-default-100 items-center justify-center">
        <Feather name="shield" size={18} color={mflColors.brand} />
      </View>
      <AppText className="text-sm font-semibold text-foreground text-center" numberOfLines={2}>
        {name}
      </AppText>
    </View>
  );
}

function groupMatches(matches: TournamentMatch[]) {
  const grouped = new Map<string, TournamentMatch[]>();
  matches.forEach((match) => {
    const roundName = match.roundName || `Round ${match.roundNumber}`;
    grouped.set(roundName, [...(grouped.get(roundName) ?? []), match]);
  });
  return Array.from(grouped.entries());
}

function buildStandings(teams: ChallengeTeam[], matches: TournamentMatch[]) {
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
