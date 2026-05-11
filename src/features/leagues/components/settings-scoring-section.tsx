import { View, TextInput } from 'react-native';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { ToggleRow, PickerRow, Divider, inputStyle } from './settings-form-fields';
import { mflColors } from '../../../constants/colors';

interface Props {
  rrFormula: string;
  leagueMode: string;
  normalizePointsByTeamSize: boolean;
  tieredRankEnabled: boolean;
  tieredRankTop: string;
  tieredRankMiddle: string;
  tieredRankBottom: string;
  aiDailyQuestionLimit: number;
  onChangeRrFormula: (v: string) => void;
  onChangeLeagueMode: (v: string) => void;
  onToggleNormalize: () => void;
  onToggleTieredRank: () => void;
  onChangeTieredTop: (v: string) => void;
  onChangeTieredMiddle: (v: string) => void;
  onChangeTieredBottom: (v: string) => void;
  onChangeAiLimit: (v: number) => void;
}

const FORMULA_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'simple', label: 'Simple' },
  { value: 'points_only', label: 'Points Only' },
];

const MODE_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'challenges_only', label: 'Challenges Only' },
];

export function SettingsScoringSection({
  rrFormula,
  leagueMode,
  normalizePointsByTeamSize,
  tieredRankEnabled,
  tieredRankTop,
  tieredRankMiddle,
  tieredRankBottom,
  aiDailyQuestionLimit,
  onChangeRrFormula,
  onChangeLeagueMode,
  onToggleNormalize,
  onToggleTieredRank,
  onChangeTieredTop,
  onChangeTieredMiddle,
  onChangeTieredBottom,
  onChangeAiLimit,
}: Props) {
  return (
    <View className="gap-3">
      <SectionLabel label="SCORING & AI" />
      <Card className="p-4">
        <PickerRow
          label="Scoring Formula"
          description={
            rrFormula === 'standard'
              ? 'Metric-based RR calculation (default)'
              : rrFormula === 'simple'
                ? 'Binary: 1.0 if activity done, 0 otherwise'
                : 'Always 1.0 RR — scoring via points per session'
          }
          value={rrFormula}
          options={FORMULA_OPTIONS}
          onChange={onChangeRrFormula}
        />
        <Divider />
        <PickerRow
          label="League Mode"
          description={
            leagueMode === 'challenges_only'
              ? 'Challenges only — activity submissions are disabled'
              : 'Activities + Challenges (default)'
          }
          value={leagueMode}
          options={MODE_OPTIONS}
          onChange={onChangeLeagueMode}
        />
        <Divider />
        <ToggleRow
          label="Point Normalization"
          description="Normalize using: (raw_points / team_size) x max_team_size."
          value={normalizePointsByTeamSize}
          onToggle={onToggleNormalize}
        />
        <Divider />
        <ToggleRow
          label="Tiered Leaderboard Visibility"
          description="Hide exact ranks for lower performers. Top tier sees exact rank, middle sees a band, bottom sees an encouraging message."
          value={tieredRankEnabled}
          onToggle={onToggleTieredRank}
        />

        {tieredRankEnabled && (
          <View className="mt-2 ml-2 gap-2">
            <View className="flex-row gap-2">
              <View className="flex-1 gap-1">
                <AppText className="text-xs text-muted">Top %</AppText>
                <TextInput
                  style={[inputStyle, { paddingVertical: 8, fontSize: 14 }]}
                  value={tieredRankTop}
                  onChangeText={onChangeTieredTop}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
              <View className="flex-1 gap-1">
                <AppText className="text-xs text-muted">Mid %</AppText>
                <TextInput
                  style={[inputStyle, { paddingVertical: 8, fontSize: 14 }]}
                  value={tieredRankMiddle}
                  onChangeText={onChangeTieredMiddle}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
              <View className="flex-1 gap-1">
                <AppText className="text-xs text-muted">Bot %</AppText>
                <TextInput
                  style={[inputStyle, { paddingVertical: 8, fontSize: 14 }]}
                  value={tieredRankBottom}
                  onChangeText={onChangeTieredBottom}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
            </View>
            {Number(tieredRankTop) + Number(tieredRankMiddle) + Number(tieredRankBottom) !== 100 && (
              <AppText className="text-xs" style={{ color: mflColors.danger }}>
                Percentages must sum to 100%
              </AppText>
            )}
          </View>
        )}

        <Divider />
        <View className="flex-row items-center justify-between py-3">
          <View className="flex-1 mr-4">
            <AppText className="text-sm font-medium text-foreground">AI Coach Daily Question Limit</AppText>
            <AppText className="text-xs text-muted mt-0.5">Max questions per player per day (1-100).</AppText>
          </View>
          <TextInput
            style={[inputStyle, { width: 64, textAlign: 'center', paddingVertical: 8 }]}
            value={String(aiDailyQuestionLimit)}
            onChangeText={(v) => {
              const n = parseInt(v, 10);
              if (!isNaN(n) && n >= 1 && n <= 100) onChangeAiLimit(n);
              else if (v === '') onChangeAiLimit(1);
            }}
            keyboardType="number-pad"
            maxLength={3}
          />
        </View>
      </Card>
    </View>
  );
}
