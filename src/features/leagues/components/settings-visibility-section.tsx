import { View } from 'react-native';
import { Card } from 'heroui-native';
import { SectionLabel } from '../../../components/section-label';
import { ToggleRow, Divider } from './settings-form-fields';

interface Props {
  isExclusive: boolean;
  playerTeamWorkoutVisibility: boolean;
  playerLeagueWorkoutVisibility: boolean;
  crossTeamVisibility: boolean;
  onTogglePublic: () => void;
  onToggleExclusive: () => void;
  onToggleTeamWorkout: () => void;
  onToggleLeagueWorkout: () => void;
  onToggleCrossTeam: () => void;
  canEditStructure?: boolean;
}

export function SettingsVisibilitySection({
  isExclusive,
  playerTeamWorkoutVisibility,
  playerLeagueWorkoutVisibility,
  crossTeamVisibility,
  onTogglePublic,
  onToggleExclusive,
  onToggleTeamWorkout,
  onToggleLeagueWorkout,
  onToggleCrossTeam,
  canEditStructure = true,
}: Props) {
  return (
    <View className="gap-3">
      <SectionLabel label="VISIBILITY" />
      <Card className="p-4">
        <ToggleRow
          label="Private League"
          description="Private leagues are not publicly discoverable."
          value={true}
          onToggle={onTogglePublic}
          disabled
        />
        <Divider />
        <ToggleRow
          label="Invite Only"
          description="Members can only join via invite code."
          value={isExclusive}
          onToggle={onToggleExclusive}
          disabled={!canEditStructure}
        />
        <Divider />
        <ToggleRow
          label="Team Activity Visibility"
          description="Players can view their teammates' last 5 approved activities."
          value={playerTeamWorkoutVisibility}
          onToggle={onToggleTeamWorkout}
        />
        <Divider />
        <ToggleRow
          label="Cross-Team Activity Visibility"
          description="Players can search and view other teams' member activities."
          value={playerLeagueWorkoutVisibility}
          onToggle={onToggleLeagueWorkout}
        />
        <Divider />
        <ToggleRow
          label="Cross-Team Activity Feed"
          description="Players can view a feed of approved activities from other teams (read-only, no proof images)."
          value={crossTeamVisibility}
          onToggle={onToggleCrossTeam}
        />
      </Card>
    </View>
  );
}
