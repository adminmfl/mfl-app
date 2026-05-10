// Domain models — camelCase

export interface DigestItem {
  id: string;
  category: string;
  title: string;
  body: string;
  priority: number;
  status: string;
  actionType?: string;
  actionPayload?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Draft {
  id: string;
  type: string;
  targetScope: string;
  targetId?: string;
  content: string;
  status:
    | 'pending'
    | 'edited'
    | 'scheduled'
    | 'sent'
    | 'cancelled'
    | 'dismissed';
  createdAt: string;
  sentAt?: string;
  scheduledSendAt?: string;
}

export interface Intervention {
  id: string;
  memberUserId: string;
  teamId?: string;
  triggerType: string;
  severity: string;
  title: string;
  description: string;
  suggestedAction: string;
  playerContext?: Record<string, any>;
  status: string;
  createdAt: string;
}

export interface CannedMessage {
  id: string;
  title: string;
  content: string;
  roleTarget: string;
  isSystem: boolean;
  category?: string | null;
}

export interface ChallengeTemplate {
  id: string;
  title: string;
  description: string | null;
  challengeType: string;
  durationDays: number;
  totalPoints: number | null;
  commTemplates?: unknown[] | null;
  rules?: Array<{ ruleText: string; isMandatory: boolean }> | null;
  scoringLogic?: Record<string, any> | null;
}

export interface AiManagerChallenge {
  id: string;
  name: string;
  challengeType: string;
  status: string;
  endDate?: string | null;
}
