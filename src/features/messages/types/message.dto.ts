export interface MessageDTO {
  message_id: string;
  league_id: string;
  sender_id: string;
  sender_username: string;
  sender_name: string | null;
  sender_role: string | null;
  team_id: string | null;
  content: string;
  message_type: string;
  visibility: string;
  is_important: boolean;
  parent_message_id: string | null;
  parent_message: { message_id: string; content: string; sender_username: string } | null;
  deep_link: string | null;
  photo_url: string | null;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  is_read: boolean;
  reactions: Array<{ emoji: string; user_ids: string[] }>;
}

// Backend returns: { success, data: { messages, hasMore } }
export interface MessagesResponseDTO {
  success: boolean;
  data: {
    messages: MessageDTO[];
    hasMore: boolean;
  };
}

export interface UnreadCountResponseDTO {
  success: boolean;
  data: { count: number };
}
