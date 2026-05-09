import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/app-text';
import { ScreenState } from '../../../components/screen-state';
import { mflColors } from '../../../constants/colors';
import { useAuth } from '../../../core/auth';
import { useRole } from '../../../contexts/role-context';
import type { UserLeague } from '../../leagues/types/league.model';
import { useChatMessages } from '../hooks/use-chat-messages';
import { useChatTeams } from '../hooks/use-chat-teams';
import { useToggleChatReaction } from '../hooks/use-toggle-chat-reaction';
import { useUnreadChatCount } from '../hooks/use-unread-chat-count';
import { markChatMessagesRead } from '../services/messaging.service';
import type {
  ChatFilter,
  ChatMessage,
  ChatTeam,
} from '../types/messaging.model';
import { messagingQueryKeys } from '../utils/messaging-query-keys';
import { ChatChannelSelector } from './chat-channel-selector';
import { ChatComposer } from './chat-composer';
import { ChatMessageBubble } from './chat-message-bubble';
import { MessagingChip } from './messaging-chip';

const FILTER_OPTIONS: { value: ChatFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'host_messages', label: 'Host' },
  { value: 'captains_only', label: 'Captains' },
  { value: 'important', label: 'Important' },
];

interface TeamMessagingScreenProps {
  league: UserLeague;
}

