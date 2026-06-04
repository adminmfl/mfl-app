import type { MessageDTO } from '../types/message.dto';
import type { Message } from '../types/message.model';

export function toMessage(dto: MessageDTO): Message {
  // Convert reactions from array of { emoji, user_ids } to Record<string, string[]>
  const reactionsMap: Record<string, string[]> = {};
  if (dto.reactions && Array.isArray(dto.reactions)) {
    for (const r of dto.reactions) {
      reactionsMap[r.emoji] = r.user_ids;
    }
  }

  return {
    messageId: dto.message_id,
    leagueId: dto.league_id,
    senderId: dto.sender_id,
    senderUsername: dto.sender_username,
    senderName: dto.sender_name,
    senderRole: dto.sender_role,
    teamId: dto.team_id,
    content: dto.content,
    messageType: dto.message_type,
    visibility: dto.visibility,
    isImportant: dto.is_important,
    parentMessageId: dto.parent_message_id,
    photoUrl: dto.photo_url,
    createdAt: dto.created_at,
    isRead: dto.is_read,
    reactions: reactionsMap,
  };
}
