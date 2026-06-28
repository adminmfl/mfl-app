import type { ChatFilter } from '../types/messaging.model';

export const FILTER_OPTIONS: { value: ChatFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'announcements', label: 'Announcements' },
  { value: 'host_messages', label: 'Host' },
  { value: 'captains_only', label: 'Captains' },
  { value: 'important', label: 'Important' },
];
