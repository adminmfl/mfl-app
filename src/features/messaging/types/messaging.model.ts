import type { ChatFilterDTO, ChatMessageTypeDTO, ChatVisibilityDTO } from './messaging.dto';

export type ChatFilter = ChatFilterDTO;
export type ChatMessageType = ChatMessageTypeDTO;
export type ChatVisibility = ChatVisibilityDTO;

export interface ChatReaction {
  emoji: string;
  userIds: string[];
}

export interface ParentMessagePreview {
  content: string;
  senderUsername: string;
}

export interface ChatMessage {
  messageId: string;
  leagueId: string;
  teamId: string | null;
  senderId: string;
  senderName: string | null;
  senderUsername: string;
  senderRole: string | null;
  content: string;
  messageType: ChatMessageType;
  visibility: ChatVisibility;
  isImportant: boolean;
  parentMessageId: string | null;
  parentMessage: ParentMessagePreview | null;
  deepLink: string | null;
  photoUrl: string | null;
  createdAt: string;
  editedAt: string | null;
  isRead: boolean;
  reactions: ChatReaction[];
}

export interface ChatTeam {
  teamId: string;
  teamName: string;
  leagueId: string | null;
  logoUrl: string | null;
  memberCount: number;
}

export interface ChatMember {
  leagueMemberId: string;
  userId: string;
  leagueId: string;
  teamId: string | null;
  username: string;
  roles: string[];
}

export interface CannedMessage {
  id: string;
  title: string;
  content: string;
  category: string;
}

export interface RecentWorkout {
  id: string;
  date: string;
  type: 'workout' | 'rest';
  workoutType: string | null;
  customActivityName: string | null;
  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'rejected_resubmit'
    | 'rejected_permanent';
  duration: number | null;
  distance: number | null;
  steps: number | null;
  holes: number | null;
  rrValue: number | null;
}

export interface PickedChatPhoto {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export interface SendChatMessageInput {
  leagueId: string;
  content: string;
  teamId?: string | null;
  messageType: ChatMessageType;
  visibility: ChatVisibility;
  isImportant: boolean;
  parentMessageId?: string | null;
  deepLink?: string | null;
  photoUrl?: string | null;
}
