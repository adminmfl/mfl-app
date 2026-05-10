import type {
  AiManagerChallengeDTO,
  CannedMessageDTO,
  ChallengeTemplateDTO,
  DigestItemDTO,
  DraftDTO,
  InterventionDTO,
} from '../types/ai-manager.dto';
import type {
  AiManagerChallenge,
  CannedMessage,
  ChallengeTemplate,
  DigestItem,
  Draft,
  Intervention,
} from '../types/ai-manager.model';

export function toDigestItem(dto: DigestItemDTO): DigestItem {
  return {
    id: dto.id,
    category: dto.category,
    title: dto.title,
    body: dto.body,
    priority: dto.priority,
    status: dto.status,
    actionType: dto.action_type,
    actionPayload: dto.action_payload,
    metadata: dto.metadata,
    createdAt: dto.created_at,
  };
}

export function toDraft(dto: DraftDTO): Draft {
  return {
    id: dto.id,
    type: dto.type,
    targetScope: dto.target_scope,
    targetId: dto.target_id,
    content: dto.content,
    status: dto.status,
    createdAt: dto.created_at,
    sentAt: dto.sent_at,
    scheduledSendAt: dto.scheduled_send_at,
  };
}

export function toIntervention(dto: InterventionDTO): Intervention {
  return {
    id: dto.id,
    memberUserId: dto.member_user_id,
    teamId: dto.team_id,
    triggerType: dto.trigger_type,
    severity: dto.severity,
    title: dto.title,
    description: dto.description,
    suggestedAction: dto.suggested_action,
    playerContext: dto.player_context,
    status: dto.status,
    createdAt: dto.created_at,
  };
}

export function toCannedMessage(dto: CannedMessageDTO): CannedMessage {
  return {
    id: dto.canned_message_id,
    title: dto.title,
    content: dto.content,
    roleTarget: dto.role_target,
    isSystem: dto.is_system,
    category: dto.category,
  };
}

export function toChallengeTemplate(dto: ChallengeTemplateDTO): ChallengeTemplate {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    challengeType: dto.challenge_type,
    durationDays: dto.duration_days,
    totalPoints: dto.total_points,
    commTemplates: dto.comm_templates,
    rules: dto.rules?.map((rule) => ({
      ruleText: rule.rule_text,
      isMandatory: rule.is_mandatory,
    })),
    scoringLogic: dto.scoring_logic,
  };
}

export function toAiManagerChallenge(dto: AiManagerChallengeDTO): AiManagerChallenge {
  return {
    id: dto.id,
    name: dto.name,
    challengeType: dto.challenge_type,
    status: dto.status,
    endDate: dto.end_date,
  };
}
