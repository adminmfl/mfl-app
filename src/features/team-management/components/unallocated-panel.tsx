import { Button, Spinner } from 'heroui-native';

import { searchMembers } from '../utils/team-management-utils';
import { TeamManagementPanel } from './team-management-panel';
import { TeamChips } from './team-chips';
import { SearchInput } from './search-input';
import { SelectableMembers } from './selectable-members';
import type { TeamManagementData } from '../types/team-management';

interface UnallocatedPanelProps {
  data: TeamManagementData;
  targetTeamId: string;
  selectedMemberIds: string[];
  search: string;
  isBusy: boolean;
  onClose: () => void;
  onSearch: (value: string) => void;
  onTargetTeam: (teamId: string) => void;
  onToggleMember: (memberId: string) => void;
  onAddSelected: () => void;
}

export function UnallocatedPanel({
  data,
  targetTeamId,
  selectedMemberIds,
  search,
  isBusy,
  onClose,
  onSearch,
  onTargetTeam,
  onToggleMember,
  onAddSelected,
}: UnallocatedPanelProps) {
  const filtered = searchMembers(data.members.unallocated, search);
  return (
    <TeamManagementPanel
      title="Unallocated Members"
      subtitle={`${data.members.unallocated.length} member(s) are not assigned to a team.`}
      onClose={onClose}
    >
      <TeamChips
        teams={data.teams}
        selectedTeamId={targetTeamId}
        onSelect={onTargetTeam}
      />
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
        isDisabled={isBusy || !targetTeamId || selectedMemberIds.length === 0}
      >
        {isBusy ? <Spinner size="sm" /> : <Button.Label>Add Members</Button.Label>}
      </Button>
    </TeamManagementPanel>
  );
}
