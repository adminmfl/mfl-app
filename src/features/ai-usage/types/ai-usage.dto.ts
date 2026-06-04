/** Matches GET /api/leagues/{id}/ai-usage response */

export interface AiUsageSummaryDTO {
  totalCalls: number;
  totalTokens: number;
  totalCost: number;
  periodDays: number;
}

export interface AiUsageQuotasDTO {
  dailyQuestionLimit: number;
  monthlyTokenLimit: number | null;
}

export interface AiUsageBreakdownDTO {
  calls: number;
  tokens: number;
  cost: number;
}

export interface AiUsagePlayerStatDTO {
  user_id: string;
  username: string;
  calls: number;
  tokens: number;
  cost: number;
  keyType: string;
}

export interface AiUsageDailyTrendDTO {
  date: string;
  tokens: number;
  cost: number;
  calls: number;
  platform: number;
  league: number;
  byok: number;
}

export interface AiUsageDataDTO {
  summary: AiUsageSummaryDTO;
  quotas: AiUsageQuotasDTO;
  byFeature: Record<string, AiUsageBreakdownDTO>;
  byKeyType: Record<string, AiUsageBreakdownDTO>;
  playerStats: AiUsagePlayerStatDTO[];
  dailyTrend: AiUsageDailyTrendDTO[];
}

export interface AiUsageResponseDTO {
  success: boolean;
  data: AiUsageDataDTO;
}
