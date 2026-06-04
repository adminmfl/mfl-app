import { View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { AiCoachMessage } from '../types/ai-coach.model';
import { renderCoachMarkdown } from '../utils/render-coach-markdown';

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface CoachMessageBubbleProps {
  message: AiCoachMessage;
}

export function CoachMessageBubble({ message }: CoachMessageBubbleProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View className="items-end mb-3">
        <View
          className="rounded-2xl px-4 py-3 max-w-[80%]"
          style={{ backgroundColor: mflColors.brand }}
        >
          <AppText className="text-sm" style={{ color: '#fff' }}>
            {message.content}
          </AppText>
        </View>
        <AppText className="text-[10px] text-muted mt-1">
          {formatTimestamp(message.createdAt)}
        </AppText>
      </View>
    );
  }

  return (
    <View className="items-start mb-3">
      <View className="flex-row items-start gap-2 max-w-[85%]">
        <View
          className="w-7 h-7 rounded-full items-center justify-center mt-1"
          style={{ backgroundColor: mflColors.brand }}
        >
          <AppText className="text-xs font-bold" style={{ color: '#fff' }}>
            AI
          </AppText>
        </View>
        <View
          className="bg-card rounded-2xl px-4 py-3 flex-1 border border-default-200"
          style={{ borderLeftWidth: 3, borderLeftColor: mflColors.brand }}
        >
          <AppText className="text-sm text-foreground">
            {renderCoachMarkdown(message.content, {
              base: { fontSize: 14, color: mflColors.text },
              bold: { fontWeight: '700' },
              italic: { fontStyle: 'italic' },
              code: {
                fontFamily: 'monospace',
                fontSize: 13,
                backgroundColor: `${mflColors.textMuted}20`,
              },
            })}
          </AppText>
        </View>
      </View>
      <AppText className="text-[10px] text-muted mt-1 ml-9">
        {formatTimestamp(message.createdAt)}
      </AppText>
    </View>
  );
}
