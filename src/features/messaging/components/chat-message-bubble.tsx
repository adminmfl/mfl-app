import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Dimensions, Image, Modal, Pressable, View } from 'react-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { ChatMessage } from '../types/messaging.model';
import {
  formatRelativeMessageTime,
  getDeepLinkLabel,
  getInitial,
  getRoleLabel,
} from '../utils/messaging-format';
import { renderMessageContent } from '../utils/render-message-content';
import { MessagingChip } from './messaging-chip';

const QUICK_EMOJIS = ['\u{1F44D}', '\u{1F525}', '\u{1F4AA}', '\u{1F602}', '\u{2764}\u{FE0F}', '\u{1F440}'];

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  currentUserId?: string;
  isGrouped?: boolean;
  onReply: (message: ChatMessage) => void;
  onReact: (messageId: string, emoji: string) => void;
  onOpenDeepLink: (path: string) => void;
}

export function ChatMessageBubble({
  message,
  isOwn,
  currentUserId,
  isGrouped = false,
  onReply,
  onReact,
  onOpenDeepLink,
}: ChatMessageBubbleProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isSystem = message.messageType === 'system';
  const isCaptainBoost =
    message.messageType === 'announcement' &&
    message.visibility === 'captains_only';
  const isAnnouncement =
    message.messageType === 'announcement' &&
    message.visibility !== 'captains_only';
  const roleColor = getRoleColor(message.senderRole);

  if (isSystem) {
    return (
      <View className="items-center py-1">
        <View className="rounded-full px-3 py-1" style={{ backgroundColor: mflColors.surface }}>
          <AppText className="text-xs italic text-muted">{message.content}</AppText>
        </View>
      </View>
    );
  }

  // Captain boost: announcement + captains_only = golden card (matches web)
  if (isCaptainBoost) {
    return (
      <View className={isGrouped ? 'mt-1' : 'mt-3'}>
        <Pressable
          onLongPress={() => onReply(message)}
          className="rounded-xl px-4 py-3"
          style={{
            backgroundColor: mflColors.amberLight,
            borderWidth: 1,
            borderColor: '#FCD34D',
          }}
        >
          <AppText className="text-[15px] text-foreground">
            {renderMessageContent(message.content, mflColors.text)}
          </AppText>
          <View className="mt-2 flex-row items-center gap-2">
            <AppText className="text-[10px] font-semibold" style={{ color: mflColors.amber }}>
              {message.senderName || message.senderUsername}
            </AppText>
            <AppText className="text-[10px] text-muted">
              {formatRelativeMessageTime(message.createdAt)}
            </AppText>
          </View>
        </Pressable>

        {message.reactions.length > 0 ? (
          <View className="mt-1 flex-row items-center">
            {message.reactions.map((reaction, index) => {
              const isUserReaction = !!currentUserId && reaction.userIds.includes(currentUserId);
              return (
                <Pressable
                  key={reaction.emoji}
                  onPress={() => onReact(message.messageId, reaction.emoji)}
                  className="items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isUserReaction ? '#FFFFFF' : mflColors.card,
                    borderWidth: isUserReaction ? 0 : 2,
                    borderColor: mflColors.surface,
                    width: 32,
                    height: 32,
                    marginLeft: index > 0 ? -8 : 0,
                    zIndex: message.reactions.length - index,
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
                        style={{ 
                          color: isUserReaction ? mflColors.white : mflColors.text
                        }}
                      >
                        {reaction.userIds.length}
                      </AppText>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View className="mt-1 flex-row flex-wrap gap-1">
          <MessagingChip label="Reply" icon="corner-up-left" onPress={() => onReply(message)} />
          <MessagingChip 
            label="React" 
            icon="plus" 
            onPress={() => setShowEmojiPicker(!showEmojiPicker)} 
          />
        </View>

        {showEmojiPicker ? (
          <View className="mt-1 flex-row flex-wrap gap-1">
            {QUICK_EMOJIS.map((emoji) => (
              <MessagingChip
                key={emoji}
                label={emoji}
                selected={message.reactions.some(
                  (reaction) =>
                    reaction.emoji === emoji &&
                    !!currentUserId &&
                    reaction.userIds.includes(currentUserId),
                )}
                onPress={() => {
                  onReact(message.messageId, emoji);
                  setShowEmojiPicker(false);
                }}
              />
            ))}
          </View>
        ) : null}
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;

  return (
    <View className={isOwn ? 'items-end' : 'items-start'}>
      <View
        className={`flex-row ${isGrouped ? 'mt-1' : 'mt-3'}`}
        style={{
          maxWidth: '86%',
          alignSelf: isOwn ? 'flex-end' : 'flex-start',
        }}
      >
        {/* Avatar — hide for own messages; show spacer when grouped */}
        {!isOwn && !isGrouped ? (
          <View
            className="mr-2 mt-1 h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: mflColors.brandLight }}
          >
            <AppText className="text-[10px] font-bold" style={{ color: mflColors.brand }}>
              {getInitial(message.senderUsername)}
            </AppText>
          </View>
        ) : !isOwn && isGrouped ? (
          <View className="mr-2 h-7 w-7" />
        ) : null}

        <Pressable
          onLongPress={() => onReply(message)}
          className="rounded-2xl px-3 py-2"
          style={[
            isAnnouncement
              ? {
                  backgroundColor: mflColors.amberLight,
                  borderWidth: 1,
                  borderColor: '#FCD34D',
                }
              : isOwn
                ? {
                    backgroundColor: mflColors.brand,
                    borderBottomRightRadius: 5,
                  }
                : {
                    backgroundColor: mflColors.card,
                    borderBottomLeftRadius: 5,
                    borderWidth: 1,
                    borderColor: mflColors.border,
                  },
          ]}
        >
          {/* Name + role badge — hide when grouped or own */}
          {!isOwn && !isGrouped ? (
            <View className="mb-1 flex-row items-center gap-2">
              <AppText className="text-xs font-semibold" style={{ color: roleColor }}>
                {message.senderName || message.senderUsername}
              </AppText>
              <View
                className="rounded-full px-1.5 py-0.5"
                style={{
                  backgroundColor: mflColors.surface,
                  ...(message.senderRole === 'player'
                    ? { borderWidth: 1, borderColor: mflColors.border }
                    : {}),
                }}
              >
                <AppText className="text-[10px] font-semibold" style={{ color: roleColor }}>
                  {getRoleLabel(message.senderRole)}
                </AppText>
              </View>
            </View>
          ) : null}

          {isAnnouncement ? (
            <View className="mb-1 flex-row items-center gap-1.5">
              <Feather name="radio" size={13} color={mflColors.amber} />
              <AppText className="text-xs font-bold" style={{ color: mflColors.amber }}>
                Announcement
              </AppText>
            </View>
          ) : null}

          {message.isImportant && !isAnnouncement ? (
            <View className="mb-1 flex-row items-center gap-1.5">
              <Feather name="alert-triangle" size={12} color={mflColors.danger} />
              <AppText className="text-[10px] font-bold" style={{ color: mflColors.danger }}>
                Important
              </AppText>
            </View>
          ) : null}

          {message.parentMessage ? (
            <View
              className="mb-2 rounded-lg border-l-2 px-2 py-1"
              style={{
                backgroundColor: isOwn ? 'rgba(255,255,255,0.12)' : mflColors.surface,
                borderLeftColor: isOwn ? mflColors.white : mflColors.brand,
              }}
            >
              <AppText
                className="text-[11px] font-semibold"
                style={{ color: isOwn ? mflColors.white : mflColors.brand }}
              >
                {message.parentMessage.senderUsername}
              </AppText>
              <AppText
                className="text-[11px]"
                numberOfLines={2}
                style={{ color: isOwn ? 'rgba(255,255,255,0.72)' : mflColors.textSub }}
              >
                {message.parentMessage.content}
              </AppText>
            </View>
          ) : null}

          {message.photoUrl ? (
            <Pressable onPress={() => setLightboxOpen(true)}>
              <Image
                source={{ uri: message.photoUrl }}
                className="mb-2 rounded-xl"
                style={{ width: 220, height: 170, backgroundColor: mflColors.surface }}
                resizeMode="cover"
              />
            </Pressable>
          ) : null}

          {message.content ? (
            <AppText
              className="text-sm"
              style={{
                color: isOwn && !isAnnouncement ? mflColors.white : mflColors.text,
              }}
            >
              {renderMessageContent(
                message.content,
                isOwn && !isAnnouncement ? mflColors.white : mflColors.text,
              )}
            </AppText>
          ) : null}

          {message.deepLink ? (
            <Pressable
              onPress={() => onOpenDeepLink(message.deepLink!)}
              className="mt-2 flex-row items-center gap-2 rounded-lg border px-3 py-2"
              style={{
                backgroundColor: isOwn ? 'rgba(255,255,255,0.13)' : mflColors.surface,
                borderColor: isOwn ? 'rgba(255,255,255,0.25)' : mflColors.border,
              }}
            >
              <Feather
                name="external-link"
                size={14}
                color={isOwn ? mflColors.white : mflColors.brand}
              />
              <AppText
                className="flex-1 text-xs font-semibold"
                numberOfLines={1}
                style={{ color: isOwn ? mflColors.white : mflColors.text }}
              >
                {getDeepLinkLabel(message.deepLink)}
              </AppText>
            </Pressable>
          ) : null}

          <View className="mt-1 flex-row items-center justify-end gap-1.5">
            {message.visibility === 'captains_only' ? (
              <View className="flex-row items-center gap-0.5">
                <Feather name="shield" size={10} color={isOwn ? mflColors.white : mflColors.blue} />
                <AppText
                  className="text-[10px]"
                  style={{ color: isOwn ? 'rgba(255,255,255,0.72)' : mflColors.blue }}
                >
                  Captains
                </AppText>
              </View>
            ) : null}
            {message.editedAt ? (
              <AppText
                className="text-[10px]"
                style={{
                  color: isOwn && !isAnnouncement ? 'rgba(255,255,255,0.72)' : mflColors.textMuted,
                }}
              >
                edited
              </AppText>
            ) : null}
            <AppText
              className="text-[10px]"
              style={{
                color: isOwn && !isAnnouncement ? 'rgba(255,255,255,0.72)' : mflColors.textMuted,
              }}
            >
              {formatRelativeMessageTime(message.createdAt)}
            </AppText>
            {isOwn ? (
              message.isRead ? (
                <View className="flex-row" style={{ marginLeft: -2 }}>
                  <Feather name="check" size={12} color={mflColors.blue} />
                  <Feather name="check" size={12} color={mflColors.blue} style={{ marginLeft: -6 }} />
                </View>
              ) : (
                <Feather name="check" size={12} color="rgba(255,255,255,0.72)" />
              )
            ) : null}
          </View>
        </Pressable>
      </View>

      {/* Reactions display - overlapped style */}
      {message.reactions.length > 0 ? (
        <View 
          className={`mb-2 flex-row items-center ${isOwn ? 'justify-end' : 'justify-start'}`}
          style={{ marginLeft: isOwn ? 0 : 36 }}
        >
          {message.reactions.map((reaction, index) => {
            const isUserReaction = !!currentUserId && reaction.userIds.includes(currentUserId);
            return (
              <Pressable
                key={reaction.emoji}
                onPress={() => onReact(message.messageId, reaction.emoji)}
                className="items-center justify-center rounded-full"
                style={{
                  backgroundColor: isUserReaction ? '#FFFFFF' : mflColors.card,
                  borderWidth: isUserReaction ? 0 : 2,
                  borderColor: mflColors.surface,
                  width: 32,
                  height: 32,
                  marginLeft: index > 0 ? -8 : 0,
                  zIndex: message.reactions.length - index,
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
                      style={{ 
                        color: isUserReaction ? mflColors.white : mflColors.text
                      }}
                    >
                      {reaction.userIds.length}
                    </AppText>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {/* Action buttons - Reply and React */}
      <View className={`mb-2 flex-row flex-wrap gap-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <MessagingChip label="Reply" icon="corner-up-left" onPress={() => onReply(message)} />
        <MessagingChip 
          label="React" 
          icon="plus" 
          onPress={() => setShowEmojiPicker(!showEmojiPicker)} 
        />
      </View>

      {/* Emoji picker - shown when React button is pressed */}
      {showEmojiPicker ? (
        <View className={`mb-2 flex-row flex-wrap gap-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          {QUICK_EMOJIS.map((emoji) => (
            <MessagingChip
              key={emoji}
              label={emoji}
              selected={message.reactions.some(
                (reaction) =>
                  reaction.emoji === emoji &&
                  !!currentUserId &&
                  reaction.userIds.includes(currentUserId),
              )}
              onPress={() => {
                onReact(message.messageId, emoji);
                setShowEmojiPicker(false);
              }}
            />
          ))}
        </View>
      ) : null}

      {/* Photo lightbox */}
      {message.photoUrl ? (
        <Modal
          visible={lightboxOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setLightboxOpen(false)}
        >
          <Pressable
            onPress={() => setLightboxOpen(false)}
            className="flex-1 items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
          >
            <Pressable
              onPress={() => setLightboxOpen(false)}
              className="absolute right-4 top-14 z-10 rounded-full p-2"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Feather name="x" size={22} color={mflColors.white} />
            </Pressable>
            <Image
              source={{ uri: message.photoUrl }}
              style={{
                width: screenWidth - 32,
                height: (screenWidth - 32) * 0.75,
              }}
              resizeMode="contain"
            />
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

function getRoleColor(role: string | null): string {
  if (role === 'host') return mflColors.danger;
  if (role === 'governor') return '#7C3AED';
  if (role === 'captain' || role === 'vice_captain') return mflColors.blue;
  return mflColors.textSub;
}
