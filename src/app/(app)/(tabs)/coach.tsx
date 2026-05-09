import { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  type ListRenderItemInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Chip, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { DarkHeaderCard } from '../../../components/dark-header-card';
import { ScreenState } from '../../../components/screen-state';
import { mflColors } from '../../../constants/colors';
import { useLeagueContext } from '../../../contexts/league-context';
import { useCoachHistory } from '../../../features/ai-coach/hooks/use-coach-history';
import { useSendCoachMessage } from '../../../features/ai-coach/hooks/use-send-coach-message';
import { useAiMotivate } from '../../../features/ai-coach/hooks/use-ai-motivate';
import type { AiCoachMessage } from '../../../features/ai-coach/types/ai-coach.model';

const QUICK_PROMPTS = [
  'How can I improve?',
  'Tips for today',
  'Analyze my progress',
  'Motivate me',
];

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
          <AppText className="text-sm text-foreground">{message.content}</AppText>
        </View>
      </View>
      <AppText className="text-[10px] text-muted mt-1 ml-9">{formatTimestamp(message.createdAt)}</AppText>
    </View>
  );
}

export default function CoachTab() {
  const insets = useSafeAreaInsets();
  const { activeLeague } = useLeagueContext();
  const leagueId = activeLeague?.leagueId ?? '';

  const { data: history, isLoading, isError, refetch } = useCoachHistory(leagueId);
  const sendMutation = useSendCoachMessage();
  const motivateMutation = useAiMotivate();

  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const messages = useMemo(() => [...(history ?? [])].reverse(), [history]);

  const handleSend = useCallback(
    (text?: string) => {
      const msg = (text ?? input).trim();
      if (!msg || !leagueId) return;
      setInput('');
      sendMutation.mutate({ leagueId, message: msg });
    },
    [input, leagueId, sendMutation],
  );

  const handleMotivate = useCallback(() => {
    if (!leagueId) return;
    motivateMutation.mutate(leagueId, {
      onSuccess: (data) => {
        Alert.alert('AI Motivation', data.message);
      },
      onError: (error: any) => {
        Alert.alert(
          'Error',
          error?.response?.data?.error || error?.message || 'Failed to get motivation.',
        );
      },
    });
  }, [leagueId, motivateMutation]);

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
      </View>

      {/* AI Motivation Action */}
      <View className="px-5 pt-3">
        <Card className="p-3">
          <Pressable
            className="flex-row items-center"
            onPress={handleMotivate}
            disabled={motivateMutation.isPending}
          >
            <View
              className="w-9 h-9 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: mflColors.brandLight }}
            >
              <AppText className="text-base" style={{ color: mflColors.brand }}>
                {'*'}
              </AppText>
            </View>
            <AppText className="text-sm font-semibold text-foreground flex-1">
              Get AI Motivation
            </AppText>
            {motivateMutation.isPending ? (
              <Spinner size="sm" />
            ) : (
              <Button
                variant="primary"
                size="sm"
                onPress={handleMotivate}
                isDisabled={motivateMutation.isPending}
                style={{ backgroundColor: mflColors.brand }}
              >
                <Button.Label>Go</Button.Label>
              </Button>
            )}
          </Pressable>
        </Card>
      </View>

      {/* Quick Prompts */}
      <View className="flex-row flex-wrap gap-2 px-5 py-3">
        {QUICK_PROMPTS.map((prompt) => (
          <Pressable key={prompt} onPress={() => handleSend(prompt)}>
            <Chip size="md" variant="soft" style={{ backgroundColor: mflColors.brandLight }}>
              <Chip.Label style={{ color: mflColors.brand }}>{prompt}</Chip.Label>
            </Chip>
          </Pressable>
        ))}
      </View>

      {/* Chat */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.messageId}
        renderItem={renderItem}
        inverted
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
      />

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
    </KeyboardAvoidingView>
  );
}
