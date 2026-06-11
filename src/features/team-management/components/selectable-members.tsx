import { View } from 'react-native';
import { Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { MemberListRow } from './member-list-row';
import type { ManagedLeagueMember } from '../types/team-management';

interface SelectableMembersProps {
  members: ManagedLeagueMember[];
  selectedIds: string[];
  onToggle: (memberId: string) => void;
}

export function SelectableMembers({
  members,
  selectedIds,
  onToggle,
}: SelectableMembersProps) {
  if (members.length === 0) {
    return (
      <Card className="p-4">
        <AppText className="text-sm text-muted text-center">No members found.</AppText>
      </Card>
    );
  }
  return (
    <View className="gap-2">
      {members.map((member) => (
        <MemberListRow
          key={member.league_member_id}
          name={member.username}
          email={member.email}
          roles={member.roles}
          points={member.points}
          selected={selectedIds.includes(member.league_member_id)}
          onPress={() => onToggle(member.league_member_id)}
        />
      ))}
    </View>
  );
}
