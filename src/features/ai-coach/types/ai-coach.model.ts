export interface AiCoachMessage {
  messageId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface SuggestedQuestion {
  text: string;
  category: string;
}

export interface Milestone {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
}

export interface RecoveryInfo {
  needsRecovery: boolean;
  daysSinceLastActivity: number;
  suggestion?: string;
}

export interface WeeklyInsight {
  id: string;
  content: string;
  createdAt: string;
}
