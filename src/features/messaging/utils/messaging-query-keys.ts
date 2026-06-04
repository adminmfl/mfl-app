import type { ChatFilter } from '../types/messaging.model';

export const messagingQueryKeys = {
  all: ['messaging'] as const,
  messagesRoot: (leagueId: string) =>
    [...messagingQueryKeys.all, leagueId, 'messages'] as const,
  messages: (
    leagueId: string,
    params: {
      teamId?: string | null;
      filter: ChatFilter;
      adminView: boolean;
    },
  ) => [...messagingQueryKeys.messagesRoot(leagueId), params] as const,
  unread: (leagueId: string) =>
    [...messagingQueryKeys.all, leagueId, 'unread-count'] as const,
  teams: (leagueId: string) =>
    [...messagingQueryKeys.all, leagueId, 'teams'] as const,
  members: (leagueId: string) =>
    [...messagingQueryKeys.all, leagueId, 'members'] as const,
  cannedMessages: (leagueId: string) =>
    [...messagingQueryKeys.all, leagueId, 'canned-messages'] as const,
  recentWorkouts: (leagueId: string) =>
    [...messagingQueryKeys.all, leagueId, 'recent-workouts'] as const,
};
