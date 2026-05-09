import Feather from '@expo/vector-icons/Feather';
import { Image, View } from 'react-native';
import { Avatar, Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { ManagedLeagueMember, ManagedTeam } from '../types/team-management';
import { getInitials } from '../utils/team-management-utils';
import { ActionButton } from './action-button';

interface ManagedTeamCardProps {
  team: ManagedTeam;
  allocatedMembers: ManagedLeagueMember[];
  canManageTeams: boolean;
  canManageLogos: boolean;
  onViewMembers: (team: ManagedTeam) => void;
  onAddMembers: (team: ManagedTeam) => void;
  onEditName: (team: ManagedTeam) => void;
  onAssignCaptain: (team: ManagedTeam) => void;
  onViceCaptains: (team: ManagedTeam) => void;
  onInvite: (team: ManagedTeam) => void;
  onUploadLogo: (team: ManagedTeam) => void;
  onRemoveLogo: (team: ManagedTeam) => void;
  onDelete: (team: ManagedTeam) => void;
}

export function ManagedTeamCard({
  team,
  allocatedMembers,
  canManageTeams,
  canManageLogos,
  onViewMembers,
  onAddMembers,
  onEditName,
  onAssignCaptain,
  onViceCaptains,
  onInvite,
  onUploadLogo,
  onRemoveLogo,
  onDelete,
}: ManagedTeamCardProps) {
  const teamMembers = allocatedMembers.filter(
    (member) => member.team_id === team.team_id,
  );

  return (
    <Card className="p-4 gap-3">
      <View className="flex-row items-center gap-3">
        <Avatar size="md" alt={team.team_name}>
          {team.logo_url ? <Avatar.Image source={{ uri: team.logo_url }} /> : null}
          <Avatar.Fallback>{getInitials(team.team_name)}</Avatar.Fallback>
        </Avatar>
        <View className="flex-1">
          <AppText className="text-base font-semibold text-foreground" numberOfLines={1}>
            {team.team_name}
          </AppText>
          <AppText className="text-xs text-muted">
            {team.member_count} {team.member_count === 1 ? 'member' : 'members'}
            {team.captain ? ` | Captain: ${team.captain.username}` : ' | No captain'}
          </AppText>
        </View>
        {team.captain ? <Feather name="award" size={20} color={mflColors.amber} /> : null}
      </View>

      {team.logo_url ? (
        <Image
          source={{ uri: team.logo_url }}
          style={{ width: '100%', height: 110, borderRadius: 8 }}
          resizeMode="cover"
        />
      ) : null}

      {teamMembers.length > 0 ? (
        <View className="gap-1">
          {teamMembers.slice(0, 3).map((member) => (
            <AppText key={member.league_member_id} className="text-xs text-muted">
              {member.username}
            </AppText>
          ))}
          {teamMembers.length > 3 ? (
            <AppText className="text-xs text-muted">
              +{teamMembers.length - 3} more
            </AppText>
          ) : null}
        </View>
      ) : (
        <AppText className="text-xs text-muted">No members assigned.</AppText>
      )}

      {canManageTeams ? (
        <View className="flex-row flex-wrap gap-2">
          {canManageLogos ? (
            <>
              <ActionButton label="Upload Logo" icon="image" onPress={() => onUploadLogo(team)} />
              {team.logo_url ? (
                <ActionButton
                  label="Remove Logo"
                  icon="trash-2"
                  onPress={() => onRemoveLogo(team)}
                  variant="danger"
                />
              ) : null}
            </>
          ) : null}
          <ActionButton label="Edit Name" icon="edit-3" onPress={() => onEditName(team)} />
          <ActionButton label="View Members" icon="users" onPress={() => onViewMembers(team)} />
          <ActionButton label="Add Members" icon="user-plus" onPress={() => onAddMembers(team)} />
          <ActionButton label="Captain" icon="award" onPress={() => onAssignCaptain(team)} />
          <ActionButton label="Vice Captains" icon="shield" onPress={() => onViceCaptains(team)} />
          <ActionButton label="Invite" icon="share-2" onPress={() => onInvite(team)} />
          <ActionButton
            label="Delete"
            icon="trash-2"
            onPress={() => onDelete(team)}
            variant="danger"
          />
        </View>
      ) : null}
    </Card>
  );
}
