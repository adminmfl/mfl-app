import type {
  CannedMessageDTO,
  ChatMessageDTO,
  LeagueMemberDTO,
  RecentWorkoutDTO,
  TeamDTO,
} from '../types/messaging.dto';
import type {
  CannedMessage,
  ChatMember,
  ChatMessage,
  ChatTeam,
  RecentWorkout,
} from '../types/messaging.model';

export function toChatMessage(dto: ChatMessageDTO): ChatMessage {
  return {
    messageId: dto.message_id,
    leagueId: dto.league_id,
    teamId: dto.team_id,
    senderId: dto.sender_id,
    senderName: dto.sender_name ?? null,
    senderUsername: dto.sender_username || 'Unknown',
    senderRole: dto.sender_role ?? null,
    content: dto.content,
    messageType: dto.message_type,
    visibility: dto.visibility,
    isImportant: dto.is_important,
    parentMessageId: dto.parent_message_id,
    parentMessage: dto.parent_message
      ? {
          content: dto.parent_message.content,
          senderUsername: dto.parent_message.sender_username,
        }
      : null,
    deepLink: dto.deep_link,
    photoUrl: dto.photo_url ?? null,
    createdAt: dto.created_at,
    editedAt: dto.edited_at,
    isRead: dto.is_read ?? false,
    reactions: (dto.reactions ?? []).map((reaction) => ({
      emoji: reaction.emoji,
      userIds: reaction.user_ids,
    })),
  };
}

export function toChatTeam(dto: TeamDTO): ChatTeam {
  return {
    teamId: dto.team_id,
    teamName: dto.team_name,
    leagueId: dto.league_id ?? null,
    logoUrl: dto.logo_url ?? null,
    memberCount: dto.member_count ?? 0,
  };
}

export function toChatMember(dto: LeagueMemberDTO): ChatMember {
  return {
    leagueMemberId: dto.league_member_id,
    userId: dto.user_id,
    leagueId: dto.league_id,
    teamId: dto.team_id,
    username: dto.username || 'unknown',
    roles: dto.roles || [],
  };
}

export function toCannedMessage(dto: CannedMessageDTO): CannedMessage {
  return {
    id: dto.canned_message_id ?? dto.id ?? `${dto.title}-${dto.content}`,
    title: dto.title,
    content: dto.content,
    category: dto.role_target ?? dto.category ?? 'General',
  };
}

export function toRecentWorkout(dto: RecentWorkoutDTO): RecentWorkout {
  return {
    id: dto.id,
    date: dto.date,
    type: dto.type,
    workoutType: dto.workout_type,
    customActivityName: dto.custom_activity_name ?? null,
    status: dto.status,
    duration: dto.duration,
    distance: dto.distance,
    steps: dto.steps ?? null,
    holes: dto.holes ?? null,
    rrValue: dto.rr_value,
  };
}
