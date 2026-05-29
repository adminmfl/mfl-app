import { useCallback, useState } from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { CoachChatList } from '../../../features/ai-coach/components/coach-chat-list';

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

      {/* Chat — chronological list (oldest → newest), scroll pinned to bottom */}
      <View className="flex-1">
        <CoachChatList messages={messages} />
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
