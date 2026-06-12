import { View } from 'react-native';

import { ActionButton } from './action-button';
import type { ManagedTeam } from '../types/team-management';

interface TeamChipsProps {
  teams: ManagedTeam[];
  selectedTeamId: string;
  onSelect: (teamId: string) => void;
}

export function TeamChips({
  teams,
  selectedTeamId,
  onSelect,
}: TeamChipsProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {teams.map((team) => (
        <ActionButton
          key={team.team_id}
          label={team.team_name}
          icon={selectedTeamId === team.team_id ? 'check' : 'circle'}
          variant={selectedTeamId === team.team_id ? 'primary' : 'secondary'}
          onPress={() => onSelect(team.team_id)}
        />
      ))}
    </View>
  );
}
