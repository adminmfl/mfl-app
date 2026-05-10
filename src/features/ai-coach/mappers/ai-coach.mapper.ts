import type {
  AiCoachMessageDTO,
  SuggestedQuestionDTO,
  MilestoneDTO,
  WeeklyInsightMessageDTO,
} from '../types/ai-coach.dto';
import type {
  AiCoachMessage,
  SuggestedQuestion,
  Milestone,
  WeeklyInsight,
} from '../types/ai-coach.model';

export function toAiCoachMessage(dto: AiCoachMessageDTO): AiCoachMessage {
  return {
    messageId: dto.id,
    role: dto.role,
    content: dto.content,
    createdAt: dto.created_at,
  };
}

export function toSuggestedQuestion(dto: SuggestedQuestionDTO): SuggestedQuestion {
  return { text: dto.text, category: dto.category };
}

export function toMilestone(dto: MilestoneDTO): Milestone {
  return {
    id: dto.id,
    title: dto.metadata?.title || 'Milestone',
    content: dto.content,
    type: dto.metadata?.milestone_type || dto.message_type,
    isRead: dto.is_read,
    isDismissed: dto.is_dismissed,
    createdAt: dto.created_at,
  };
}

export function toWeeklyInsight(dto: WeeklyInsightMessageDTO): WeeklyInsight {
  return {
    id: dto.id,
    content: dto.content,
    createdAt: dto.created_at,
  };
}
