import { useUnreadChatCount } from '../../messaging';
import { UnreadMessagesCard } from './unread-messages-card';

export function LeagueUnreadMessages({
  leagueId,
  leagueName,
}: {
  leagueId: string;
  leagueName: string;
}) {
  const { data: unreadCount } = useUnreadChatCount(leagueId);

  if (!unreadCount || unreadCount === 0) return null;

  return <UnreadMessagesCard leagueName={leagueName} count={unreadCount} />;
}
