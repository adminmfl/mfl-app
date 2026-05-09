import { api } from '../../../core/api';
import type { MessagesResponseDTO, UnreadCountResponseDTO } from '../types/message.dto';

export async function fetchMessages(leagueId: string): Promise<MessagesResponseDTO> {
  const res = await api.get<MessagesResponseDTO>(`/api/leagues/${leagueId}/messages`);
  return res.data;
}

export async function sendMessage(
  leagueId: string,
  content: string,
): Promise<{ success: boolean }> {
  const res = await api.post(`/api/leagues/${leagueId}/messages`, { content });
  return res.data;
}

export async function markRead(
  leagueId: string,
  messageIds: string[],
): Promise<{ success: boolean }> {
  const res = await api.post(`/api/leagues/${leagueId}/messages/read`, {
    message_ids: messageIds,
  });
  return res.data;
}

export async function fetchUnreadCount(leagueId: string): Promise<UnreadCountResponseDTO> {
  const res = await api.get<UnreadCountResponseDTO>(
    `/api/leagues/${leagueId}/messages/unread-count`,
  );
  return res.data;
}

export async function addReaction(
  leagueId: string,
  messageId: string,
  emoji: string,
): Promise<{ success: boolean }> {
  const res = await api.post(`/api/leagues/${leagueId}/messages/reactions`, {
    message_id: messageId,
    emoji,
  });
  return res.data;
}
