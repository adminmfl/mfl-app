import Feather from '@expo/vector-icons/Feather';
import { View } from 'react-native';
import { Button } from 'heroui-native';

import { AppText } from '../../../../components/app-text';
import { ScreenScrollView } from '../../../../components/screen-scroll-view';
import { mflColors } from '../../../../constants/colors';

interface LeagueCreatedSuccessProps {
  leagueName: string;
  numTeams: number;
  maxParticipants: number;
  durationDays: number;
  onGoToDashboard: () => void;
}

export function LeagueCreatedSuccess({
  leagueName,
  numTeams,
  maxParticipants,
  durationDays,
  onGoToDashboard,
}: LeagueCreatedSuccessProps) {
  return (
    <ScreenScrollView>
      <View className="py-10 items-center gap-6">
        <View className="w-20 h-20 rounded-full items-center justify-center" style={{ backgroundColor: mflColors.brandLight }}>
          <Feather name="check" size={40} color={mflColors.brand} />
        </View>
        <View className="items-center gap-2">
          <AppText className="text-2xl font-bold text-foreground">League Created!</AppText>
          <AppText className="text-sm text-muted text-center">
            <AppText className="font-semibold" style={{ color: mflColors.brand }}>
              {leagueName}
            </AppText>{' '}
            has been created successfully.
          </AppText>
        </View>
        <View className="flex-row gap-4">
          <SuccessStat value={String(numTeams)} label="Teams" />
          <SuccessStat value={String(maxParticipants)} label="Capacity" />
          <SuccessStat value={String(durationDays)} label="Days" />
        </View>
        <View className="w-full gap-3 mt-4">
          <Button size="lg" style={{ backgroundColor: mflColors.brand }} onPress={onGoToDashboard} className="w-full">
            <Button.Label>Go to Dashboard</Button.Label>
          </Button>
        </View>
      </View>
    </ScreenScrollView>
  );
}

function SuccessStat({ value, label }: { value: string; label: string }) {
  return (
    <View className="items-center p-3 rounded-xl" style={{ backgroundColor: mflColors.brandLight }}>
      <AppText className="text-xl font-bold" style={{ color: mflColors.brand }}>{value}</AppText>
      <AppText className="text-xs text-muted">{label}</AppText>
    </View>
  );
}
