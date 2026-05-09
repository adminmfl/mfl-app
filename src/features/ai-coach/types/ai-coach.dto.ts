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
