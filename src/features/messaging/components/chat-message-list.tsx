import Feather from '@expo/vector-icons/Feather';
import { useCallback, useRef } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { AppText } from '../../../components/app-text';
import { ScreenState } from '../../../components/screen-state';
import { mflColors } from '../../../constants/colors';
import type { ChatFilter, ChatMessage } from '../types/messaging.model';
import { ChatMessageBubble } from './chat-message-bubble';

const FILTER_OPTIONS: { value: ChatFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'host_messages', label: 'Host' },
  { value: 'captains_only', label: 'Captains' },
  { value: 'important', label: 'Important' },
];

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isError: boolean;
  refreshing: boolean;
  currentUserId?: string;
  isCaptainRole: boolean;
  filter: ChatFilter;
  onRefresh: () => void;
  onRetry: () => void;
  onReply: (message: ChatMessage) => void;
  onReact: (messageId: string, emoji: string) => void;
  onOpenDeepLink: (path: string) => void;
  onFocusComposer: () => void;
}

export function ChatMessageList({
  messages,
  isLoading,
  isError,
  refreshing,
  currentUserId,
  isCaptainRole,
  filter,
  onRefresh,
  onRetry,
  onReply,
  onReact,
  onOpenDeepLink,
  onFocusComposer,
}: ChatMessageListProps) {
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const renderMessage = useCallback(
    ({ item, index }: ListRenderItemInfo<ChatMessage>) => {
      const above = messages[index + 1];
      const isGrouped =
        !!above &&
        above.senderId === item.senderId &&
        Math.abs(
          new Date(item.createdAt).getTime() - new Date(above.createdAt).getTime(),
        ) <
          5 * 60 * 1000;

      return (
        <ChatMessageBubble
          message={item}
          isOwn={item.senderId === currentUserId}
          currentUserId={currentUserId}
          isGrouped={isGrouped}
          onReply={onReply}
          onReact={onReact}
          onOpenDeepLink={onOpenDeepLink}
        />
      );
    },
    [currentUserId, messages, onOpenDeepLink, onReact, onReply],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.messageId, []);

  if (isLoading) {
    return <ScreenState screen="team-chat" state="loading" />;
  }

  if (isError) {
    return (
      <ScreenState
        screen="team-chat"
        state="error"
        message="Failed to load messages."
        actionLabel="Retry"
        onAction={onRetry}
      />
    );
  }

  if (messages.length === 0) {
    const filterLabel = FILTER_OPTIONS.find((o) => o.value === filter)?.label.toLowerCase();
    return (
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 48,
          gap: 8,
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
          style={{ backgroundColor: mflColors.brandLight }}
        >
          <Feather name="message-circle" size={28} color={mflColors.brand} />
        </View>
        <AppText className="text-sm font-semibold text-foreground text-center">
          {filter === 'all' ? 'No messages yet' : `No ${filterLabel} messages`}
        </AppText>
        <AppText className="text-xs text-muted text-center">
          {filter === 'all'
            ? 'Be the first to start the conversation!'
            : 'Try switching to "All" to see all messages.'}
        </AppText>
        {filter === 'all' ? (
          <Pressable
            onPress={onFocusComposer}
            className="mt-3 flex-row items-center gap-2 rounded-xl px-5 py-3"
            style={{ backgroundColor: mflColors.brand }}
          >
            <Feather
              name={isCaptainRole ? 'zap' : 'message-circle'}
              size={15}
              color={mflColors.white}
            />
            <AppText className="text-sm font-semibold" style={{ color: mflColors.white }}>
              {isCaptainRole ? 'Send Motivation' : 'Start Chatting'}
            </AppText>
          </Pressable>
        ) : null}
      </ScrollView>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={keyExtractor}
      inverted
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    />
  );
}
