import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { ChatMessage } from '../types/messaging.model';
import { MessagingChip } from './messaging-chip';

const QUICK_EMOJIS = ['👍', '🔥', '💪', '😂', '❤️', '👀'];

// ---------------------------------------------------------------------------
// ChatMessageReactions
// ---------------------------------------------------------------------------

interface ChatMessageReactionsProps {
  messageId: string;
  reactions: ChatMessage['reactions'];
  currentUserId?: string;
  onReact: (messageId: string, emoji: string) => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function ChatMessageReactions({
  messageId,
  reactions,
  currentUserId,
  onReact,
  className,
  style,
}: ChatMessageReactionsProps) {
  if (reactions.length === 0) return null;

  return (
    <View className={className} style={style}>
      {reactions.map((reaction, index) => {
        const isUserReaction = !!currentUserId && reaction.userIds.includes(currentUserId);
        return (
          <Pressable
            key={reaction.emoji}
            onPress={() => onReact(messageId, reaction.emoji)}
            className="items-center justify-center rounded-full"
            style={{
              backgroundColor: isUserReaction ? '#FFFFFF' : mflColors.card,
              borderWidth: isUserReaction ? 0 : 2,
              borderColor: mflColors.surface,
              width: 32,
              height: 32,
              marginLeft: index > 0 ? -8 : 0,
              zIndex: reactions.length - index,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <AppText className="text-base">{reaction.emoji}</AppText>
            {reaction.userIds.length > 1 ? (
              <View
                className="absolute -bottom-1 -right-1 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isUserReaction ? mflColors.brand : mflColors.surface,
                  borderWidth: 1.5,
                  borderColor: mflColors.surface,
                  minWidth: 16,
                  height: 16,
                  paddingHorizontal: 3,
                }}
              >
                <AppText
                  className="text-[9px] font-bold"
                  style={{ color: isUserReaction ? mflColors.white : mflColors.text }}
                >
                  {reaction.userIds.length}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// MessageActions
// ---------------------------------------------------------------------------

interface MessageActionsProps {
  message: ChatMessage;
  currentUserId?: string;
  isOwn?: boolean;
  isCaptainBoost?: boolean;
  showEmojiPicker: boolean;
  onReply: (message: ChatMessage) => void;
  onReact: (messageId: string, emoji: string) => void;
  onToggleEmojiPicker: () => void;
}

export function MessageActions({
  message,
  currentUserId,
  isOwn,
  isCaptainBoost,
  showEmojiPicker,
  onReply,
  onReact,
  onToggleEmojiPicker,
}: MessageActionsProps) {
  const alignment = isCaptainBoost ? '' : isOwn ? 'justify-end' : 'justify-start';
  const marginStyle = !isCaptainBoost ? { marginLeft: isOwn ? 0 : 36 } : undefined;
  const spacingClass = isCaptainBoost ? 'mt-1' : 'mb-2';

  return (
    <>
      <ChatMessageReactions
        messageId={message.messageId}
        reactions={message.reactions}
        currentUserId={currentUserId}
        onReact={onReact}
        className={`${spacingClass} flex-row items-center ${alignment}`}
        style={marginStyle}
      />
      <View className={`${spacingClass} flex-row flex-wrap gap-1 ${alignment}`}>
        <MessagingChip label="Reply" icon="corner-up-left" onPress={() => onReply(message)} />
        <MessagingChip label="React" icon="plus" onPress={onToggleEmojiPicker} />
      </View>
      {showEmojiPicker ? (
        <View className={`${spacingClass} flex-row flex-wrap gap-1 ${alignment}`}>
          {QUICK_EMOJIS.map((emoji) => (
            <MessagingChip
              key={emoji}
              label={emoji}
              selected={message.reactions.some(
                (r) => r.emoji === emoji && !!currentUserId && r.userIds.includes(currentUserId),
              )}
              onPress={() => {
                onReact(message.messageId, emoji);
                onToggleEmojiPicker();
              }}
            />
          ))}
        </View>
      ) : null}
    </>
  );
}
