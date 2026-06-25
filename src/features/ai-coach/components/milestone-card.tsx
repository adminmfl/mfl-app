import { View, Pressable } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { Milestone } from '../types/ai-coach.model';

interface MilestoneCardProps {
  milestone: Milestone;
  onDismiss: (id: string) => void;
}

export function MilestoneCard({ milestone, onDismiss }: MilestoneCardProps) {
  return (
    <Card className="p-3 mb-2">
      <View className="flex-row items-start">
        <View
          className="w-7 h-7 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: mflColors.amberLight }}
        >
          <Feather name="award" size={14} color={mflColors.amber} />
        </View>
        <View className="flex-1 mr-2">
          <AppText className="text-sm font-semibold text-foreground">
            {milestone.title}
          </AppText>
          <AppText className="text-xs text-muted mt-0.5">
            {milestone.content}
          </AppText>
        </View>
        <Pressable
          onPress={() => onDismiss(milestone.id)}
          hitSlop={8}
          className="p-1"
        >
          <Feather name="x" size={14} color={mflColors.textMuted} />
        </Pressable>
      </View>
    </Card>
  );
}
