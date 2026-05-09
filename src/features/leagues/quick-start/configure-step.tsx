import Feather from '@expo/vector-icons/Feather';
import { Pressable, TextInput, View } from 'react-native';
import { Button } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { QuickStartLeagueType } from './quick-start.types';
import { formatDate, getTeamCount, getTomorrowString } from './quick-start.types';

interface Props {
  leagueType: QuickStartLeagueType;
  setLeagueType: (t: QuickStartLeagueType) => void;
  playerCount: number;
  setPlayerCount: (n: number) => void;
  leagueName: string;
  setLeagueName: (s: string) => void;
  startDate: string;
  setStartDate: (s: string) => void;
  autoName: string;
  endDate: string;
  onBack: () => void;
  onNext: () => void;
}

const inputStyle = {
  backgroundColor: mflColors.white,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 15,
  color: mflColors.text,
} as const;

export function ConfigureStep({
  leagueType,
  setLeagueType,
  playerCount,
  setPlayerCount,
  leagueName,
  setLeagueName,
  startDate,
  setStartDate,
  autoName,
  endDate,
  onBack,
  onNext,
}: Props) {
  const teamCount = getTeamCount(playerCount);
  const minDate = getTomorrowString();

  return (
    <View className="gap-5">
      <View>
        <AppText className="text-lg font-bold text-foreground">Configure Your League</AppText>
        <AppText className="text-sm text-muted">
          Customize the basics. Everything else is pre-set.
        </AppText>
      </View>

      {/* League type toggle */}
      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">League Type</AppText>
        <View className="flex-row gap-2">
          <TypeButton
            icon="briefcase"
            label="Corporate"
            selected={leagueType === 'corporate'}
            onPress={() => setLeagueType('corporate')}
          />
          <TypeButton
            icon="home"
            label="Residential"
            selected={leagueType === 'residential'}
            onPress={() => setLeagueType('residential')}
          />
        </View>
      </View>

      {/* Player count */}
      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">Number of Players</AppText>
        <TextInput
          style={inputStyle}
          value={String(playerCount)}
          onChangeText={(t) => {
            const n = parseInt(t) || 0;
            setPlayerCount(Math.max(0, n));
          }}
          placeholder="20"
          placeholderTextColor={mflColors.textMuted}
          keyboardType="number-pad"
          maxLength={3}
        />
        <AppText className="text-xs text-muted">
          Min 4, max 120 players. We will auto-create {teamCount} teams.
        </AppText>
      </View>

      {/* League name */}
      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">
          League Name{' '}
          <AppText className="text-xs text-muted">(optional)</AppText>
        </AppText>
        <TextInput
          style={inputStyle}
          value={leagueName}
          onChangeText={setLeagueName}
          placeholder={autoName}
          placeholderTextColor={mflColors.textMuted}
          maxLength={100}
        />
      </View>

      {/* Start date */}
      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">Start Date</AppText>
        <TextInput
          style={inputStyle}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={mflColors.textMuted}
          maxLength={10}
          keyboardType="numbers-and-punctuation"
        />
        <AppText className="text-xs text-muted">
          Ends on {endDate ? formatDate(endDate) : '...'}
        </AppText>
        {startDate < minDate && startDate.length === 10 && (
          <AppText className="text-xs" style={{ color: mflColors.danger }}>
            Start date must be tomorrow or later.
          </AppText>
        )}
      </View>

      {/* Navigation */}
      <View className="flex-row gap-3 mt-2">
        <Button variant="secondary" size="lg" onPress={onBack} className="flex-1">
          <Button.Label>Back</Button.Label>
        </Button>
        <Button variant="primary" size="lg" onPress={onNext} className="flex-1">
          <Button.Label>Review</Button.Label>
        </Button>
      </View>
    </View>
  );
}

function TypeButton({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center gap-1 py-3 rounded-xl"
      style={{
        backgroundColor: selected ? mflColors.brand : mflColors.white,
        borderWidth: 1,
        borderColor: selected ? mflColors.brand : mflColors.border,
      }}
    >
      <Feather name={icon} size={20} color={selected ? mflColors.white : mflColors.textMuted} />
      <AppText
        className="text-xs font-medium"
        style={{ color: selected ? mflColors.white : mflColors.text }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
