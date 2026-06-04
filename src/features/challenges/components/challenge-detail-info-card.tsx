import { Linking, Pressable, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { Challenge } from '../types/challenge.model';
import { formatChallengeDate } from '../utils/challenge-config-utils';

interface ChallengeDetailInfoCardProps {
  challenge: Challenge;
}

export function ChallengeDetailInfoCard({ challenge }: ChallengeDetailInfoCardProps) {
  return (
    <Card className="shadow-none border border-separator gap-3 p-4">
      {challenge.description ? (
        <AppText className="text-base text-default-500">{challenge.description}</AppText>
      ) : null}

      <View className="flex-row flex-wrap gap-x-6 gap-y-2">
        <InfoItem
          icon="award"
          label="Points"
          value={String(challenge.totalPoints)}
        />
        <InfoItem
          icon="calendar"
          label="Start"
          value={formatChallengeDate(challenge.startDate)}
        />
        <InfoItem
          icon="calendar"
          label="End"
          value={formatChallengeDate(challenge.endDate)}
        />
      </View>

      {challenge.docUrl ? (
        <Pressable
          className="flex-row items-center gap-2 mt-1"
          onPress={() => Linking.openURL(challenge.docUrl!)}
          accessibilityRole="link"
        >
          <Feather name="file-text" size={14} color={mflColors.blue} />
          <AppText className="text-sm font-semibold" style={{ color: mflColors.blue }}>
            View Challenge Rules
          </AppText>
        </Pressable>
      ) : null}
    </Card>
  );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Feather name={icon as any} size={13} color={mflColors.textMuted} />
      <AppText className="text-xs text-muted">{label}:</AppText>
      <AppText className="text-xs font-semibold text-foreground">{value}</AppText>
    </View>
  );
}
