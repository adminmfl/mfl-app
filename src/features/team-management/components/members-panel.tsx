import { View } from 'react-native';
import { Card, Button, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { searchMembers } from '../utils/team-management-utils';
import { TeamManagementPanel } from './team-management-panel';
import { SearchInput } from './search-input';
import { TeamChips } from './team-chips';
import { ActionButton } from './action-button';
import { MemberListRow } from './member-list-row';
import type { ManagedTeam, ManagedTeamMember } from '../types/team-management';

interface MembersPanelProps {
  team: ManagedTeam;
  teams: ManagedTeam[];
  members: ManagedTeamMember[];
  isHost: boolean;
  isLoading: boolean;
  search: string;
  memberToMove: ManagedTeamMember | null;
  targetTeamId: string;
  isBusy: boolean;
  onClose: () => void;
  onSearch: (value: string) => void;
  onMoveMember: (member: ManagedTeamMember | null) => void;
  onTargetTeam: (teamId: string) => void;
  onConfirmMove: () => void;
  onUnassign: (member: ManagedTeamMember) => void;
  onRemoveFromLeague: (member: ManagedTeamMember) => void;
}

export function MembersPanel({
  team,
  teams,
  members,
  isHost,
  isLoading,
  search,
  memberToMove,
  targetTeamId,
  isBusy,
  onClose,
  onSearch,
  onMoveMember,
  onTargetTeam,
  onConfirmMove,
  onUnassign,
  onRemoveFromLeague,
}: MembersPanelProps) {
  const filtered = searchMembers(members, search);

  return (
    <TeamManagementPanel
      title={`${team.team_name} - Members`}
      subtitle={`${members.length} member(s) in this team${
        team.captain ? ` | Captain: ${team.captain.username}` : ''
      }`}
      onClose={onClose}
    >
      <SearchInput value={search} onChange={onSearch} />
      {isLoading ? (
        <View className="items-center py-6 gap-2">
          <Spinner size="sm" />
          <AppText className="text-sm text-muted">Loading members...</AppText>
        </View>
      ) : filtered.length === 0 ? (
        <Card className="p-4">
          <AppText className="text-sm text-muted text-center">No members found.</AppText>
        </Card>
      ) : (
        <View className="gap-2">
          {filtered.map((member) => (
            <View key={member.league_member_id} className="gap-2">
              <MemberListRow
                name={member.username}
                email={member.email}
                roles={member.roles}
                captain={member.is_captain}
                points={member.points}
              />
              {isHost ? (
                <View className="flex-row flex-wrap gap-2">
                  <ActionButton
                    label="Move"
                    icon="arrow-right"
                    onPress={() => onMoveMember(member)}
                  />
                  <ActionButton
                    label="Unassign"
                    icon="log-out"
                    onPress={() => onUnassign(member)}
                  />
                  <ActionButton
                    label="Remove from League"
                    icon="trash-2"
                    variant="danger"
                    onPress={() => onRemoveFromLeague(member)}
                  />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      )}
      {memberToMove ? (
        <Card className="p-3 gap-3">
          <AppText className="text-sm font-semibold text-foreground">
            Move {memberToMove.username}
          </AppText>
          <TeamChips
            teams={teams.filter((otherTeam) => otherTeam.team_id !== team.team_id)}
            selectedTeamId={targetTeamId}
            onSelect={onTargetTeam}
          />
          <Button
            variant="primary"
            size="md"
            onPress={onConfirmMove}
            isDisabled={isBusy || !targetTeamId}
          >
            {isBusy ? <Spinner size="sm" /> : <Button.Label>Move Member</Button.Label>}
          </Button>
        </Card>
      ) : null}
    </TeamManagementPanel>
  );
}
