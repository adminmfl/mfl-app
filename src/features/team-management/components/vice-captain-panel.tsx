import { View } from 'react-native';
import { Card, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { searchMembers } from '../utils/team-management-utils';
import { TeamManagementPanel } from './team-management-panel';
import { SearchInput } from './search-input';
import { ActionButton } from './action-button';
import { MemberListRow } from './member-list-row';
import type { ManagedTeam, ManagedTeamMember } from '../types/team-management';

interface ViceCaptainPanelProps {
  team: ManagedTeam;
  members: ManagedTeamMember[];
  isLoading: boolean;
  search: string;
  isBusy: boolean;
  onClose: () => void;
  onSearch: (value: string) => void;
  onAssign: (userId: string) => void;
  onRemove: (userId: string) => void;
}

export function ViceCaptainPanel({
  team,
  members,
  isLoading,
  search,
  isBusy,
  onClose,
  onSearch,
  onAssign,
  onRemove,
}: ViceCaptainPanelProps) {
  const current = members.filter((member) => member.roles.includes('vice_captain'));
  const eligible = searchMembers(
    members.filter(
      (member) =>
        !member.roles.includes('captain') && !member.roles.includes('vice_captain'),
    ),
    search,
  );

  return (
    <TeamManagementPanel
      title={`Vice Captains - ${team.team_name}`}
      subtitle="Vice captains can validate submissions, manage team members, and act for the captain."
      onClose={onClose}
    >
      {current.length > 0 ? (
        <View className="gap-2">
          <SectionLabel label="Current Vice Captains" />
          {current.map((member) => (
            <MemberListRow
              key={member.user_id}
              name={member.username}
              email={member.email}
              roles={member.roles}
              right={
                <ActionButton
                  label="Remove"
                  icon="x"
                  variant="danger"
                  disabled={isBusy}
                  onPress={() => onRemove(member.user_id)}
                />
              }
            />
          ))}
        </View>
      ) : null}
      <SearchInput value={search} onChange={onSearch} placeholder="Search members to add..." />
      {isLoading ? (
        <Spinner size="sm" />
      ) : eligible.length === 0 ? (
        <Card className="p-4">
          <AppText className="text-sm text-muted text-center">No eligible members.</AppText>
        </Card>
      ) : (
        <View className="gap-2">
          {eligible.map((member) => (
            <MemberListRow
              key={member.user_id}
              name={member.username}
              email={member.email}
              roles={member.roles}
              right={
                <ActionButton
                  label="Add"
                  icon="plus"
                  disabled={isBusy}
                  onPress={() => onAssign(member.user_id)}
                />
              }
            />
          ))}
        </View>
      )}
    </TeamManagementPanel>
  );
}
