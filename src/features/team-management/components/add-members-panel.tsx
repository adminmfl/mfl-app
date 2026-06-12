import { Button, Spinner } from 'heroui-native';

import { searchMembers, getPerTeamCapacity } from '../utils/team-management-utils';
import { TeamManagementPanel } from './team-management-panel';
import { SearchInput } from './search-input';
import { SelectableMembers } from './selectable-members';
import type { ManagedTeam, ManagedLeagueMember } from '../types/team-management';

interface AddMembersPanelProps {
  team: ManagedTeam;
  unallocatedMembers: ManagedLeagueMember[];
  leagueCapacity: number;
  maxTeams: number;
  selectedMemberIds: string[];
  search: string;
  isBusy: boolean;
  onClose: () => void;
  onSearch: (value: string) => void;
  onToggleMember: (memberId: string) => void;
  onAddSelected: () => void;
}

export function AddMembersPanel({
  team,
  unallocatedMembers,
  leagueCapacity,
  maxTeams,
  selectedMemberIds,
  search,
  isBusy,
  onClose,
  onSearch,
  onToggleMember,
  onAddSelected,
}: AddMembersPanelProps) {
  const capacity = getPerTeamCapacity({ leagueCapacity, maxTeams });
  const remaining = Math.max(0, capacity - team.member_count);
  const filtered = searchMembers(unallocatedMembers, search);

  return (
    <TeamManagementPanel
      title={`Add Members to ${team.team_name}`}
      subtitle={`${remaining} slot(s) remaining. ${unallocatedMembers.length} unallocated member(s).`}
      onClose={onClose}
    >
      <SearchInput value={search} onChange={onSearch} />
      <SelectableMembers
        members={filtered}
        selectedIds={selectedMemberIds}
        onToggle={onToggleMember}
      />
      <Button
        variant="primary"
        size="lg"
        onPress={onAddSelected}
        isDisabled={isBusy || selectedMemberIds.length === 0 || remaining <= 0}
      >
        {isBusy ? <Spinner size="sm" /> : <Button.Label>Add Members</Button.Label>}
      </Button>
    </TeamManagementPanel>
  );
}
