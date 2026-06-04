import { View, Pressable } from 'react-native';
import { Card, Spinner } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { severityColor } from '../utils/colors';
import type { Intervention } from '../types/ai-manager.model';

interface AlertCardProps {
  alert: Intervention;
  isGenerating: boolean;
  onGenerateDraft: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function AlertCard({ alert, isGenerating, onGenerateDraft, onDismiss }: AlertCardProps) {
  const sevColor = severityColor(alert.severity);
  const isPending = alert.status === 'pending';

  return (
    <Card
      className="p-4 mb-3"
      style={isPending ? { borderLeftWidth: 3, borderLeftColor: '#F59E0B' } : undefined}
    >
      {/* Header */}
      <View className="flex-row items-center flex-wrap mb-2" style={{ gap: 6 }}>
        <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: sevColor.bg }}>
          <AppText className="text-[10px] font-bold" style={{ color: sevColor.text }}>
            {alert.severity.toUpperCase()}
          </AppText>
        </View>
        <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: mflColors.inkLight }}>
          <AppText className="text-[10px] font-medium" style={{ color: mflColors.textSub }}>
            {alert.triggerType.replace(/_/g, ' ')}
          </AppText>
        </View>
        <View
          className="rounded-full px-2 py-0.5 ml-auto"
          style={{ backgroundColor: mflColors.inkLight }}
        >
          <AppText className="text-[10px] font-medium" style={{ color: mflColors.textSub }}>
            {alert.status}
          </AppText>
        </View>
      </View>

      {/* Title & Description */}
      <AppText className="text-sm font-semibold text-foreground mb-1">{alert.title}</AppText>
      <AppText className="text-xs text-muted mb-1">{alert.description}</AppText>
      <AppText className="text-xs italic text-muted mb-3">{alert.suggestedAction}</AppText>

      {/* Actions */}
      {isPending && (
        <View className="flex-row" style={{ gap: 8 }}>
          <Pressable
            className="flex-row items-center rounded-lg px-3 py-2"
            style={{ backgroundColor: mflColors.brand }}
            onPress={() => onGenerateDraft(alert.id)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Spinner size="sm" className="mr-1" />
            ) : (
              <Feather name="message-circle" size={14} color="#fff" style={{ marginRight: 4 }} />
            )}
            <AppText className="text-xs font-semibold" style={{ color: '#fff' }}>
              Generate Message
            </AppText>
          </Pressable>
          <Pressable
            className="flex-row items-center rounded-lg px-3 py-2"
            style={{ backgroundColor: mflColors.inkLight }}
            onPress={() => onDismiss(alert.id)}
          >
            <Feather name="x" size={14} color={mflColors.textSub} style={{ marginRight: 4 }} />
            <AppText className="text-xs font-medium" style={{ color: mflColors.textSub }}>
              Dismiss
            </AppText>
          </Pressable>
        </View>
      )}
    </Card>
  );
}
