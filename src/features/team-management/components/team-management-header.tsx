import { View } from 'react-native';
import { Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { ManagedGovernor, TeamManagementData } from '../types/team-management';
import { ActionButton } from './action-button';

interface TeamManagementHeaderProps {
  data: TeamManagementData;
  canManageTeams: boolean;
  isHost: boolean;
  onCreateTeam: () => void;
  onUnallocated: () => void;
  onGovernors: () => void;
  onLeagueInvite: () => void;
}

export function TeamManagementHeader({
  data,
  canManageTeams,
  isHost,
  onCreateTeam,
  onUnallocated,
  onGovernors,
  onLeagueInvite,
}: TeamManagementHeaderProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-end justify-between gap-3">
        <View className="flex-1">
          <AppText className="text-2xl font-bold text-foreground">
            Team Management
          </AppText>
          <AppText className="text-sm text-muted mt-1">
            {data.meta.current_team_count} of {data.meta.max_teams} teams created
          </AppText>
        </View>
      </View>

      {canManageTeams ? (
        <View className="flex-row flex-wrap gap-2">
          <ActionButton
            label={`Unallocated (${data.members.unallocated.length})`}
            icon="users"
            onPress={onUnallocated}
          />
          {isHost ? (
            <ActionButton label="Governors" icon="shield" onPress={onGovernors} />
          ) : null}
          {isHost ? (
            <ActionButton label="League Invite" icon="share-2" onPress={onLeagueInvite} />
          ) : null}
          <ActionButton
            label="Create Team"
            icon="plus"
            onPress={onCreateTeam}
            variant="primary"
            disabled={!data.meta.can_create_more}
          />
        </View>
      ) : null}

      {data.governors.length > 0 ? (
        <GovernorInfo governors={data.governors} />
      ) : null}
    </View>
  );
}

function GovernorInfo({ governors }: { governors: ManagedGovernor[] }) {
  return (
    <Card className="p-3" style={{ backgroundColor: mflColors.blueLight }}>
      <AppText className="text-sm font-semibold" style={{ color: mflColors.blue }}>
        {governors.length === 1 ? 'Governor' : 'Governors'}:{' '}
        {governors.map((governor) => governor.username).join(', ')}
      </AppText>
      <AppText className="text-xs mt-1" style={{ color: mflColors.blue }}>
        {governors.length === 1 ? 'Has' : 'Have'} oversight of all teams and can
        validate any submission.
      </AppText>
    </Card>
  );
}
