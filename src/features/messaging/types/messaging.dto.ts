export type ChatMessageTypeDTO = 'chat' | 'announcement' | 'system';
export type ChatVisibilityDTO = 'all' | 'captains_only';
export type ChatFilterDTO =
  | 'all'
  | 'announcements'
  | 'important'
  | 'host_messages'
  | 'captains_only';

export interface ChatReactionDTO {
  emoji: string;
  user_ids: string[];
}

export interface ParentMessagePreviewDTO {
  content: string;
  sender_username: string;
}

export interface ChatMessageDTO {
  message_id: string;
  league_id: string;
  team_id: string | null;
  sender_id: string;
  sender_name?: string | null;
  sender_username?: string | null;
  sender_role?: string | null;
  content: string;
  message_type: ChatMessageTypeDTO;
  visibility: ChatVisibilityDTO;
  is_important: boolean;
  parent_message_id: string | null;
  parent_message: ParentMessagePreviewDTO | null;
  deep_link: string | null;
  photo_url?: string | null;
  created_at: string;
  edited_at: string | null;
  deleted_at?: string | null;
  is_read?: boolean;
  reactions?: ChatReactionDTO[];
}

export interface ChatMessagesResponseDTO {
  success: boolean;
  data: {
    messages: ChatMessageDTO[];
    hasMore: boolean;
  };
}

export interface SendChatMessagePayloadDTO {
  content: string;
  team_id?: string | null;
  message_type: ChatMessageTypeDTO;
  visibility: ChatVisibilityDTO;
  is_important: boolean;
  parent_message_id?: string | null;
  deep_link?: string | null;
  photo_url?: string | null;
}

export interface SendChatMessageResponseDTO {
  success: boolean;
  data: ChatMessageDTO;
}

export interface MarkChatReadResponseDTO {
  success: boolean;
  data: {
    marked: number;
  };
}

export interface UnreadCountResponseDTO {
  success: boolean;
  data: {
    count: number;
    unread?: number;
    total?: number;
  };
}

export interface TeamChatPhotoUploadResponseDTO {
  success: boolean;
  data: {
    url: string;
    path: string;
  };
}

export interface TeamDTO {
  team_id: string;
  team_name: string;
  league_id?: string;
  logo_url?: string | null;
  member_count?: number;
}

export interface TeamsResponseDTO {
  success: boolean;
  data: {
    teams: TeamDTO[];
  };
}

export interface LeagueMemberDTO {
  league_member_id: string;
  user_id: string;
  league_id: string;
  team_id: string | null;
  username: string | null;
  roles: string[];
}

export interface LeagueMembersResponseDTO {
  success: boolean;
  data: LeagueMemberDTO[];
}

export interface CannedMessageDTO {
  canned_message_id?: string;
  id?: string;
  title: string;
  content: string;
  role_target?: string;
  category?: string;
}

export interface CannedMessagesResponseDTO {
  success: boolean;
  data: CannedMessageDTO[];
}

export interface RecentWorkoutDTO {
  id: string;
  date: string;
  type: 'workout' | 'rest';
  workout_type: string | null;
  custom_activity_name?: string | null;
  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'rejected_resubmit'
    | 'rejected_permanent';
  duration: number | null;
  distance: number | null;
  steps?: number | null;
  holes?: number | null;
  rr_value: number | null;
}

export interface MySubmissionsResponseDTO {
  success: boolean;
  data: {
    submissions: RecentWorkoutDTO[];
  };
}

export interface AiMotivateResponseDTO {
  success: boolean;
  message?: string;
  error?: string;
  source?: string;
}
