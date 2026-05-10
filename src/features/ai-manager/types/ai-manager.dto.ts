// DTO types — match backend JSON shape (snake_case)

export interface DigestItemDTO {
  id: string;
  category: string;
  title: string;
  body: string;
  priority: number;
  status: string;
  action_type?: string;
  action_payload?: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface DraftDTO {
  id: string;
  type: string;
  target_scope: string;
  target_id?: string;
  content: string;
  status:
    | 'pending'
    | 'edited'
    | 'scheduled'
    | 'sent'
    | 'cancelled'
    | 'dismissed';
  created_at: string;
  sent_at?: string;
  scheduled_send_at?: string;
}

export interface InterventionDTO {
  id: string;
  member_user_id: string;
  team_id?: string;
  trigger_type: string;
  severity: string;
  title: string;
  description: string;
  suggested_action: string;
  player_context?: Record<string, any>;
  status: string;
  created_at: string;
}

export interface AiScanResponseDTO {
  digestCount: number;
  interventionCount: number;
}

export interface CannedMessageDTO {
  canned_message_id: string;
  title: string;
  content: string;
  role_target: string;
  is_system: boolean;
  category?: string | null;
}

export interface CannedMessagesResponseDTO {
  success?: boolean;
  data?: CannedMessageDTO[];
}

export interface ChallengeTemplateDTO {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  duration_days: number;
  total_points: number | null;
  comm_templates?: unknown[] | null;
  rules?: Array<{ rule_text: string; is_mandatory: boolean }> | null;
  scoring_logic?: Record<string, any> | null;
}

export interface AiManagerChallengeDTO {
  id: string;
  name: string;
  challenge_type: string;
  status: string;
  end_date?: string | null;
}

export interface ChallengeDeployResponseDTO {
  success?: boolean;
  challengeId?: string;
  commCount?: number;
  error?: string;
}
