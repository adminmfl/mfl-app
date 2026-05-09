import type Feather from '@expo/vector-icons/Feather';

export type NotificationType =
  | 'submission_approved'
  | 'submission_rejected'
  | 'unread_messages'
  | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: React.ComponentProps<typeof Feather>['name'];
  iconColor: string;
  iconBg: string;
}
