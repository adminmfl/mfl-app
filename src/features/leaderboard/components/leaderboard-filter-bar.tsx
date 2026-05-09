import Feather from '@expo/vector-icons/Feather';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { Button, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { WeekPreset } from '../utils/leaderboard-format';
import { formatDateRange, isValidYmd } from '../utils/leaderboard-format';

export type LeaderboardTab = 'teams' | 'challenges';
export type WeekSelection = number | 'all' | 'custom';

export function LeaderboardFilterBar({
  activeTab,
  onTabChange,
  selectedWeek,
  weekPresets,
  onWeekSelect,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  onApplyCustomRange,
  onReset,
  onRefresh,
  isRefreshing,
}: {
  activeTab: LeaderboardTab;
  onTabChange: (tab: LeaderboardTab) => void;
  selectedWeek: WeekSelection;
  weekPresets: WeekPreset[];
  onWeekSelect: (week: WeekSelection) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (value: string) => void;
  onCustomEndChange: (value: string) => void;
  onApplyCustomRange: () => void;
  onReset: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const customValid = isValidYmd(customStart) && isValidYmd(customEnd);

  return (
    <View className="gap-3 rounded-xl border border-default-200 bg-white p-3">
      <View className="flex-row items-center gap-2">
        <SegmentButton
          label="Overall"
          icon="award"
          selected={activeTab === 'teams'}
          onPress={() => onTabChange('teams')}
        />
        <SegmentButton
          label="Challenges"
          icon="flag"
          selected={activeTab === 'challenges'}
          onPress={() => onTabChange('challenges')}
        />
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: mflColors.surface }}
          onPress={onRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Spinner size="sm" />
          ) : (
            <Feather name="refresh-cw" size={16} color={mflColors.textSub} />
          )}
        </Pressable>
      </View>

      {activeTab === 'teams' ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2 pr-2">
              <FilterChip
                label="All Time"
                selected={selectedWeek === 'all'}
                onPress={() => onWeekSelect('all')}
              />
              {[...weekPresets].reverse().map((week) => (
                <FilterChip
                  key={week.weekNumber}
                  label={`${week.label} (${formatDateRange(
                    week.startDate,
                    week.endDate,
                  )})`}
                  selected={selectedWeek === week.weekNumber}
                  onPress={() => onWeekSelect(week.weekNumber)}
                />
              ))}
              <FilterChip
                label="Custom"
                selected={selectedWeek === 'custom'}
                onPress={() => onWeekSelect('custom')}
              />
            </View>
          </ScrollView>

          {selectedWeek === 'custom' ? (
            <View className="gap-2">
              <View className="flex-row gap-2">
                <DateInput
                  value={customStart}
                  placeholder="Start YYYY-MM-DD"
                  onChangeText={onCustomStartChange}
                />
                <DateInput
                  value={customEnd}
                  placeholder="End YYYY-MM-DD"
                  onChangeText={onCustomEndChange}
                />
              </View>
              <View className="flex-row gap-2">
                <Button variant="secondary" size="sm" onPress={onReset} className="flex-1">
                  <Button.Label>Reset</Button.Label>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onPress={onApplyCustomRange}
                  isDisabled={!customValid}
                  className="flex-1"
                >
                  <Button.Label>Apply</Button.Label>
                </Button>
              </View>
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

function SegmentButton({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="h-10 flex-1 flex-row items-center justify-center gap-2 rounded-lg"
      style={{
        backgroundColor: selected ? mflColors.brandLight : mflColors.surface,
        borderWidth: 1,
        borderColor: selected ? mflColors.brand : mflColors.border,
      }}
      onPress={onPress}
    >
      <Feather
        name={icon}
        size={15}
        color={selected ? mflColors.brand : mflColors.textSub}
      />
      <AppText
        className="text-sm font-semibold"
        style={{ color: selected ? mflColors.brand : mflColors.textSub }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
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
      <AppText
        className="text-xs font-medium"
        style={{ color: selected ? mflColors.brand : mflColors.textSub }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function DateInput({
  value,
  placeholder,
  onChangeText,
}: {
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={mflColors.textMuted}
      keyboardType="numbers-and-punctuation"
      maxLength={10}
      className="flex-1 rounded-lg px-3 py-2 text-sm"
      style={{
        backgroundColor: mflColors.surface,
        borderWidth: 1,
        borderColor: mflColors.border,
        color: mflColors.text,
      }}
    />
  );
}
