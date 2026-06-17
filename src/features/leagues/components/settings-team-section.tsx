import { View } from 'react-native';
import { Card } from 'heroui-native';
import { SectionLabel } from '../../../components/section-label';
import { Stepper, ToggleRow, Divider } from './settings-form-fields';

interface Props {
  numTeams: number;
  restDays: number;
  maxTeamCapacity: number;
  autoRestDayEnabled: boolean;
  onChangeNumTeams: (v: number) => void;
  onChangeRestDays: (v: number) => void;
  onChangeMaxTeamCapacity: (v: number) => void;
  onToggleAutoRestDay: () => void;
  canEditStructure?: boolean;
}

export function SettingsTeamSection({
  numTeams,
  restDays,
  maxTeamCapacity,
  autoRestDayEnabled,
  onChangeNumTeams,
  onChangeRestDays,
  onChangeMaxTeamCapacity,
  onToggleAutoRestDay,
  canEditStructure = true,
}: Props) {
  return (
    <View className="gap-3">
      <SectionLabel label="TEAM CONFIGURATION" />
      <Card className="p-4">
        <Stepper
          label="Number of Teams"
          value={numTeams}
          onIncrement={() => onChangeNumTeams(Math.min(numTeams + 1, 20))}
          onDecrement={() => onChangeNumTeams(Math.max(numTeams - 1, 2))}
          min={2}
          max={20}
          disabled={!canEditStructure}
        />
        <Divider />
        <Stepper
          label="Max Team Capacity"
          description="Limits team size for joining."
          value={maxTeamCapacity}
          onIncrement={() => onChangeMaxTeamCapacity(Math.min(maxTeamCapacity + 1, 50))}
          onDecrement={() => onChangeMaxTeamCapacity(Math.max(maxTeamCapacity - 1, 1))}
          min={1}
          max={50}
        />
        <Divider />
        <Stepper
          label="Total Rest Days"
          value={restDays}
          onIncrement={() => onChangeRestDays(Math.min(restDays + 1, 99))}
          onDecrement={() => onChangeRestDays(Math.max(restDays - 1, 0))}
          min={0}
          max={99}
        />
        <Divider />
        <ToggleRow
          label="Auto Rest Day"
          description="Cron assigns a rest day for members with remaining days and no submission."
          value={autoRestDayEnabled}
          onToggle={onToggleAutoRestDay}
        />
      </Card>
    </View>
  );
}
