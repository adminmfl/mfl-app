import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import type React from 'react';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { Button, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { useCannedMessages } from '../hooks/use-canned-messages';
import { useChatMembers } from '../hooks/use-chat-members';
import { useRecentWorkouts } from '../hooks/use-recent-workouts';
import { useSendChatMessage } from '../hooks/use-send-chat-message';
import {
  generateTeamMotivation,
  uploadTeamChatPhoto,
} from '../services/messaging.service';
import type {
  CannedMessage,
  ChatMember,
  ChatMessage,
  ChatVisibility,
  PickedChatPhoto,
  RecentWorkout,
} from '../types/messaging.model';
import {
  getWorkoutDeepLinkLabel,
  getWorkoutDisplayName,
} from '../utils/messaging-format';
import { MessagingChip } from './messaging-chip';

type ComposerModal = 'quick' | 'mention' | 'link' | null;

/** Imperative handle exposed to parent via ref */
export interface ChatComposerHandle {
  focusInput: () => void;
}

interface ChatComposerProps {
  leagueId: string;
  teamId: string | null;
  currentRole: string | null;
  isLeader: boolean;
  isCaptainRole: boolean;
  replyTo: ChatMessage | null;
  onCancelReply: () => void;
  onSent: () => void;
  senderId?: string;
  senderUsername?: string;
  onOptimisticMessage?: (message: ChatMessage) => void;
  onSendFailed?: (messageId: string) => void;
}

export const ChatComposer = forwardRef<ChatComposerHandle, ChatComposerProps>(function ChatComposer({
  leagueId,
  teamId,
  currentRole,
  isLeader,
  isCaptainRole,
  replyTo,
  onCancelReply,
  onSent,
  senderId,
  senderUsername,
  onOptimisticMessage,
  onSendFailed,
}: ChatComposerProps, ref) {
  const sendMutation = useSendChatMessage();
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<ChatVisibility>('all');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [photo, setPhoto] = useState<PickedChatPhoto | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [motivating, setMotivating] = useState(false);
  const [modal, setModal] = useState<ComposerModal>(null);

  // Ref to the text input so the empty-state CTA can focus it
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    focusInput: () => inputRef.current?.focus(),
  }));

  const cannedQuery = useCannedMessages(leagueId, modal === 'quick');
  const membersQuery = useChatMembers(leagueId, modal === 'mention');
  const workoutsQuery = useRecentWorkouts(leagueId, modal === 'link');

  const canSend = content.trim().length > 0 || !!photo;
  const isBusy = sendMutation.isPending || uploadingPhoto;
  const showPhotoAction = !!teamId;

  const visibleMembers = useMemo(() => {
    const members = membersQuery.data ?? [];
    if (isLeader) return members;
    return members.filter((member) => {
      if (member.roles.includes('host') || member.roles.includes('governor')) {
        return true;
      }
      return !!teamId && member.teamId === teamId;
    });
  }, [isLeader, membersQuery.data, teamId]);

  const handlePickPhoto = async () => {
    if (!teamId) {
      Alert.alert('Team Required', 'Photo messages can only be sent to a team channel.');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please grant photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.65,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const name = asset.fileName ?? `team_chat_${Date.now()}.jpg`;
    const rawType = (asset as { mimeType?: string }).mimeType ?? asset.type;
    const type = rawType?.startsWith('image/') ? rawType : 'image/jpeg';
    const size = (asset as { fileSize?: number }).fileSize;

    if (size && size > 1024 * 1024) {
      Alert.alert('Photo Too Large', 'Team chat photos must be under 1MB.');
      return;
    }

    setPhoto({
      uri: asset.uri,
      name,
      type,
      size,
    });
  };

  const handleMotivate = async () => {
    if (!teamId) return;
    setMotivating(true);
    try {
      const response = await generateTeamMotivation(leagueId, teamId);
      if (response.success && response.message) {
        setContent(response.message);
      } else {
        Alert.alert('Motivation Failed', response.error || 'Could not generate a message.');
      }
    } catch (error) {
      Alert.alert(
        'Motivation Failed',
        error instanceof Error ? error.message : 'Could not generate a message.',
      );
    } finally {
      setMotivating(false);
    }
  };

  const optimisticIdRef = useRef<string | null>(null);

  const handleSend = async () => {
    if (!canSend || isBusy) return;

    let photoUrl: string | null = null;
    if (photo) {
      if (!teamId) {
        Alert.alert('Team Required', 'Photo messages can only be sent to a team channel.');
        return;
      }
      setUploadingPhoto(true);
      try {
        photoUrl = await uploadTeamChatPhoto(leagueId, teamId, photo);
      } catch (error) {
        Alert.alert(
          'Upload Failed',
          error instanceof Error ? error.message : 'Could not upload photo.',
        );
        setUploadingPhoto(false);
        return;
      }
      setUploadingPhoto(false);
    }

    // Build and inject optimistic message immediately
    if (onOptimisticMessage && senderId) {
      const optimisticId = `optimistic-${Date.now()}`;
      optimisticIdRef.current = optimisticId;
      const optimistic: ChatMessage = {
        messageId: optimisticId,
        leagueId,
        teamId: teamId ?? null,
        senderId,
        senderName: senderUsername ?? null,
        senderUsername: senderUsername ?? 'You',
        senderRole: currentRole,
        content: content.trim() || (photoUrl ? 'Photo' : ''),
        messageType: isAnnouncement ? 'announcement' : 'chat',
        visibility,
        isImportant,
        parentMessageId: replyTo?.messageId ?? null,
        parentMessage: replyTo
          ? { senderUsername: replyTo.senderUsername, content: replyTo.content }
          : null,
        deepLink: deepLink ?? null,
        photoUrl: photoUrl ?? (photo ? photo.uri : null),
        createdAt: new Date().toISOString(),
        editedAt: null,
        isRead: true,
        reactions: [],
      };
      onOptimisticMessage(optimistic);
    }

    sendMutation.mutate(
      {
        leagueId,
        content: content.trim() || (photoUrl ? 'Photo' : ''),
        teamId,
        messageType: isAnnouncement ? 'announcement' : 'chat',
        visibility,
        isImportant,
        parentMessageId: replyTo?.messageId ?? null,
        deepLink,
        photoUrl,
      },
      {
        onSuccess: () => {
          optimisticIdRef.current = null;
          setContent('');
          setVisibility('all');
          setIsAnnouncement(false);
          setIsImportant(false);
          setDeepLink(null);
          setPhoto(null);
          onCancelReply();
          onSent();
        },
        onError: (error) => {
          if (optimisticIdRef.current && onSendFailed) {
            onSendFailed(optimisticIdRef.current);
          }
          optimisticIdRef.current = null;
          Alert.alert('Send Failed', error.message);
        },
      },
    );
  };

  const insertCannedMessage = (message: CannedMessage) => {
    setContent((current) => (current ? `${current}\n${message.content}` : message.content));
    setModal(null);
  };

  const insertMention = (member: ChatMember) => {
    setContent((current) => `${current}${current.endsWith(' ') || !current ? '' : ' '}@[${member.username}] `);
    setModal(null);
  };

  const attachWorkout = (workout: RecentWorkout) => {
    const label = getWorkoutDeepLinkLabel(workout);
    const params = new URLSearchParams({
      submissionId: workout.id,
      label,
    });
    setDeepLink(`/leagues/${leagueId}/submit?${params.toString()}`);
    setModal(null);
  };

  const attachStaticLink = (section: 'challenges' | 'leaderboard' | 'activities') => {
    setDeepLink(`/leagues/${leagueId}/${section}`);
    setModal(null);
  };

  return (
    <View
      className="border-t bg-card px-4 pt-2"
      style={{ borderTopColor: mflColors.border }}
    >
      {replyTo ? (
        <View
          className="mb-2 flex-row items-center gap-2 rounded-xl border-l-2 px-3 py-2"
          style={{ backgroundColor: mflColors.surface, borderLeftColor: mflColors.brand }}
        >
          <Feather name="corner-up-left" size={14} color={mflColors.brand} />
          <View className="flex-1">
            <AppText className="text-xs font-semibold" style={{ color: mflColors.brand }}>
              {replyTo.senderName || replyTo.senderUsername}
            </AppText>
            <AppText className="text-xs text-muted" numberOfLines={1}>
              {replyTo.content || 'Photo'}
            </AppText>
          </View>
          <Pressable onPress={onCancelReply} hitSlop={10}>
            <Feather name="x" size={18} color={mflColors.textMuted} />
          </Pressable>
        </View>
      ) : null}

      {deepLink || photo || visibility === 'captains_only' || isAnnouncement || isImportant ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <View className="flex-row gap-2 pr-4">
            {isAnnouncement ? (
              <MessagingChip
                label="Announcement"
                icon="radio"
                selected
                tone="amber"
                onPress={() => setIsAnnouncement(false)}
              />
            ) : null}
            {visibility === 'captains_only' ? (
              <MessagingChip
                label={currentRole === 'player' ? 'DM to Captain' : 'Captains Only'}
                icon="shield"
                selected
                onPress={() => setVisibility('all')}
              />
            ) : null}
            {isImportant ? (
              <MessagingChip
                label="Important"
                icon="alert-triangle"
                selected
                tone="danger"
                onPress={() => setIsImportant(false)}
              />
            ) : null}
            {deepLink ? (
              <MessagingChip
                label="Link attached"
                icon="link"
                selected
                tone="brand"
                onPress={() => setDeepLink(null)}
              />
            ) : null}
            {photo ? (
              <MessagingChip
                label="Photo attached"
                icon="image"
                selected
                tone="brand"
                onPress={() => setPhoto(null)}
              />
            ) : null}
          </View>
        </ScrollView>
      ) : null}

      {photo ? (
        <View className="mb-2 flex-row items-center gap-3">
          <Image
            source={{ uri: photo.uri }}
            style={{ width: 54, height: 54, borderRadius: 10 }}
            resizeMode="cover"
          />
          <AppText className="flex-1 text-xs text-muted" numberOfLines={1}>
            {photo.name}
          </AppText>
        </View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
        <View className="flex-row gap-2 pr-4">
          <MessagingChip
            label={visibility === 'captains_only' ? 'Captains' : 'All'}
            icon={visibility === 'captains_only' ? 'shield' : 'globe'}
            selected={visibility === 'captains_only'}
            onPress={() =>
              setVisibility((current) =>
                current === 'captains_only' ? 'all' : 'captains_only',
              )
            }
          />
          {isLeader ? (
            <>
              <MessagingChip
                label="Announcement"
                icon="radio"
                selected={isAnnouncement}
                tone="amber"
                onPress={() => setIsAnnouncement((current) => !current)}
              />
              <MessagingChip
                label="Important"
                icon="alert-triangle"
                selected={isImportant}
                tone="danger"
                onPress={() => setIsImportant((current) => !current)}
              />
            </>
          ) : null}
          <MessagingChip label="Quick" icon="message-square" onPress={() => setModal('quick')} />
          <MessagingChip label="Mention" icon="at-sign" onPress={() => setModal('mention')} />
          <MessagingChip label="Link" icon="link" onPress={() => setModal('link')} />
          {showPhotoAction ? (
            <MessagingChip label="Photo" icon="image" onPress={handlePickPhoto} />
          ) : null}
          {isCaptainRole && teamId ? (
            <MessagingChip
              label={motivating ? 'Writing...' : 'Send Motivation'}
              icon="zap"
              disabled={motivating}
              onPress={handleMotivate}
              tone="amber"
            />
          ) : null}
        </View>
      </ScrollView>

      <View className="flex-row items-end gap-2">
        <TextInput
          ref={inputRef}
          className="flex-1 rounded-2xl px-4 py-2 text-sm"
          style={{
            minHeight: 42,
            maxHeight: 110,
            backgroundColor: mflColors.surface,
            color: mflColors.text,
          }}
          placeholder="Type a message..."
          placeholderTextColor={mflColors.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={1000}
        />
        <Button
          variant="primary"
          size="sm"
          onPress={handleSend}
          isDisabled={!canSend || isBusy}
          className="mb-1"
          style={{ backgroundColor: canSend && !isBusy ? mflColors.brand : mflColors.textMuted }}
        >
          {isBusy ? <Spinner size="sm" /> : <Button.Label>Send</Button.Label>}
        </Button>
      </View>

      <PickerModal
        visible={modal === 'quick'}
        title="Quick Messages"
        onClose={() => setModal(null)}
      >
        <MessagePickerContent
          isLoading={cannedQuery.isLoading}
          emptyLabel="No quick messages."
          items={cannedQuery.data ?? []}
          renderItem={(message) => (
            <PickerRow
              key={message.id}
              title={message.title}
              subtitle={message.content}
              onPress={() => insertCannedMessage(message)}
            />
          )}
        />
      </PickerModal>

      <PickerModal
        visible={modal === 'mention'}
        title="Mention Member"
        onClose={() => setModal(null)}
      >
        <MessagePickerContent
          isLoading={membersQuery.isLoading}
          emptyLabel="No members found."
          items={visibleMembers}
          renderItem={(member) => (
            <PickerRow
              key={member.userId}
              title={`@${member.username}`}
              subtitle={member.roles.join(', ') || 'player'}
              onPress={() => insertMention(member)}
            />
          )}
        />
      </PickerModal>

      <PickerModal
        visible={modal === 'link'}
        title="Attach Link"
        onClose={() => setModal(null)}
      >
        <View className="gap-2">
          <PickerRow
            title="Challenges"
            subtitle="League challenges"
            onPress={() => attachStaticLink('challenges')}
          />
          <PickerRow
            title="Leaderboard"
            subtitle="Current standings"
            onPress={() => attachStaticLink('leaderboard')}
          />
          <PickerRow
            title="Activities"
            subtitle="Activity configuration"
            onPress={() => attachStaticLink('activities')}
          />
          <AppText className="px-1 pt-2 text-xs font-semibold text-muted">
            Recent Activities
          </AppText>
          <MessagePickerContent
            isLoading={workoutsQuery.isLoading}
            emptyLabel="No recent workouts."
            items={workoutsQuery.data ?? []}
            renderItem={(workout) => (
              <PickerRow
                key={workout.id}
                title={getWorkoutDisplayName(workout)}
                subtitle={`${workout.status.replace(/_/g, ' ')} | ${new Date(workout.date).toLocaleDateString()}`}
                onPress={() => attachWorkout(workout)}
              />
            )}
          />
        </View>
      </PickerModal>
    </View>
  );
});

function PickerModal({
  visible,
  title,
  children,
  onClose,
}: {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.28)' }}>
        <View
          className="max-h-[70%] rounded-t-3xl bg-card p-4"
          style={{ borderTopWidth: 1, borderColor: mflColors.border }}
        >
          <View className="mb-3 flex-row items-center gap-3">
            <AppText className="flex-1 text-base font-semibold text-foreground">
              {title}
            </AppText>
            <Pressable onPress={onClose} hitSlop={10}>
              <Feather name="x" size={22} color={mflColors.textMuted} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function MessagePickerContent<T>({
  isLoading,
  emptyLabel,
  items,
  renderItem,
}: {
  isLoading: boolean;
  emptyLabel: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  if (isLoading) {
    return (
      <View className="items-center py-8">
        <Spinner size="sm" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View className="items-center py-8">
        <AppText className="text-sm text-muted">{emptyLabel}</AppText>
      </View>
    );
  }

  return <View className="gap-2">{items.map(renderItem)}</View>;
}

function PickerRow({
  title,
  subtitle,
  onPress,
}: {
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl border px-3 py-3"
      style={{ backgroundColor: mflColors.card, borderColor: mflColors.border }}
    >
      <AppText className="text-sm font-semibold text-foreground" numberOfLines={1}>
        {title}
      </AppText>
      <AppText className="mt-0.5 text-xs text-muted" numberOfLines={2}>
        {subtitle}
      </AppText>
    </Pressable>
  );
}