export function TeamMessagingScreen({ league }: TeamMessagingScreenProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeRole, isHost, isGovernor, isCaptain, isViceCaptain } = useRole();

  const leagueId = league.leagueId;
  const isLeader = isHost || isGovernor;
  const isCaptainRole = isCaptain || isViceCaptain;

  const teamsQuery = useChatTeams(leagueId, isLeader);
  const teams = teamsQuery.data ?? [];

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [adminView, setAdminView] = useState(false);
  const [filter, setFilter] = useState<ChatFilter>('all');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!selectedTeamId) setAdminView(false);
  }, [selectedTeamId]);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.teamId === selectedTeamId) ?? null,
    [selectedTeamId, teams],
  );

  const channelTeamId = isLeader ? selectedTeamId : league.teamId;
  const channelName = getChannelName({
    isLeader,
    selectedTeam,
    teamName: league.teamName,
  });

  const messagesQuery = useChatMessages({
    leagueId,
    teamId: channelTeamId,
    filter,
    adminView: isLeader && !!selectedTeamId && adminView,
  });
  const unreadQuery = useUnreadChatCount(leagueId);
  const reactionMutation = useToggleChatReaction();

  const messages = messagesQuery.data ?? [];

  useEffect(() => {
    const unreadIds = messages
      .filter((message) => !message.isRead && message.senderId !== user?.id)
      .map((message) => message.messageId);

    if (unreadIds.length === 0) return;

    markChatMessagesRead(leagueId, unreadIds)
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: messagingQueryKeys.unread(leagueId),
        });
      })
      .catch(() => {
        // Non-blocking. The badge refetches periodically and self-corrects.
      });
  }, [leagueId, messages, queryClient, user?.id]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      messagesQuery.refetch(),
      unreadQuery.refetch(),
      isLeader ? teamsQuery.refetch() : Promise.resolve(),
    ]);
    setRefreshing(false);
  }, [isLeader, messagesQuery, teamsQuery, unreadQuery]);

  const openDeepLink = useCallback(
    (path: string) => {
      const section = getDeepLinkSection(path);
      if (section === 'challenges') {
        router.push('/(app)/challenges' as any);
      } else if (section === 'leaderboard') {
        router.push('/(app)/(tabs)/leaderboard' as any);
      } else if (section === 'activities' || section === 'submit') {
        router.push('/(app)/log-activity' as any);
      } else if (section === 'manual-entry') {
        router.push('/(app)/manual-entry' as any);
      } else if (section === 'my-team') {
        router.push('/(app)/(tabs)/my-team' as any);
      } else if (section === 'rules') {
        router.push('/(app)/league-rules' as any);
      } else if (section === 'settings') {
        router.push('/(app)/league-settings' as any);
      } else if (section === 'analytics') {
        router.push('/(app)/analytics' as any);
      } else if (section === 'validate' || section === 'submissions') {
        router.push('/(app)/submission-validation' as any);
      }
    },
    [router],
  );

  const renderMessage = useCallback(
    ({ item }: ListRenderItemInfo<ChatMessage>) => (
      <ChatMessageBubble
        message={item}
        isOwn={item.senderId === user?.id}
        currentUserId={user?.id}
        onReply={setReplyTo}
        onReact={(messageId, emoji) => {
          reactionMutation.mutate(
            { leagueId, messageId, emoji },
            { onSuccess: () => messagesQuery.refetch() },
          );
        }}
        onOpenDeepLink={openDeepLink}
      />
    ),
    [leagueId, messagesQuery, openDeepLink, reactionMutation, user?.id],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.messageId, []);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
      style={{ backgroundColor: mflColors.surface, paddingTop: insets.top }}
    >
      <View
        className="border-b bg-card px-5 py-3"
        style={{ borderBottomColor: mflColors.border }}
      >
        <View className="flex-row items-center gap-2">
          <Feather name="message-circle" size={20} color={mflColors.brand} />
          <View className="flex-1">
            <AppText className="text-lg font-semibold text-foreground">
              Team Chat
            </AppText>
            <AppText className="text-xs text-muted" numberOfLines={1}>
              {channelName}
            </AppText>
          </View>
          {(unreadQuery.data ?? 0) > 0 ? (
            <View
              className="min-w-6 items-center justify-center rounded-full px-2 py-1"
              style={{ backgroundColor: mflColors.danger }}
            >
              <AppText className="text-xs font-bold" style={{ color: mflColors.white }}>
                {(unreadQuery.data ?? 0) > 99 ? '99+' : unreadQuery.data}
              </AppText>
            </View>
          ) : null}
        </View>
      </View>

      <View className="gap-3 px-4 py-3">
        {isLeader ? (
          <ChatChannelSelector
            teams={teams}
            isLoading={teamsQuery.isLoading}
            isError={teamsQuery.isError}
            selectedTeamId={selectedTeamId}
            adminView={adminView}
            onSelectTeam={setSelectedTeamId}
            onToggleAdminView={() => setAdminView((current) => !current)}
            onRetry={() => {
              teamsQuery.refetch();
            }}
          />
        ) : null}

        <View className="flex-row flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <MessagingChip
              key={option.value}
              label={option.label}
              selected={filter === option.value}
              onPress={() => setFilter(option.value)}
            />
          ))}
        </View>
      </View>

      <View className="flex-1">
        {messagesQuery.isLoading ? (
          <ScreenState screen="team-chat" state="loading" />
        ) : messagesQuery.isError ? (
          <ScreenState
            screen="team-chat"
            state="error"
            message="Failed to load messages."
            actionLabel="Retry"
            onAction={() => messagesQuery.refetch()}
          />
        ) : (
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            inverted
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={refresh} />
            }
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexGrow: messages.length === 0 ? 1 : undefined,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View
                className="flex-1 items-center justify-center py-12"
                style={{ transform: [{ scaleY: -1 }] }}
              >
                <AppText className="text-sm text-muted text-center">
                  {filter === 'all'
                    ? 'No messages yet.'
                    : `No ${FILTER_OPTIONS.find((option) => option.value === filter)?.label.toLowerCase()} messages.`}
                </AppText>
              </View>
            }
          />
        )}
      </View>

      {!isLeader && !league.teamId ? (
        <View
          className="border-t bg-card px-4 py-4"
          style={{ borderTopColor: mflColors.border, paddingBottom: insets.bottom + 12 }}
        >
          <AppText className="text-sm text-muted text-center">
            You need a team assignment before sending messages.
          </AppText>
        </View>
      ) : (
        <View style={{ paddingBottom: Math.max(insets.bottom, 8), backgroundColor: mflColors.card }}>
          <ChatComposer
            leagueId={leagueId}
            teamId={channelTeamId}
            currentRole={activeRole}
            isLeader={isLeader}
            isCaptainRole={isCaptainRole}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onSent={() => {
              messagesQuery.refetch();
              unreadQuery.refetch();
            }}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function getChannelName({
  isLeader,
  selectedTeam,
  teamName,
}: {
  isLeader: boolean;
  selectedTeam: ChatTeam | null;
  teamName: string | null;
}) {
  if (isLeader) {
    return selectedTeam ? selectedTeam.teamName : 'All Teams (Broadcast)';
  }
  return teamName || 'Team Messages';
}

function getDeepLinkSection(path: string): string | null {
  const normalized = path.replace(/\/+$/, '');
  const match = normalized.match(/\/leagues\/[^/]+\/(.+)/);
  if (match?.[1]) return match[1].split('/')[0] ?? null;
  return normalized.split('/').filter(Boolean).at(-1) ?? null;
}
