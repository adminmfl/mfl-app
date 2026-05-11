import { Pressable, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Chip } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { Challenge } from '../types/challenge.model';
import {
  formatChallengeType,
  getStatusLabel,
  getStatusColors,
} from '../utils/challenge-config-utils';

interface ChallengeDetailHeaderProps {
  challenge: Challenge | null;
  onBack: () => void;
}

export function ChallengeDetailHeader({ challenge, onBack }: ChallengeDetailHeaderProps) {
  const statusColors = challenge ? getStatusColors(challenge.status) : null;

  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onBack}
          hitSlop={12}
          className="w-9 h-9 rounded-lg items-center justify-center bg-default-100"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={22} color={mflColors.text} />
        </Pressable>
        <AppText className="text-2xl font-bold text-foreground flex-1" numberOfLines={1}>
          {challenge?.name ?? 'Challenge'}
        </AppText>
      </View>

      {challenge && (
        <View className="flex-row gap-2 flex-wrap">
          {statusColors && (
            <Chip size="sm" variant="soft" style={{ backgroundColor: statusColors.bgColor }}>
              <Chip.Label style={{ color: statusColors.color }}>
                {getStatusLabel(challenge.status)}
              </Chip.Label>
            </Chip>
          )}
          <Chip size="sm" variant="soft" style={{ backgroundColor: mflColors.blueLight }}>
            <Chip.Label style={{ color: mflColors.blue }}>
              {formatChallengeType(challenge.challengeType)}
            </Chip.Label>
          </Chip>
        </View>
      )}
    </View>
  );
}
