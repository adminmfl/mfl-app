import { ScrollView, TouchableOpacity } from 'react-native';
import { Chip } from 'heroui-native';

import type { PartnerTeam } from '../types/partner-activity.model';

interface TeamFilterProps {
  teams: PartnerTeam[];
  selectedTeamId: string;
  onSelect: (teamId: string) => void;
}

export function TeamFilter({ teams, selectedTeamId, onSelect }: TeamFilterProps) {
  if (teams.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 pb-2"
    >
      <TouchableOpacity onPress={() => onSelect('all')}>
        <Chip
          size="sm"
          variant={selectedTeamId === 'all' ? 'primary' : 'tertiary'}
          color={selectedTeamId === 'all' ? 'accent' : 'default'}
        >
          <Chip.Label>All Teams</Chip.Label>
        </Chip>
      </TouchableOpacity>
      {teams.map((t) => (
        <TouchableOpacity key={t.teamId} onPress={() => onSelect(t.teamId)}>
          <Chip
            size="sm"
            variant={selectedTeamId === t.teamId ? 'primary' : 'tertiary'}
            color={selectedTeamId === t.teamId ? 'accent' : 'default'}
          >
            <Chip.Label>{t.teamName}</Chip.Label>
          </Chip>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
