export const NotificationEvents = {
  ACTIVITY_APPROVED: 'activity_approved',
  ACTIVITY_REJECTED: 'activity_rejected',
  CHALLENGE_STARTED: 'challenge_started',
  CHALLENGE_ENDING_REMINDER: 'challenge_ending_reminder',
  TEAM_CHAT_MESSAGE: 'team_chat_message',
  LEAGUE_INVITATION: 'league_invitation',
  LEADERBOARD_POSITION_CHANGE: 'leaderboard_position_change',
  REST_DAY_REMINDER: 'rest_day_reminder',
  DAILY_ACTIVITY_REMINDER: 'daily_activity_reminder',
} as const;

export type NotificationEvent =
  (typeof NotificationEvents)[keyof typeof NotificationEvents];

export const NotificationScreenTargets: Record<NotificationEvent, string> = {
  [NotificationEvents.ACTIVITY_APPROVED]: '/(app)/submission-detail',
  [NotificationEvents.ACTIVITY_REJECTED]: '/(app)/reupload-submission',
  [NotificationEvents.CHALLENGE_STARTED]: '/(app)/challenges',
  [NotificationEvents.CHALLENGE_ENDING_REMINDER]: '/(app)/challenges',
  [NotificationEvents.TEAM_CHAT_MESSAGE]: '/(app)/(tabs)/team-chat',
  [NotificationEvents.LEAGUE_INVITATION]: '/(app)/join-league',
  [NotificationEvents.LEADERBOARD_POSITION_CHANGE]: '/(app)/(tabs)/leaderboard',
  [NotificationEvents.REST_DAY_REMINDER]: '/(app)/rest-day-donations',
  [NotificationEvents.DAILY_ACTIVITY_REMINDER]: '/(app)/(tabs)/dashboard',
};
