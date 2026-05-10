import { api } from '../../../core/api';
import type {
  AiCoachChatHistoryResponseDTO,
  AiCoachResponseDTO,
  AiMotivateResponseDTO,
  SuggestedQuestionsResponseDTO,
  MilestonesResponseDTO,
  RecoveryResponseDTO,
  WeeklyInsightGetResponseDTO,
  WeeklyInsightPostResponseDTO,
  PatchCoachMessagesDTO,
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

export async function fetchSuggestedQuestions(
  leagueId: string,
): Promise<SuggestedQuestionsResponseDTO> {
  const res = await api.get<SuggestedQuestionsResponseDTO>(
    `/api/leagues/${leagueId}/ai-coach/suggested-questions`,
  );
  return res.data;
}

export async function fetchMilestones(
  leagueId: string,
): Promise<MilestonesResponseDTO> {
  const res = await api.get<MilestonesResponseDTO>(
    `/api/leagues/${leagueId}/ai-coach/milestones`,
  );
  return res.data;
}

export async function fetchRecovery(
  leagueId: string,
): Promise<RecoveryResponseDTO> {
  const res = await api.get<RecoveryResponseDTO>(
    `/api/leagues/${leagueId}/ai-coach/recovery`,
  );
  return res.data;
}

export async function fetchWeeklyInsights(
  leagueId: string,
): Promise<WeeklyInsightGetResponseDTO> {
  const res = await api.get<WeeklyInsightGetResponseDTO>(
    `/api/leagues/${leagueId}/ai-coach/weekly-insight`,
  );
  return res.data;
}

export async function generateWeeklyInsight(
  leagueId: string,
): Promise<WeeklyInsightPostResponseDTO> {
  const res = await api.post<WeeklyInsightPostResponseDTO>(
    `/api/leagues/${leagueId}/ai-coach/weekly-insight`,
  );
  return res.data;
}

export async function patchCoachMessages(
  leagueId: string,
  payload: PatchCoachMessagesDTO,
): Promise<{ success: boolean }> {
  const res = await api.patch<{ success: boolean }>(
    `/api/leagues/${leagueId}/ai-coach`,
    payload,
  );
  return res.data;
}
