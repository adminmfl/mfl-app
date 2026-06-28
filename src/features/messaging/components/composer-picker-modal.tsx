/**
 * composer-picker-modal.tsx
 * Shared UI primitives and sub-components for ChatComposer:
 *   PickerModal, MessagePickerContent, PickerRow
 *   ComposerModifierStrip, ComposerActionChips, ComposerPickerModals
 */
import Feather from '@expo/vector-icons/Feather';
import type React from 'react';
import { Image, Modal, Pressable, ScrollView, View } from 'react-native';
import { Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type {
  CannedMessage,
  ChatMember,
  ChatVisibility,
  PickedChatPhoto,
  RecentWorkout,
} from '../types/messaging.model';
import { getWorkoutDisplayName } from '../utils/messaging-format';
import { MessagingChip } from './messaging-chip';

// ---------------------------------------------------------------------------
// PickerModal
// ---------------------------------------------------------------------------

interface PickerModalProps {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

export function PickerModal({ visible, title, children, onClose }: PickerModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.28)' }}>
        <View
          className="max-h-[70%] rounded-t-3xl bg-card p-4"
          style={{ borderTopWidth: 1, borderColor: mflColors.border }}
        >
          <View className="mb-3 flex-row items-center gap-3">
            <AppText className="flex-1 text-base font-semibold text-foreground">{title}</AppText>
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

// ---------------------------------------------------------------------------
// MessagePickerContent
// ---------------------------------------------------------------------------

interface MessagePickerContentProps<T> {
  isLoading: boolean;
  emptyLabel: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

export function MessagePickerContent<T>({
  isLoading,
  emptyLabel,
  items,
  renderItem,
}: MessagePickerContentProps<T>) {
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

// ---------------------------------------------------------------------------
// PickerRow
// ---------------------------------------------------------------------------

interface PickerRowProps {
  title: string;
  subtitle: string;
  onPress: () => void;
}

export function PickerRow({ title, subtitle, onPress }: PickerRowProps) {
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

// ---------------------------------------------------------------------------
// ComposerModifierStrip
// Active modifier pills displayed above the input row
// ---------------------------------------------------------------------------

interface ComposerModifierStripProps {
  currentRole: string | null;
  isAnnouncement: boolean;
  isImportant: boolean;
  isCaptainsOnly: boolean;
  deepLink: string | null;
  photo: PickedChatPhoto | null;
  onClearAnnouncement: () => void;
  onClearCaptainsOnly: () => void;
  onClearImportant: () => void;
  onClearDeepLink: () => void;
  onClearPhoto: () => void;
}

export function ComposerModifierStrip({
  currentRole,
  isAnnouncement,
  isImportant,
  isCaptainsOnly,
  deepLink,
  photo,
  onClearAnnouncement,
  onClearCaptainsOnly,
  onClearImportant,
  onClearDeepLink,
  onClearPhoto,
}: ComposerModifierStripProps) {
  const hasModifier = deepLink || photo || isCaptainsOnly || isAnnouncement || isImportant;
  if (!hasModifier) return null;

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
        <View className="flex-row gap-2 pr-4">
          {isAnnouncement ? (
            <MessagingChip label="Announcement" icon="radio" selected tone="amber" onPress={onClearAnnouncement} />
          ) : null}
          {isCaptainsOnly ? (
            <MessagingChip
              label={currentRole === 'player' ? 'DM to Captain' : 'Captains Only'}
              icon="shield"
              selected
              onPress={onClearCaptainsOnly}
            />
          ) : null}
          {isImportant ? (
            <MessagingChip label="Important" icon="alert-triangle" selected tone="danger" onPress={onClearImportant} />
          ) : null}
          {deepLink ? (
            <MessagingChip label="Link attached" icon="link" selected tone="brand" onPress={onClearDeepLink} />
          ) : null}
          {photo ? (
            <MessagingChip label="Photo attached" icon="image" selected tone="brand" onPress={onClearPhoto} />
          ) : null}
        </View>
      </ScrollView>
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
    </>
  );
}

// ---------------------------------------------------------------------------
// ComposerActionChips
// Horizontal chip row: visibility · announcement · important · quick · mention
// link · photo · motivate
// ---------------------------------------------------------------------------

interface ComposerActionChipsProps {
  visibility: ChatVisibility;
  isAnnouncement: boolean;
  isImportant: boolean;
  isLeader: boolean;
  isCaptainRole: boolean;
  motivating: boolean;
  showPhotoAction: boolean;
  hasTeam: boolean;
  onToggleVisibility: () => void;
  onToggleAnnouncement: () => void;
  onToggleImportant: () => void;
  onOpenQuick: () => void;
  onOpenMention: () => void;
  onOpenLink: () => void;
  onPickPhoto: () => void;
  onMotivate: () => void;
}

export function ComposerActionChips({
  visibility,
  isAnnouncement,
  isImportant,
  isLeader,
  isCaptainRole,
  motivating,
  showPhotoAction,
  hasTeam,
  onToggleVisibility,
  onToggleAnnouncement,
  onToggleImportant,
  onOpenQuick,
  onOpenMention,
  onOpenLink,
  onPickPhoto,
  onMotivate,
}: ComposerActionChipsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
      <View className="flex-row gap-2 pr-4">
        <MessagingChip
          label={visibility === 'captains_only' ? 'Captains' : 'All'}
          icon={visibility === 'captains_only' ? 'shield' : 'globe'}
          selected={visibility === 'captains_only'}
          onPress={onToggleVisibility}
        />
        {isLeader ? (
          <>
            <MessagingChip
              label="Announcement"
              icon="radio"
              selected={isAnnouncement}
              tone="amber"
              onPress={onToggleAnnouncement}
            />
            <MessagingChip
              label="Important"
              icon="alert-triangle"
              selected={isImportant}
              tone="danger"
              onPress={onToggleImportant}
            />
          </>
        ) : null}
        <MessagingChip label="Quick" icon="message-square" onPress={onOpenQuick} />
        <MessagingChip label="Mention" icon="at-sign" onPress={onOpenMention} />
        <MessagingChip label="Link" icon="link" onPress={onOpenLink} />
        {showPhotoAction ? <MessagingChip label="Photo" icon="image" onPress={onPickPhoto} /> : null}
        {isCaptainRole && hasTeam ? (
          <MessagingChip
            label={motivating ? 'Writing...' : 'Send Motivation'}
            icon="zap"
            disabled={motivating}
            onPress={onMotivate}
            tone="amber"
          />
        ) : null}
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// ComposerPickerModals
// The 3 bottom-sheet modals: Quick Messages, Mention Member, Attach Link
// ---------------------------------------------------------------------------

type ComposerModal = 'quick' | 'mention' | 'link' | null;

interface ComposerPickerModalsProps {
  modal: ComposerModal;
  cannedLoading: boolean;
  cannedMessages: CannedMessage[];
  membersLoading: boolean;
  visibleMembers: ChatMember[];
  workoutsLoading: boolean;
  workouts: RecentWorkout[];
  onClose: () => void;
  onSelectCanned: (message: CannedMessage) => void;
  onSelectMember: (member: ChatMember) => void;
  onAttachStaticLink: (section: 'challenges' | 'leaderboard' | 'activities') => void;
  onAttachWorkout: (workout: RecentWorkout) => void;
}

export function ComposerPickerModals({
  modal,
  cannedLoading,
  cannedMessages,
  membersLoading,
  visibleMembers,
  workoutsLoading,
  workouts,
  onClose,
  onSelectCanned,
  onSelectMember,
  onAttachStaticLink,
  onAttachWorkout,
}: ComposerPickerModalsProps) {
  return (
    <>
      <PickerModal visible={modal === 'quick'} title="Quick Messages" onClose={onClose}>
        <MessagePickerContent
          isLoading={cannedLoading}
          emptyLabel="No quick messages."
          items={cannedMessages}
          renderItem={(msg) => (
            <PickerRow key={msg.id} title={msg.title} subtitle={msg.content} onPress={() => onSelectCanned(msg)} />
          )}
        />
      </PickerModal>

      <PickerModal visible={modal === 'mention'} title="Mention Member" onClose={onClose}>
        <MessagePickerContent
          isLoading={membersLoading}
          emptyLabel="No members found."
          items={visibleMembers}
          renderItem={(member) => (
            <PickerRow
              key={member.userId}
              title={`@${member.username}`}
              subtitle={member.roles.join(', ') || 'player'}
              onPress={() => onSelectMember(member)}
            />
          )}
        />
      </PickerModal>

      <PickerModal visible={modal === 'link'} title="Attach Link" onClose={onClose}>
        <View className="gap-2">
          <PickerRow
            title="Challenges"
            subtitle="League challenges"
            onPress={() => onAttachStaticLink('challenges')}
          />
          <PickerRow
            title="Leaderboard"
            subtitle="Current standings"
            onPress={() => onAttachStaticLink('leaderboard')}
          />
          <PickerRow
            title="Activities"
            subtitle="Activity configuration"
            onPress={() => onAttachStaticLink('activities')}
          />
          <AppText className="px-1 pt-2 text-xs font-semibold text-muted">
            Recent Activities
          </AppText>
          <MessagePickerContent
            isLoading={workoutsLoading}
            emptyLabel="No recent workouts."
            items={workouts}
            renderItem={(workout) => (
              <PickerRow
                key={workout.id}
                title={getWorkoutDisplayName(workout)}
                subtitle={`${workout.status.replace(/_/g, ' ')} | ${new Date(workout.date).toLocaleDateString()}`}
                onPress={() => onAttachWorkout(workout)}
              />
            )}
          />
        </View>
      </PickerModal>
    </>
  );
}
