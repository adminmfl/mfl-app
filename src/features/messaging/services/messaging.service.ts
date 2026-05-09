import { api } from '../../../core/api';
import type {
  AiMotivateResponseDTO,
  CannedMessagesResponseDTO,
  ChatFilterDTO,
  ChatMessagesResponseDTO,
  LeagueMembersResponseDTO,
  MarkChatReadResponseDTO,
  MySubmissionsResponseDTO,
  SendChatMessagePayloadDTO,
  SendChatMessageResponseDTO,
  TeamChatPhotoUploadResponseDTO,
  TeamsResponseDTO,
  UnreadCountResponseDTO,
} from '../types/messaging.dto';
import type { PickedChatPhoto } from '../types/messaging.model';
import { getMessagingApiErrorMessage } from '../utils/messaging-api-error';

export interface FetchMessagesParams {
  teamId?: string | null;
  filter?: ChatFilterDTO;
  adminView?: boolean;
  limit?: number;
}

export async function fetchChatMessages(
  leagueId: string,
  params: FetchMessagesParams,
): Promise<ChatMessagesResponseDTO> {
  try {
    const res = await api.get<ChatMessagesResponseDTO>(
      `/api/leagues/${leagueId}/messages`,
      {
        params: {
          limit: params.limit ?? 50,
          ...(params.teamId ? { team_id: params.teamId } : {}),
          ...(params.filter && params.filter !== 'all' ? { filter: params.filter } : {}),
          ...(params.adminView ? { admin_view: 'true' } : {}),
        },
      },
    );
    return res.data;
  } catch (error) {
    throw new Error(getMessagingApiErrorMessage(error, 'Failed to load messages'));
  }
}

export async function sendChatMessage(
  leagueId: string,
  payload: SendChatMessagePayloadDTO,
): Promise<SendChatMessageResponseDTO> {
  try {
    const res = await api.post<SendChatMessageResponseDTO>(
      `/api/leagues/${leagueId}/messages`,
      payload,
    );
    return res.data;
  } catch (error) {
    throw new Error(getMessagingApiErrorMessage(error, 'Failed to send message'));
  }
}

export async function markChatMessagesRead(
  leagueId: string,
  messageIds: string[],
): Promise<MarkChatReadResponseDTO> {
  try {
    const res = await api.post<MarkChatReadResponseDTO>(
      `/api/leagues/${leagueId}/messages/read`,
      { message_ids: messageIds },
    );
    return res.data;
  } catch (error) {
    throw new Error(getMessagingApiErrorMessage(error, 'Failed to mark messages read'));
  }
}

export async function fetchUnreadCount(
  leagueId: string,
): Promise<UnreadCountResponseDTO> {
  try {
    const res = await api.get<UnreadCountResponseDTO>(
      `/api/leagues/${leagueId}/messages/unread-count`,
    );
    return res.data;
  } catch (error) {
    throw new Error(getMessagingApiErrorMessage(error, 'Failed to load unread count'));
  }
}

export async function toggleChatReaction(
  leagueId: string,
  messageId: string,
  emoji: string,
): Promise<{ success: boolean }> {
  try {
    const res = await api.post<{ success: boolean }>(
      `/api/leagues/${leagueId}/messages/reactions`,
      {
        message_id: messageId,
        emoji,
      },
    );
    return res.data;
  } catch (error) {
    throw new Error(getMessagingApiErrorMessage(error, 'Failed to update reaction'));
  }
}

export async function fetchChatTeams(leagueId: string): Promise<TeamsResponseDTO> {
  try {
    const res = await api.get<TeamsResponseDTO>(`/api/leagues/${leagueId}/teams`);
    return res.data;
  } catch (error) {
    throw new Error(getMessagingApiErrorMessage(error, 'Failed to load teams'));
  }
}

export async function fetchChatMembers(
  leagueId: string,
): Promise<LeagueMembersResponseDTO> {
  try {
    const res = await api.get<LeagueMembersResponseDTO>(
      `/api/leagues/${leagueId}/members`,
    );
    return res.data;
  } catch (error) {
    throw new Error(getMessagingApiErrorMessage(error, 'Failed to load members'));
  }
}

export async function fetchCannedMessages(
  leagueId: string,
): Promise<CannedMessagesResponseDTO> {
  try {
    const res = await api.get<CannedMessagesResponseDTO>(
      `/api/leagues/${leagueId}/canned-messages`,
    );
    return res.data;
  } catch (error) {
    throw new Error(
      getMessagingApiErrorMessage(error, 'Failed to load quick messages'),
    );
  }
}

export async function fetchRecentWorkouts(
  leagueId: string,
): Promise<MySubmissionsResponseDTO> {
  try {
    const res = await api.get<MySubmissionsResponseDTO>(
      `/api/leagues/${leagueId}/my-submissions`,
    );
    return res.data;
  } catch (error) {
    throw new Error(
      getMessagingApiErrorMessage(error, 'Failed to load recent workouts'),
    );
  }
}

export async function uploadTeamChatPhoto(
  leagueId: string,
  teamId: string,
  photo: PickedChatPhoto,
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: photo.uri,
      name: photo.name,
      type: photo.type,
    } as any);
    formData.append('leagueId', leagueId);
    formData.append('teamId', teamId);

    const res = await api.post<TeamChatPhotoUploadResponseDTO>(
      '/api/upload/team-chat-photo',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return res.data.data.url;
  } catch (error) {
    throw new Error(getMessagingApiErrorMessage(error, 'Failed to upload photo'));
  }
}

export async function generateTeamMotivation(
  leagueId: string,
  teamId: string,
): Promise<AiMotivateResponseDTO> {
  try {
    const res = await api.post<AiMotivateResponseDTO>(
      `/api/leagues/${leagueId}/ai-motivate`,
      { teamId },
    );
    return res.data;
  } catch (error) {
    throw new Error(
      getMessagingApiErrorMessage(error, 'Failed to generate message'),
    );
  }
}
