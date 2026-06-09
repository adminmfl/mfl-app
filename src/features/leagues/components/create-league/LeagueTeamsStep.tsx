import { TextInput, View } from 'react-native';
import { Button, Card } from 'heroui-native';

import { AppText } from '../../../../components/app-text';
import { mflColors } from '../../../../constants/colors';

const inputStyle = {
  backgroundColor: mflColors.white,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 15,
  color: mflColors.text,
} as const;

interface LeagueTeamsStepProps {
  maxParticipants: string;
  numTeams: number;
  estimatedParticipants: number;
  onChangeMaxParticipants: (value: string) => void;
  onChangeNumTeams: (value: number) => void;
  onNext: () => void;
  onBack: () => void;
}

function Stepper({
  label,
  value,
  onIncrement,
  onDecrement,
  min,
  max,
}: {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min: number;
  max: number;
}) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <AppText className="text-sm font-medium text-foreground">{label}</AppText>
      <View className="flex-row items-center gap-3">
        <Button variant="secondary" size="sm" isDisabled={value <= min} onPress={onDecrement}>
          <Button.Label>-</Button.Label>
        </Button>
        <AppText className="text-lg font-bold text-foreground" style={{ minWidth: 32, textAlign: 'center' }}>
          {value}
        </AppText>
        <Button variant="secondary" size="sm" isDisabled={value >= max} onPress={onIncrement}>
          <Button.Label>+</Button.Label>
        </Button>
      </View>
    </View>
  );
}

export function LeagueTeamsStep({
  maxParticipants,
  numTeams,
  estimatedParticipants,
  onChangeMaxParticipants,
  onChangeNumTeams,
  onNext,
  onBack,
}: LeagueTeamsStepProps) {
  return (
    <View className="gap-4">
      <View className="gap-2">
        <AppText className="text-lg font-bold text-foreground">Teams & Capacity</AppText>
        <AppText className="text-sm text-muted">Set the participant cap and the number of teams.</AppText>
      </View>

      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">Total Participants (Max) *</AppText>
        <TextInput
          style={inputStyle}
          value={maxParticipants}
          onChangeText={onChangeMaxParticipants}
          placeholder="e.g. 20"
          placeholderTextColor={mflColors.textMuted}
          keyboardType="number-pad"
          maxLength={4}
        />
        <AppText className="text-xs text-muted">Used for plan sizing and team balance.</AppText>
      </View>

      <Card className="p-4">
        <Stepper
          label="Number of Teams"
          value={numTeams}
          onIncrement={() => onChangeNumTeams(Math.min(numTeams + 1, 20))}
          onDecrement={() => onChangeNumTeams(Math.max(numTeams - 1, 2))}
          min={2}
          max={20}
        />
      </Card>

      <Card className="p-4 gap-2">
        <AppText className="text-sm font-semibold text-foreground">Estimated Participants</AppText>
        <AppText className="text-sm text-muted">
          {estimatedParticipants} participants will be used for tier recommendation.
        </AppText>
      </Card>

      <View className="flex-row gap-3 mt-2">
        <Button variant="secondary" size="lg" onPress={onBack} className="flex-1">
          <Button.Label>Back</Button.Label>
        </Button>
        <Button variant="primary" size="lg" onPress={onNext} className="flex-1">
          <Button.Label>Review</Button.Label>
        </Button>
      </View>
    </View>
  );
}
