import { useCallback, useRef, useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Alert,
  type ListRenderItemInfo,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Spinner } from 'heroui-native';
import { AppText } from '../../components/app-text';
import { DarkHeaderCard } from '../../components/dark-header-card';
import { ScreenState } from '../../components/screen-state';
import { useLeagueContext } from '../../contexts/league-context';
import { useRole } from '../../contexts/role-context';
import { useCoachHistory } from '../../features/ai-coach/hooks/use-coach-history';
import { useSendCoachMessage } from '../../features/ai-coach/hooks/use-send-coach-message';
import { useAiMotivate } from '../../features/ai-coach/hooks/use-ai-motivate';
import { useSuggestedQuestions } from '../../features/ai-coach/hooks/use-suggested-questions';
import { useMilestones } from '../../features/ai-coach/hooks/use-milestones';
import { useRecovery } from '../../features/ai-coach/hooks/use-recovery';
import { useWeeklyInsight, useGenerateWeeklyInsight } from '../../features/ai-coach/hooks/use-weekly-insight';
import { useDismissMilestone } from '../../features/ai-coach/hooks/use-dismiss-milestone';
import { SuggestedQuestions } from '../../features/ai-coach/components/suggested-questions';
import { MilestoneCard } from '../../features/ai-coach/components/milestone-card';
import { RecoveryCard } from '../../features/ai-coach/components/recovery-card';
import { WeeklyInsightCard } from '../../features/ai-coach/components/weekly-insight-card';
import type { AiCoachMessage } from '../../features/ai-coach/types/ai-coach.model';
import { mflColors } from '../../constants/colors';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ─── Lightweight Markdown Renderer ──────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  return lines.map((line, lineIndex) => {
    // Parse inline bold (**text**) and italic (*text*)
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      // Text before match
      if (match.index > lastIndex) {
        parts.push(line.slice(lastIndex, match.index));
      }
      if (match[0].startsWith('**')) {
        // Bold
        parts.push(
          <AppText key={`b-${lineIndex}-${match.index}`} style={{ fontWeight: '700' }}>
            {match[2]}
          </AppText>
        );
      } else {
        // Italic
        parts.push(
          <AppText key={`i-${lineIndex}-${match.index}`} style={{ fontStyle: 'italic' }}>
            {match[3]}
          </AppText>
        );
      }
      lastIndex = match.index + match[0].length;
    }
    // Remaining text
    if (lastIndex < line.length) {
      parts.push(line.slice(lastIndex));
    }

    const isLastLine = lineIndex === lines.length - 1;
    return (
      <AppText key={lineIndex} style={{ marginBottom: isLastLine ? 0 : line === '' ? 6 : 2 }}>
        {parts.length > 0 ? parts : line}
      </AppText>
    );
  });
}

// ─── Message Bubble ──────────────────────────────────────────────────────────

