import { View } from 'react-native';
import { Button, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { searchMembers } from '../utils/team-management-utils';
import { TeamManagementPanel } from './team-management-panel';
import { SearchInput } from './search-input';
import { MemberListRow } from './member-list-row';
import type { ManagedLeagueMember } from '../types/team-management';

interface GovernorsPanelProps {
  members: ManagedLeagueMember[];
  hostUserId: string;
  currentGovernorIds: string[];
  selectedGovernorIds: string[];
  search: string;
  isBusy: boolean;
  onClose: () => void;
  onSearch: (value: string) => void;
  onToggle: (userId: string) => void;
  onSave: () => void;
}

export function GovernorsPanel({
  members,
  hostUserId,
  currentGovernorIds,
  selectedGovernorIds,
  search,
  isBusy,
  onClose,
  onSearch,
  onToggle,
  onSave,
}: GovernorsPanelProps) {
  const eligible = searchMembers(
    members.filter((member) => member.user_id !== hostUserId),
    search,
  );

  return (
    <TeamManagementPanel
      title="Manage Governors"
      subtitle="Governors have oversight of all teams and can validate any submission."
      onClose={onClose}
    >
      <SearchInput value={search} onChange={onSearch} placeholder="Search league members..." />
      <View className="gap-2">
        {eligible.map((member) => (
          <MemberListRow
            key={member.user_id}
            name={member.username}
            email={member.email}
            roles={member.roles}
            points={member.points}
            selected={selectedGovernorIds.includes(member.user_id)}
            onPress={() => onToggle(member.user_id)}
          />
        ))}
      </View>
      <AppText className="text-xs text-muted">
        Current governors selected: {currentGovernorIds.length}
      </AppText>
      <Button variant="primary" size="lg" onPress={onSave} isDisabled={isBusy}>
        {isBusy ? <Spinner size="sm" /> : <Button.Label>Save Changes</Button.Label>}
      </Button>
    </TeamManagementPanel>
  );
}
