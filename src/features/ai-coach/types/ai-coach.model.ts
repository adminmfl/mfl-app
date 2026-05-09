export interface AiCoachMessage {
  messageId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}