function CoachBubble({ message }: { message: AiCoachMessage }) {
  const isAssistant = message.role === 'assistant';

  return (
    <View className={`flex-row mb-3 max-w-[85%] ${isAssistant ? 'self-start' : 'self-end'}`}>
      {isAssistant && (
        <View
          className="w-8 h-8 rounded-full items-center justify-center mr-2 self-end"
          style={{ backgroundColor: '#00C48C' }}
        >
          <AppText className="text-white font-bold text-[11px]">AI</AppText>
        </View>
      )}
      <View
        className={`rounded-2xl px-4 py-3 max-w-full ${
          isAssistant ? 'bg-card rounded-bl-sm border-l-[3px]' : 'rounded-br-sm'
        }`}
        style={isAssistant ? { borderLeftColor: '#00C48C' } : { backgroundColor: mflColors.accent }}
      >
        <AppText
          className={`text-sm ${isAssistant ? 'text-foreground' : ''}`}
          style={isAssistant ? undefined : { color: '#FFFFFF' }}
        >
          {isAssistant ? renderMarkdown(message.content) : message.content}
        </AppText>
        <AppText
          className={`text-xs mt-1 ${isAssistant ? 'text-muted' : 'text-right'}`}
          style={isAssistant ? undefined : { color: 'rgba(255,255,255,0.7)' }}
        >
          {formatTimestamp(message.createdAt)}
        </AppText>
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function AiCoachScreen() {
  const insets = useSafeAreaInsets();
  const { activeLeague } = useLeagueContext();
  const { isCaptain, isHost, isGovernor } = useRole();
  const leagueId = activeLeague?.leagueId ?? '';
  const canMotivate = isCaptain || isHost || isGovernor;

  const { data: messages, isLoading, isError, refetch } = useCoachHistory(leagueId);
  const sendMutation = useSendCoachMessage();
  const motivateMutation = useAiMotivate();
  const { data: suggestions } = useSuggestedQuestions(leagueId);
  const { data: milestones } = useMilestones(leagueId);
  const { data: recovery } = useRecovery(leagueId);
  const { data: weeklyInsight } = useWeeklyInsight(leagueId);
  const generateInsight = useGenerateWeeklyInsight();
  const dismissMilestone = useDismissMilestone();

  const [inputText, setInputText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSend = useCallback(
    (text?: string) => {
      const content = (text ?? inputText).trim();
      if (!content || !leagueId) return;
      sendMutation.mutate(
        { leagueId, message: content },
        { onSuccess: () => setInputText('') },
      );
    },
    [inputText, leagueId, sendMutation],
  );

  const handleMotivate = useCallback(() => {
    if (!leagueId) return;
    motivateMutation.mutate(leagueId, {
      onSuccess: (data) => Alert.alert('AI Motivation', data.message),
      onError: (error: any) =>
        Alert.alert('Error', error?.response?.data?.error || error?.message || 'Failed to get motivation.'),
    });
  }, [leagueId, motivateMutation]);

  const renderMessage = useCallback(
    ({ item }: ListRenderItemInfo<AiCoachMessage>) => <CoachBubble message={item} />,
    [],
  );

  const keyExtractor = useCallback((item: AiCoachMessage) => item.messageId, []);

  if (!activeLeague) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ScreenState screen="ai-coach" state="empty" message="Select a league to chat with your AI Coach" />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ScreenState screen="ai-coach" state="loading" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ScreenState screen="ai-coach" state="error" message="Failed to load chat history" actionLabel="Retry" onAction={() => refetch()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={{ marginHorizontal: 16, marginTop: 12, marginBottom: 4 }}>
        <DarkHeaderCard title="AI Coach" subtitle="Powered by AI" />
        <View className="flex-row items-center gap-1 mt-1 self-end">
          <Feather name="lock" size={10} color={mflColors.textMuted} />
          <AppText className="text-[10px] text-muted">Private to you</AppText>
        </View>
      </View>

      {/* AI Motivation Action — captain/host/governor only */}
      {canMotivate && (
        <View className="px-4 pt-2 pb-1">
          <Card className="p-3">
            <Pressable className="flex-row items-center" onPress={handleMotivate} disabled={motivateMutation.isPending}>
              <View className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: mflColors.brandLight }}>
                <AppText className="text-base" style={{ color: mflColors.brand }}>{'*'}</AppText>
              </View>
              <AppText className="text-sm font-semibold text-foreground flex-1">Get AI Motivation</AppText>
              {motivateMutation.isPending ? (
                <Spinner size="sm" />
              ) : (
                <Button variant="primary" size="sm" onPress={handleMotivate} isDisabled={motivateMutation.isPending} style={{ backgroundColor: mflColors.brand }}>
                  <Button.Label>Go</Button.Label>
                </Button>
              )}
            </Pressable>
          </Card>
        </View>
      )}

      {/* Insights panel */}
      <ScrollView horizontal={false} className="max-h-48 border-b border-default-200" contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 6 }} showsVerticalScrollIndicator={false}>
        {suggestions && suggestions.length > 0 && (
          <SuggestedQuestions questions={suggestions} onSelect={handleSend} disabled={sendMutation.isPending} />
        )}
        {recovery && <View className="px-4"><RecoveryCard recovery={recovery} /></View>}
        {milestones && milestones.length > 0 && (
          <View className="px-4">
            <AppText className="text-xs font-medium text-muted mb-1.5">Milestones</AppText>
            {milestones.slice(0, 3).map((m) => (
              <MilestoneCard key={m.id} milestone={m} onDismiss={(id) => dismissMilestone.mutate({ leagueId, messageId: id })} />
            ))}
          </View>
        )}
        <View className="px-4">
          <WeeklyInsightCard
            insight={weeklyInsight ?? null}
            isGenerating={generateInsight.isPending}
            onGenerate={() => generateInsight.mutate(leagueId)}
          />
        </View>
      </ScrollView>

      {/* Chat history */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        inverted
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View className="items-center justify-center" style={{ paddingVertical: 48, transform: [{ scaleY: -1 }] }}>
            <Feather name="cpu" size={32} color={mflColors.textMuted} />
            <AppText className="text-sm font-medium text-muted mt-3">Your Private AI Coach</AppText>
            <AppText className="text-xs text-muted mt-1 text-center px-8">
              Ask about your performance, strategy, or league standings. Everything here is private.
            </AppText>
          </View>
        }
      />

      {/* Sending indicator */}
      {sendMutation.isPending && (
        <View className="px-4 pb-1 flex-row items-center gap-2">
          <Spinner size="sm" />
          <AppText className="text-xs text-muted">Coach is thinking...</AppText>
        </View>
      )}

      {/* Input bar */}
      <View className="flex-row items-end px-4 pt-2 gap-2 bg-card border-t border-default-200" style={{ paddingBottom: Math.max(insets.bottom, 8) }}>
        <TextInput
          ref={inputRef}
          className="flex-1 bg-background rounded-2xl px-4 py-2 text-sm text-foreground"
          style={{ minHeight: 40, maxHeight: 100 }}
          placeholder="Ask your coach..."
          placeholderTextColor={mflColors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          returnKeyType="default"
        />
        <Button
          size="sm"
          onPress={() => handleSend()}
          isDisabled={!inputText.trim() || sendMutation.isPending}
          style={{ marginBottom: 4 }}
        >
          {sendMutation.isPending ? <Spinner size="sm" /> : <Button.Label>Send</Button.Label>}
        </Button>
      </View>
      <View className="items-center pb-1">
        <AppText className="text-[10px] text-muted">{inputText.length}/500</AppText>
      </View>
    </KeyboardAvoidingView>
  );
}
