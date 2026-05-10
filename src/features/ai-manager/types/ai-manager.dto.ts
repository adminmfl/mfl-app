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
