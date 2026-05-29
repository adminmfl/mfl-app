import { useCallback, useRef, useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ListRenderItemInfo,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { DarkHeaderCard } from '../../../components/dark-header-card';
import { ScreenState } from '../../../components/screen-state';
import { mflColors } from '../../../constants/colors';
import { useLeagueContext } from '../../../contexts/league-context';
import { useCoachHistory } from '../../../features/ai-coach/hooks/use-coach-history';
import { useSendCoachMessage } from '../../../features/ai-coach/hooks/use-send-coach-message';
import { useSuggestedQuestions } from '../../../features/ai-coach/hooks/use-suggested-questions';
import { useMilestones } from '../../../features/ai-coach/hooks/use-milestones';
import { useRecovery } from '../../../features/ai-coach/hooks/use-recovery';
import { useWeeklyInsight, useGenerateWeeklyInsight } from '../../../features/ai-coach/hooks/use-weekly-insight';
import { useDismissMilestone } from '../../../features/ai-coach/hooks/use-dismiss-milestone';
import { SuggestedQuestions } from '../../../features/ai-coach/components/suggested-questions';
import { MilestoneCard } from '../../../features/ai-coach/components/milestone-card';
import { RecoveryCard } from '../../../features/ai-coach/components/recovery-card';
import { WeeklyInsightCard } from '../../../features/ai-coach/components/weekly-insight-card';
import type { AiCoachMessage } from '../../../features/ai-coach/types/ai-coach.model';
import { renderCoachMarkdown } from '../../../features/ai-coach/utils/render-coach-markdown';

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── Message Bubble ─────────────────────────────────────────────────────────

function MessageBubble({ message, isOwn }: { message: AiCoachMessage; isOwn: boolean }) {
  if (isOwn) {
    return (
      <View className="items-end mb-3">
        <View className="rounded-2xl px-4 py-3 max-w-[80%]" style={{ backgroundColor: mflColors.brand }}>
          <AppText className="text-sm" style={{ color: '#fff' }}>{message.content}</AppText>
        </View>
        <AppText className="text-[10px] text-muted mt-1">{formatTimestamp(message.createdAt)}</AppText>
      </View>
    );
  }

  return (
    <View className="items-start mb-3">
      <View className="flex-row items-start gap-2 max-w-[85%]">
        <View className="w-7 h-7 rounded-full items-center justify-center mt-1" style={{ backgroundColor: mflColors.brand }}>
          <AppText className="text-xs font-bold" style={{ color: '#fff' }}>AI</AppText>
        </View>
        <View className="bg-card rounded-2xl px-4 py-3 flex-1 border border-default-200" style={{ borderLeftWidth: 3, borderLeftColor: mflColors.brand }}>
          <AppText className="text-sm text-foreground">
            {renderCoachMarkdown(message.content, {
              base: { fontSize: 14, color: mflColors.text },
              bold: { fontWeight: '700' },
              italic: { fontStyle: 'italic' },
              code: { fontFamily: 'monospace', fontSize: 13 },
            })}
          </AppText>
        </View>
      </View>
      <AppText className="text-[10px] text-muted mt-1 ml-9">{formatTimestamp(message.createdAt)}</AppText>
    </View>
  );
}

// ─── Insights Panel (horizontal scroll on mobile) ───────────────────────────

function InsightsPanel({
  leagueId,
  onSelectQuestion,
  isSending,
}: {
  leagueId: string;
  onSelectQuestion: (text: string) => void;
  isSending: boolean;
}) {
  const { data: suggestions } = useSuggestedQuestions(leagueId);
  const { data: milestones } = useMilestones(leagueId);
  const { data: recovery } = useRecovery(leagueId);
  const { data: weeklyInsight } = useWeeklyInsight(leagueId);
  const generateInsight = useGenerateWeeklyInsight();
  const dismissMilestone = useDismissMilestone();

  const hasContent =
    (suggestions && suggestions.length > 0) ||
    (milestones && milestones.length > 0) ||
    (recovery && recovery.needsRecovery) ||
    weeklyInsight !== undefined;

  if (!hasContent) return null;

  return (
    <ScrollView
      horizontal={false}
      className="max-h-52 border-b border-default-200"
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Suggested Questions */}
      {suggestions && suggestions.length > 0 && (
        <SuggestedQuestions
          questions={suggestions}
          onSelect={onSelectQuestion}
          disabled={isSending}
        />
      )}

      {/* Recovery */}
      {recovery && <RecoveryCard recovery={recovery} />}

      {/* Milestones */}
      {milestones && milestones.length > 0 && (
        <View className="mb-1">
          <AppText className="text-xs font-medium text-muted mb-1.5 px-4">Milestones</AppText>
          <View className="px-4">
            {milestones.slice(0, 3).map((m) => (
              <MilestoneCard
                key={m.id}
                milestone={m}
                onDismiss={(id) => dismissMilestone.mutate({ leagueId, messageId: id })}
              />
            ))}
          </View>
        </View>
      )}

      {/* Weekly Insight */}
      <View className="px-4">
        <WeeklyInsightCard
          insight={weeklyInsight ?? null}
          isGenerating={generateInsight.isPending}
          onGenerate={() => generateInsight.mutate(leagueId)}
        />
      </View>
    </ScrollView>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function CoachTab() {
  const insets = useSafeAreaInsets();
  const { activeLeague } = useLeagueContext();
  const leagueId = activeLeague?.leagueId ?? '';

  const { data: history, isLoading, isError, refetch } = useCoachHistory(leagueId);
  const sendMutation = useSendCoachMessage();

  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // useCoachHistory returns newest-first for inverted FlatList.
  const messages = history ?? [];

  const handleSend = useCallback(
    (text?: string) => {
      const msg = (text ?? input).trim();
      if (!msg || !leagueId) return;
      setInput('');
      sendMutation.mutate({ leagueId, message: msg });
    },
    [input, leagueId, sendMutation],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AiCoachMessage>) => (
      <MessageBubble message={item} isOwn={item.role === 'user'} />
    ),
    [],
  );

  if (!activeLeague) {
    return <ScreenState screen="coach" state="empty" message="Select a league to chat with your AI coach" />;
  }

  if (isLoading) {
    return <ScreenState screen="coach" state="loading" message="Loading coach..." />;
  }

  if (isError) {
    return <ScreenState screen="coach" state="error" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top + 56}
    >
      {/* Header */}
      <View className="px-5" style={{ paddingTop: insets.top + 8 }}>
        <DarkHeaderCard title="AI Coach" subtitle="Powered by AI" />
        {/* Privacy indicator */}
        <View className="flex-row items-center gap-1 mt-1 self-end">
          <Feather name="lock" size={10} color={mflColors.textMuted} />
          <AppText className="text-[10px] text-muted">Private to you</AppText>
        </View>
      </View>

      {/* Insights Panel — suggested questions, milestones, recovery, weekly insight */}
      <InsightsPanel
        leagueId={leagueId}
        onSelectQuestion={handleSend}
        isSending={sendMutation.isPending}
      />

      {/* Chat */}
      <View className="flex-1">
        {messages.length === 0 ? (
          <View className="flex-1 items-center justify-center px-5 py-12">
            <Feather name="cpu" size={32} color={mflColors.textMuted} />
            <AppText className="text-sm font-medium text-muted mt-3">Your Private AI Coach</AppText>
            <AppText className="text-xs text-muted mt-1 text-center px-8">
              Ask about your performance, strategy, or league standings. Everything here is private.
            </AppText>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.messageId}
            renderItem={renderItem}
            inverted
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>

      {/* Sending indicator */}
      {sendMutation.isPending && (
        <View className="px-5 pb-1 flex-row items-center gap-2">
          <Spinner size="sm" />
          <AppText className="text-xs text-muted">Coach is thinking...</AppText>
        </View>
      )}

      {/* Input */}
      <View className="flex-row items-end gap-2 px-5 py-3 bg-card border-t border-default-200" style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
        <TextInput
          className="flex-1 bg-background rounded-2xl px-4 py-3 text-sm text-foreground border border-default-200"
          placeholder="Ask your coach..."
          placeholderTextColor={mflColors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          onSubmitEditing={() => handleSend()}
          blurOnSubmit={false}
        />
        <Button
          variant="primary"
          size="sm"
          onPress={() => handleSend()}
          isDisabled={!input.trim() || sendMutation.isPending}
        >
          {sendMutation.isPending ? <Spinner size="sm" /> : <Button.Label>Send</Button.Label>}
        </Button>
      </View>
      <View className="items-center pb-1">
        <AppText className="text-[10px] text-muted">{input.length}/500</AppText>
      </View>
    </KeyboardAvoidingView>
  );
}
