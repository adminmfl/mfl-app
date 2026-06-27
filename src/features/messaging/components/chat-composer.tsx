import Feather from '@expo/vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
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
import { getWorkoutDeepLinkLabel } from '../utils/messaging-format';
import {
  ComposerModifierStrip,
  ComposerActionChips,
  ComposerPickerModals,
} from './composer-picker-modal';

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

      <ComposerModifierStrip
        currentRole={currentRole}
        isAnnouncement={isAnnouncement}
        isImportant={isImportant}
        isCaptainsOnly={visibility === 'captains_only'}
        deepLink={deepLink}
        photo={photo}
        onClearAnnouncement={() => setIsAnnouncement(false)}
        onClearCaptainsOnly={() => setVisibility('all')}
        onClearImportant={() => setIsImportant(false)}
        onClearDeepLink={() => setDeepLink(null)}
        onClearPhoto={() => setPhoto(null)}
      />

      <ComposerActionChips
        visibility={visibility}
        isAnnouncement={isAnnouncement}
        isImportant={isImportant}
        isLeader={isLeader}
        isCaptainRole={isCaptainRole}
        motivating={motivating}
        showPhotoAction={showPhotoAction}
        hasTeam={!!teamId}
        currentRole={currentRole}
        onToggleVisibility={() =>
          setVisibility((current) => (current === 'captains_only' ? 'all' : 'captains_only'))
        }
        onToggleAnnouncement={() => setIsAnnouncement((current) => !current)}
        onToggleImportant={() => setIsImportant((current) => !current)}
        onOpenQuick={() => setModal('quick')}
        onOpenMention={() => setModal('mention')}
        onOpenLink={() => setModal('link')}
        onPickPhoto={handlePickPhoto}
        onMotivate={handleMotivate}
      />

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

      <ComposerPickerModals
        modal={modal}
        cannedLoading={cannedQuery.isLoading}
        cannedMessages={cannedQuery.data ?? []}
        membersLoading={membersQuery.isLoading}
        visibleMembers={visibleMembers}
        workoutsLoading={workoutsQuery.isLoading}
        workouts={workoutsQuery.data ?? []}
        onClose={() => setModal(null)}
        onSelectCanned={insertCannedMessage}
        onSelectMember={insertMention}
        onAttachStaticLink={attachStaticLink}
        onAttachWorkout={attachWorkout}
      />
    </View>
  );
});
