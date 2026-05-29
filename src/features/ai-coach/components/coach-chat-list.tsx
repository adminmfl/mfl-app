import { useCallback, useEffect, useRef } from 'react';
import { FlatList, View, type ListRenderItemInfo } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { AiCoachMessage } from '../types/ai-coach.model';
import { CoachMessageBubble } from './coach-message-bubble';

interface CoachChatListProps {
  messages: AiCoachMessage[];
  contentPaddingHorizontal?: number;
}

export function CoachChatList({
  messages,
  contentPaddingHorizontal = 20,
}: CoachChatListProps) {
  const listRef = useRef<FlatList<AiCoachMessage>>(null);

  const scrollToBottom = useCallback((animated = true) => {
    if (messages.length === 0) return;
    listRef.current?.scrollToEnd({ animated });
  }, [messages.length]);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages, scrollToBottom]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AiCoachMessage>) => (
      <CoachMessageBubble message={item} />
    ),
    [],
  );

  if (messages.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-5 py-12">
        <Feather name="cpu" size={32} color={mflColors.textMuted} />
        <AppText className="text-sm font-medium text-muted mt-3">
          Your Private AI Coach
        </AppText>
        <AppText className="text-xs text-muted mt-1 text-center px-8">
          Ask about your performance, strategy, or league standings. Everything
          here is private.
        </AppText>
      </View>
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => item.messageId}
      renderItem={renderItem}
      contentContainerStyle={{
        paddingHorizontal: contentPaddingHorizontal,
        paddingVertical: 12,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onContentSizeChange={() => scrollToBottom(true)}
    />
  );
}
