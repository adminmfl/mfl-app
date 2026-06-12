import { View } from 'react-native';
import { Button, Spinner } from 'heroui-native';

import { searchMembers } from '../utils/team-management-utils';
import { TeamManagementPanel } from './team-management-panel';
import { SearchInput } from './search-input';
import { MemberListRow } from './member-list-row';
import type { ManagedTeam, ManagedTeamMember } from '../types/team-management';

interface CaptainPanelProps {
  team: ManagedTeam;
  members: ManagedTeamMember[];
  isLoading: boolean;
  selectedMemberIds: string[];
  search: string;
  isBusy: boolean;
  onClose: () => void;
  onSearch: (value: string) => void;
  onSelect: (userId: string) => void;
  onAssign: () => void;
  onRemove: () => void;
}

export function CaptainPanel({
  team,
  members,
  isLoading,
  selectedMemberIds,
  search,
  isBusy,
  onClose,
  onSearch,
  onSelect,
  onAssign,
  onRemove,
}: CaptainPanelProps) {
  const filtered = searchMembers(members, search);
  const currentCaptain = members.find((member) => member.is_captain);

  return (
    <TeamManagementPanel
      title={`Assign Captain for ${team.team_name}`}
      subtitle="The captain can validate submissions from team members."
      onClose={onClose}
    >
      <SearchInput value={search} onChange={onSearch} placeholder="Search team members..." />
      {isLoading ? (
        <Spinner size="sm" />
      ) : (
        <View className="gap-2">
          {filtered.map((member) => (
            <MemberListRow
              key={member.user_id}
              name={member.username}
              email={member.email}
              roles={member.roles}
              captain={member.is_captain}
              selected={selectedMemberIds[0] === member.user_id}
              onPress={() => onSelect(member.user_id)}
            />
          ))}
        </View>
      )}
      <View className="flex-row gap-3">
        {currentCaptain ? (
          <Button
            variant="secondary"
            size="lg"
            onPress={onRemove}
            isDisabled={isBusy}
            className="flex-1"
          >
            <Button.Label>Remove Captain</Button.Label>
          </Button>
        ) : null}
        <Button
          variant="primary"
          size="lg"
          onPress={onAssign}
          isDisabled={isBusy || !selectedMemberIds[0]}
          className="flex-1"
        >
          {isBusy ? <Spinner size="sm" /> : <Button.Label>Assign Captain</Button.Label>}
        </Button>
      </View>
    </TeamManagementPanel>
  );
}
