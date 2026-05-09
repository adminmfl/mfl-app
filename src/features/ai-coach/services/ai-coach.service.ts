import { api } from '../../../core/api';
import type {
  AiCoachChatHistoryResponseDTO,
  AiCoachResponseDTO,
  AiMotivateResponseDTO,
} from '../types/ai-coach.dto';

export async function fetchChatHistory(
  leagueId: string,
): Promise<AiCoachChatHistoryResponseDTO> {
  const res = await api.get<AiCoachChatHistoryResponseDTO>(
    `/api/leagues/${leagueId}/ai-coach/chat-history`,
  );
  return res.data;
}

export async function sendCoachMessage(
  leagueId: string,
  message: string,
): Promise<AiCoachResponseDTO> {
  const res = await api.post<AiCoachResponseDTO>(
    `/api/leagues/${leagueId}/ai-coach`,
    { question: message },
  );
  return res.data;
}

export async function getMotivation(
  leagueId: string,
): Promise<AiMotivateResponseDTO> {
  const res = await api.post<AiMotivateResponseDTO>(
    `/api/leagues/${leagueId}/ai-motivate`,
  );
  return res.data;
}
