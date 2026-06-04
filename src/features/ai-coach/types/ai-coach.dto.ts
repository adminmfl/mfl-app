export interface AiCoachMessageDTO {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Backend returns: { success, messages: [...] }
export interface AiCoachChatHistoryResponseDTO {
  success: boolean;
  messages: AiCoachMessageDTO[];
}

// Backend POST /ai-coach returns: { success, answer, cached? }
export interface AiCoachResponseDTO {
  success: boolean;
  answer: string;
  cached?: boolean;
}

// Backend POST /ai-motivate returns: { success, message, source }
export interface AiMotivateResponseDTO {
  success: boolean;
  message: string;
  source: 'template' | 'ai';
}

// --- Suggested Questions ---

export interface SuggestedQuestionDTO {
  text: string;
  category: string;
}

export interface SuggestedQuestionsResponseDTO {
  success: boolean;
  questions: SuggestedQuestionDTO[];
}

// --- Milestones ---

export interface MilestoneDTO {
  id: string;
  message_type: string;
  content: string;
  metadata: Record<string, any>;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface MilestonesResponseDTO {
  success: boolean;
  milestones: MilestoneDTO[];
  newCount: number;
}

// --- Recovery ---

export interface RecoveryResponseDTO {
  success: boolean;
  needsRecovery: boolean;
  daysSinceLastActivity: number;
  suggestion?: string;
  cached?: boolean;
}

// --- Weekly Insight ---

export interface WeeklyInsightMessageDTO {
  id: string;
  content: string;
  created_at: string;
}

export interface WeeklyInsightGetResponseDTO {
  success: boolean;
  insights: WeeklyInsightMessageDTO[];
}

export interface WeeklyInsightPostResponseDTO {
  success: boolean;
  insight: string;
  cached?: boolean;
}

// --- Dismiss / Read (PATCH) ---

export interface PatchCoachMessagesDTO {
  messageIds: string[];
  action: 'read' | 'dismiss';
}
