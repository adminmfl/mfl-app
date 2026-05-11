import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Card, Chip, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import {
  useLeaderboardChallengeOptions,
  useLeaderboardChallengeScores,
} from '../hooks/use-challenge-leaderboard';
import type { ChallengeOption } from '../hooks/use-challenge-leaderboard';
import { formatNumber } from '../utils/leaderboard-format';
import { RankBadge } from './rank-badge';

export function ChallengeLeaderboardSection({ leagueId }: { leagueId: string }) {
  const optionsQuery = useLeaderboardChallengeOptions(leagueId);
  const [selectedChallengeId, setSelectedChallengeId] = useState('');

  const options = optionsQuery.data ?? [];
  const selectedChallenge = useMemo(
    () => options.find((challenge) => challenge.id === selectedChallengeId),
    [options, selectedChallengeId],
  );
  const scoresQuery = useLeaderboardChallengeScores(
    leagueId,
    selectedChallengeId,
  );

  useEffect(() => {
    if (!selectedChallengeId && options.length > 0) {
      setSelectedChallengeId(options[0]!.id);
    }
  }, [options, selectedChallengeId]);

  if (optionsQuery.isLoading) {
    return (
      <View className="items-center py-8">
        <Spinner size="sm" />
        <AppText className="mt-2 text-sm text-muted">
          Loading challenge rankings...
        </AppText>
      </View>
    );
  }

  if (optionsQuery.isError) {
    return (
      <View className="rounded-lg bg-danger-50 p-4">
        <AppText className="text-sm" style={{ color: mflColors.danger }}>
          {optionsQuery.error?.message || 'Failed to load challenges.'}
        </AppText>
      </View>
    );
  }

  return (
    <View className="gap-4">
      <View>
        <SectionLabel label="Challenge Rankings" />
        <AppText className="mt-1 text-xs text-muted">
          Team rankings by challenge
        </AppText>
      </View>

      {options.length === 0 ? (
        <View className="rounded-lg bg-default-100 p-5">
          <AppText className="text-center text-sm text-muted">
            No completed challenges yet.
          </AppText>
        </View>
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2 pr-2">
              {options.map((challenge) => (
                <ChallengeChip
                  key={challenge.id}
                  challenge={challenge}
                  selected={challenge.id === selectedChallengeId}
                  onPress={() => setSelectedChallengeId(challenge.id)}
                />
              ))}
            </View>
          </ScrollView>

          {selectedChallenge ? (
            <View
              className="rounded-lg p-3"
              style={{ backgroundColor: mflColors.surface }}
            >
              <AppText className="text-base font-bold text-foreground">
                {selectedChallenge.name}
              </AppText>
              <AppText className="mt-0.5 text-xs text-muted">
                {getChallengeTypeLabel(selectedChallenge.challenge_type)}
                {selectedChallenge.total_points
                  ? ` - ${formatNumber(selectedChallenge.total_points)} pts`
                  : ''}
              </AppText>
            </View>
          ) : null}

          {scoresQuery.isLoading ? (
            <View className="items-center py-8">
              <Spinner size="sm" />
              <AppText className="mt-2 text-sm text-muted">
                Loading rankings...
              </AppText>
            </View>
          ) : null}

          {scoresQuery.isError ? (
            <View className="rounded-lg bg-danger-50 p-4">
              <AppText className="text-sm" style={{ color: mflColors.danger }}>
                {scoresQuery.error?.message || 'Failed to load scores.'}
              </AppText>
            </View>
          ) : null}

          {!scoresQuery.isLoading &&
          !scoresQuery.isError &&
          (scoresQuery.data ?? []).length === 0 ? (
            <View className="rounded-lg bg-default-100 p-5">
              <AppText className="text-center text-sm text-muted">
                No scores yet for this challenge.
              </AppText>
            </View>
          ) : null}

          <View className="gap-3">
            {(scoresQuery.data ?? []).map((score) => (
              <Card key={score.id} className="p-4">
                <View className="flex-row items-center gap-3">
                  <RankBadge rank={score.rank} />
                  <View className="flex-1">
                    <AppText className="text-sm font-bold text-foreground" numberOfLines={1}>
                      {score.name}
                    </AppText>
                    {score.teamName ? (
                      <AppText className="text-xs text-muted mt-0.5">
                        {score.teamName}
                      </AppText>
                    ) : null}
                  </View>
                  <View className="items-end">
                    <AppText className="text-lg font-bold" style={{ color: mflColors.brand }}>
                      {formatNumber(score.score)}
                    </AppText>
                    <AppText className="text-[10px] text-muted">score</AppText>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

function ChallengeChip({
  challenge,
  selected,
  onPress,
}: {
  challenge: ChallengeOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="rounded-full px-3 py-2"
      style={{
        backgroundColor: selected ? mflColors.brandLight : mflColors.surface,
        borderWidth: 1,
        borderColor: selected ? mflColors.brand : mflColors.border,
      }}
      onPress={onPress}
    >
      <View className="flex-row items-center gap-2">
        <AppText
          className="text-xs font-semibold"
          style={{ color: selected ? mflColors.brand : mflColors.textSub }}
        >
          {challenge.name}
        </AppText>
        <Chip size="sm" variant="soft">
          <Chip.Label>{getChallengeTypeLabel(challenge.challenge_type)}</Chip.Label>
        </Chip>
      </View>
    </Pressable>
  );
}

function getChallengeTypeLabel(type: string) {
  if (type === 'individual') return 'Individual';
  if (type === 'team') return 'Team';
  if (type === 'sub_team') return 'Sub-Team';
  return type;
}
