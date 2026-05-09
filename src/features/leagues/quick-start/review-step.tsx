import Feather from '@expo/vector-icons/Feather';
import { View } from 'react-native';
import { Button, Spinner } from 'heroui-native';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { formatDate, getTeamCount, type QuickStartLeagueType, type QuickStartTemplate } from './quick-start.types';

interface Props {
  template: QuickStartTemplate;
  leagueType: QuickStartLeagueType;
  playerCount: number;
  effectiveName: string;
  startDate: string;
  endDate: string;
  loading: boolean;
  onBack: () => void;
  onCreate: () => void;
}

export function ReviewStep({
  template,
  leagueType,
  playerCount,
  effectiveName,
  startDate,
  endDate,
  loading,
  onBack,
  onCreate,
}: Props) {
  const teamCount = getTeamCount(playerCount);
  const typeLabel = leagueType === 'corporate' ? 'Corporate' : 'Residential';

  return (
    <View className="gap-5">
      <View>
        <AppText className="text-lg font-bold text-foreground">Review & Create</AppText>
        <AppText className="text-sm text-muted">
          Confirm your league details and you are good to go.
        </AppText>
      </View>

      <Card className="p-4 gap-3">
        {/* League name & subtitle */}
        <View className="flex-row items-center gap-2">
          <Feather name="zap" size={18} color={mflColors.brand} />
          <AppText className="text-base font-bold text-foreground flex-1" numberOfLines={2}>
            {effectiveName}
          </AppText>
        </View>
        <AppText className="text-xs text-muted">
          {template.title} &middot; {typeLabel}
        </AppText>

        {/* Stats grid */}
        <View className="flex-row flex-wrap gap-2 mt-1">
          <StatChip icon="calendar" label="Duration" value={`${template.duration} days`} />
          <StatChip icon="users" label="Players" value={String(playerCount)} />
          <StatChip icon="users" label="Teams" value={String(teamCount)} />
          <StatChip icon="activity" label="Activities" value={String(template.activities)} />
          <StatChip icon="coffee" label="Rest Days" value={String(template.restDays)} />
          <StatChip
            icon={leagueType === 'corporate' ? 'briefcase' : 'home'}
            label="Type"
            value={typeLabel}
          />
        </View>

        {/* Date range */}
        <View className="rounded-lg p-3 gap-1 mt-1" style={{ backgroundColor: mflColors.inkLight }}>
          <View className="flex-row justify-between">
            <AppText className="text-sm text-muted">Starts</AppText>
            <AppText className="text-sm font-medium text-foreground">{formatDate(startDate)}</AppText>
          </View>
          <View className="flex-row justify-between">
            <AppText className="text-sm text-muted">Ends</AppText>
            <AppText className="text-sm font-medium text-foreground">{formatDate(endDate)}</AppText>
          </View>
        </View>

        {/* Activity chips */}
        <View className="flex-row flex-wrap gap-1.5 mt-1">
          {template.activityList.map((activity) => (
            <View
              key={activity}
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: mflColors.brandLight }}
            >
              <AppText className="text-[11px] font-medium" style={{ color: mflColors.brand }}>
                {activity}
              </AppText>
            </View>
          ))}
        </View>
      </Card>

      {/* Navigation */}
      <View className="flex-row gap-3">
        <Button variant="secondary" size="lg" onPress={onBack} isDisabled={loading} className="flex-1">
          <Button.Label>Back</Button.Label>
        </Button>
        <Button
          variant="primary"
          size="lg"
          onPress={onCreate}
          isDisabled={loading}
          className="flex-1"
          style={{ backgroundColor: mflColors.brand }}
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label>Create League</Button.Label>
          )}
        </Button>
      </View>
    </View>
  );
}

function StatChip({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View
      className="flex-row items-center gap-2 p-2 rounded-lg"
      style={{ backgroundColor: mflColors.inkLight, minWidth: '45%', flexGrow: 1 }}
    >
      <Feather name={icon} size={14} color={mflColors.brand} />
      <View className="flex-1">
        <AppText className="text-[10px] text-muted">{label}</AppText>
        <AppText className="text-sm font-semibold text-foreground">{value}</AppText>
      </View>
    </View>
  );
}
