import Feather from '@expo/vector-icons/Feather';
import { useMemo } from 'react';
import { Alert, TextInput, View } from 'react-native';
import { Button } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { calculateTeams, type WizardData } from './quick-start.types';

const TEAM_NAMES = [
  'Team Alpha', 'Team Bravo', 'Team Charlie', 'Team Delta',
  'Team Echo', 'Team Foxtrot', 'Team Golf', 'Team Hotel',
  'Team India', 'Team Juliet', 'Team Kilo', 'Team Lima',
];

interface Props {
  data: WizardData;
  onUpdate: (partial: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

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

export function StepTeams({ data, onUpdate, onNext, onBack }: Props) {
  const suggested = useMemo(() => calculateTeams(data.playerCount), [data.playerCount]);

  const handlePlayerCountChange = (val: number) => {
    const clamped = Math.max(4, Math.min(120, val));
    const calc = calculateTeams(clamped);
    onUpdate({
      playerCount: clamped,
      numTeams: calc.numTeams,
      maxTeamCapacity: calc.maxTeamCapacity,
    });
  };

  const handleTeamCountChange = (val: number) => {
    const clamped = Math.max(2, Math.min(12, val));
    const cap = Math.ceil(data.playerCount / clamped) + 2;
    onUpdate({ numTeams: clamped, maxTeamCapacity: cap });
  };

  const handleNext = () => {
    if (data.playerCount < 4 || data.playerCount > 120) {
      Alert.alert('Invalid', 'Player count must be between 4 and 120.');
      return;
    }
    if (data.numTeams < 2 || data.numTeams > 12) {
      Alert.alert('Invalid', 'Team count must be between 2 and 12.');
      return;
    }
    onNext();
  };

  const playersPerTeam = Math.ceil(data.playerCount / data.numTeams);

  return (
    <View className="gap-5">
      <View>
        <AppText className="text-lg font-bold text-foreground">Teams</AppText>
        <AppText className="text-sm text-muted">
          Set player count and team structure. Teams are auto-created with captain invite links.
        </AppText>
      </View>

      {/* Player count */}
      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">Expected Players</AppText>
        <TextInput
          style={inputStyle}
          value={String(data.playerCount)}
          onChangeText={(t) => handlePlayerCountChange(parseInt(t) || 4)}
          keyboardType="number-pad"
          maxLength={3}
        />
        <AppText className="text-xs text-muted">
          Min 4, max 120. Suggested teams: {suggested.numTeams}
        </AppText>
      </View>

      {/* Team count */}
      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">Number of Teams</AppText>
        <TextInput
          style={inputStyle}
          value={String(data.numTeams)}
          onChangeText={(t) => handleTeamCountChange(parseInt(t) || 2)}
          keyboardType="number-pad"
          maxLength={2}
        />
        <AppText className="text-xs text-muted">
          ~{playersPerTeam} players per team · Max capacity: {data.maxTeamCapacity}
        </AppText>
      </View>

      {/* Team preview */}
      <View className="gap-2">
        <AppText className="text-sm font-medium text-muted">Teams to be created</AppText>
        <View className="flex-row flex-wrap gap-2">
          {TEAM_NAMES.slice(0, data.numTeams).map((name) => (
            <View
              key={name}
              className="flex-row items-center gap-2 p-2.5 rounded-lg"
              style={{ backgroundColor: mflColors.inkLight, minWidth: '45%', flexGrow: 1 }}
            >
              <Feather name="users" size={14} color={mflColors.brand} />
              <AppText className="text-sm text-foreground">{name}</AppText>
            </View>
          ))}
        </View>
        <AppText className="text-xs text-muted">
          Captain invite links will be generated for each team after creation.
        </AppText>
      </View>

      {/* Navigation */}
      <View className="flex-row gap-3 mt-2">
        <Button variant="secondary" size="lg" onPress={onBack} className="flex-1">
          <Button.Label>Back</Button.Label>
        </Button>
        <Button variant="primary" size="lg" onPress={handleNext} className="flex-1">
          <Button.Label>Activities & Rules</Button.Label>
        </Button>
      </View>
    </View>
  );
}
