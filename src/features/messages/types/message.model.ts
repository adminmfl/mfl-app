export interface Message {
  messageId: string;
  leagueId: string;
  senderId: string;
  senderUsername: string;
  senderName: string | null;
  senderRole: string | null;
  teamId: string | null;
  content: string;
  messageType: string;
  visibility: string;
  isImportant: boolean;
  parentMessageId: string | null;
  photoUrl: string | null;
  createdAt: string;
  isRead: boolean;
  reactions: Record<string, string[]>;
}
