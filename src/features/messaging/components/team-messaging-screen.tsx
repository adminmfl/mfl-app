import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { useAuth } from '../../../core/auth';
import { AppRoutes } from '../../../core/config/routes';
import { useRole } from '../../../contexts/role-context';
import { useUserProfile } from '../../profile/hooks/use-user-profile';
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
import { ChatComposer, type ChatComposerHandle } from './chat-composer';
import { ChatHeader } from './chat-header';
import { ChatMessageList } from './chat-message-list';
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
  const profileQuery = useUserProfile();

  // ── State ────────────────────────────────────────────────────────────────
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [adminView, setAdminView] = useState(false);
  const [filter, setFilter] = useState<ChatFilter>('all');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const composerRef = useRef<ChatComposerHandle>(null);

  useEffect(() => {
    if (!selectedTeamId) setAdminView(false);
  }, [selectedTeamId]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const teamsQuery = useChatTeams(leagueId, isLeader);
  const teams = teamsQuery.data ?? [];

  const selectedTeam = useMemo(
    () => teams.find((team: ChatTeam) => team.teamId === selectedTeamId) ?? null,
    [selectedTeamId, teams],
  );

  const channelTeamId = isLeader ? selectedTeamId : league.teamId;
  const channelName = isLeader
    ? selectedTeam?.teamName ?? 'All Teams (Broadcast)'
    : league.teamName ?? 'Team Messages';

  // ── Data hooks ───────────────────────────────────────────────────────────
  const messagesQuery = useChatMessages({
    leagueId,
    teamId: channelTeamId,
    filter,
    adminView: isLeader && !!selectedTeamId && adminView,
  });
  const unreadQuery = useUnreadChatCount(leagueId);
  const reactionMutation = useToggleChatReaction();

  const messages = messagesQuery.data ?? [];

  // ── Mark read ────────────────────────────────────────────────────────────
  useEffect(() => {
    const unreadIds = messages
      .filter((m) => !m.isRead && m.senderId !== user?.id)
      .map((m) => m.messageId);

    if (unreadIds.length === 0) return;

    markChatMessagesRead(leagueId, unreadIds)
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: messagingQueryKeys.unread(leagueId),
        });
      })
      .catch(() => {
        // Non-blocking — badge self-corrects on next poll.
      });
  }, [leagueId, messages, queryClient, user?.id]);

  // ── Refresh ──────────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      messagesQuery.refetch(),
      unreadQuery.refetch(),
      isLeader ? teamsQuery.refetch() : Promise.resolve(),
    ]);
    setRefreshing(false);
  }, [isLeader, messagesQuery, teamsQuery, unreadQuery]);

  // ── Deep link navigation ─────────────────────────────────────────────────
  const openDeepLink = useCallback(
    (path: string) => {
      const section = getDeepLinkSection(path);
      if (section === 'challenges') {
        router.push(AppRoutes.challenges);
      } else if (section === 'leaderboard') {
        router.push(AppRoutes.leaderboard);
      } else if (section === 'activities' || section === 'submit') {
        router.push(AppRoutes.logActivity);
      } else if (section === 'manual-entry') {
        router.push(AppRoutes.manualEntry);
      } else if (section === 'my-team') {
        router.push(AppRoutes.myTeam);
      } else if (section === 'rules') {
        router.push(AppRoutes.leagueRules);
      } else if (section === 'settings') {
        router.push(AppRoutes.leagueSettings);
      } else if (section === 'analytics') {
        router.push(AppRoutes.analytics);
      } else if (section === 'validate' || section === 'submissions') {
        router.push(AppRoutes.submissionValidation);
      }
    },
    [router],
  );

  // ── Optimistic message helpers ───────────────────────────────────────────
  const activeQueryKey = useMemo(
    () =>
      messagingQueryKeys.messages(leagueId, {
        teamId: channelTeamId ?? null,
        filter,
        adminView: isLeader && !!selectedTeamId && adminView,
      }),
    [leagueId, channelTeamId, filter, isLeader, selectedTeamId, adminView],
  );

  const handleOptimisticMessage = useCallback(
    (optimistic: ChatMessage) => {
      queryClient.setQueryData<ChatMessage[]>(activeQueryKey, (old) => [
        optimistic,
        ...(old ?? []),
      ]);
    },
    [activeQueryKey, queryClient],
  );

  const handleSendFailed = useCallback(
    (msgId: string) => {
      queryClient.setQueryData<ChatMessage[]>(activeQueryKey, (old) =>
        (old ?? []).filter((m) => m.messageId !== msgId),
      );
    },
    [activeQueryKey, queryClient],
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
      style={{ backgroundColor: mflColors.surface, paddingTop: insets.top }}
    >
      <ChatHeader channelName={channelName} unreadCount={unreadQuery.data ?? 0} />

      <View className="gap-2 px-4 pt-3 pb-2">
        {isLeader ? (
          <ChatChannelSelector
            teams={teams}
            isLoading={teamsQuery.isLoading}
            isError={teamsQuery.isError}
            selectedTeamId={selectedTeamId}
            adminView={adminView}
            onSelectTeam={setSelectedTeamId}
            onToggleAdminView={() => setAdminView((v) => !v)}
            onRetry={() => teamsQuery.refetch()}
          />
        ) : null}

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {FILTER_OPTIONS.map((option) => (
            <MessagingChip
              key={option.value}
              label={option.label}
              selected={filter === option.value}
              onPress={() => setFilter(option.value)}
            />
          ))}
        </ScrollView>
      </View>

      <View className="flex-1">
        <ChatMessageList
          messages={messages}
          isLoading={messagesQuery.isLoading}
          isError={messagesQuery.isError}
          refreshing={refreshing}
          currentUserId={user?.id}
          isCaptainRole={isCaptainRole}
          filter={filter}
          onRefresh={refresh}
          onRetry={() => messagesQuery.refetch()}
          onReply={setReplyTo}
          onReact={(messageId, emoji) =>
            reactionMutation.mutate({ leagueId, messageId, emoji, userId: user?.id })
          }
          onOpenDeepLink={openDeepLink}
          onFocusComposer={() => composerRef.current?.focusInput()}
        />
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
            ref={composerRef}
            leagueId={leagueId}
            teamId={channelTeamId}
            currentRole={activeRole}
            isLeader={isLeader}
            isCaptainRole={isCaptainRole}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onSent={() => {
              queryClient.invalidateQueries({ queryKey: activeQueryKey });
              queryClient.invalidateQueries({ queryKey: messagingQueryKeys.unread(leagueId) });
            }}
            senderId={user?.id}
            senderUsername={profileQuery.data?.username}
            onOptimisticMessage={handleOptimisticMessage}
            onSendFailed={handleSendFailed}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function getDeepLinkSection(path: string): string | null {
  const normalized = path.replace(/\/+$/, '');
  const match = normalized.match(/\/leagues\/[^/]+\/(.+)/);
  if (match?.[1]) return match[1].split('/')[0] ?? null;
  return normalized.split('/').filter(Boolean).at(-1) ?? null;
}
