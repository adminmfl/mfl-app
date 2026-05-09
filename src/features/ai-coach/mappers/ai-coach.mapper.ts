import type { AiCoachMessageDTO } from '../types/ai-coach.dto';
import type { AiCoachMessage } from '../types/ai-coach.model';

export function toAiCoachMessage(dto: AiCoachMessageDTO): AiCoachMessage {
  return {
    messageId: dto.id,
    role: dto.role,
    content: dto.content,
    createdAt: dto.created_at,
  };
}
