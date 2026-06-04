import { View, Pressable, ActivityIndicator } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import type { WeeklyInsight } from '../types/ai-coach.model';

interface WeeklyInsightCardProps {
  insight: WeeklyInsight | null;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function WeeklyInsightCard({ insight, isGenerating, onGenerate }: WeeklyInsightCardProps) {
  return (
    <View className="mb-2">
      <View className="flex-row items-center justify-between mb-1.5">
        <AppText className="text-xs font-medium text-muted">Weekly Insight</AppText>
        <Pressable
          onPress={onGenerate}
          disabled={isGenerating}
          hitSlop={8}
          className="flex-row items-center gap-1 px-2 py-1 rounded"
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Feather name="refresh-cw" size={12} color="#3B82F6" />
          )}
          <AppText className="text-xs" style={{ color: '#3B82F6' }}>
            {insight ? 'Refresh' : 'Generate'}
          </AppText>
        </Pressable>
      </View>
      {insight ? (
        <Card className="p-3">
          <View className="flex-row items-start">
            <View
              className="w-7 h-7 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: '#DBEAFE' }}
            >
              <Feather name="calendar" size={14} color="#3B82F6" />
            </View>
            <AppText className="text-xs text-foreground flex-1" style={{ lineHeight: 18 }}>
              {insight.content}
            </AppText>
          </View>
        </Card>
      ) : (
        <AppText className="text-xs text-muted italic">
          Tap Generate for your weekly performance summary.
        </AppText>
      )}
    </View>
  );
}
