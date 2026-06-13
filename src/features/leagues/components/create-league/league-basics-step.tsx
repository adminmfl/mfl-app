import { TextInput, View } from 'react-native';
import { Button, Card } from 'heroui-native';

import { AppText } from '../../../../components/app-text';
import { DarkHeaderCard } from '../../../../components/dark-header-card';
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

interface LeagueBasicsStepProps {
  leagueName: string;
  description: string;
  startDate: string;
  duration: string;
  durationNum: number;
  restDays: number;
  endDate: string;
  stepOneValid: boolean;
  onChangeLeagueName: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeStartDate: (value: string) => void;
  onChangeDuration: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
}

export function LeagueBasicsStep({
  leagueName,
  description,
  startDate,
  duration,
  durationNum,
  restDays,
  endDate,
  stepOneValid,
  onChangeLeagueName,
  onChangeDescription,
  onChangeStartDate,
  onChangeDuration,
  onNext,
  onBack,
}: LeagueBasicsStepProps) {
  return (
    <View className="gap-4">
      <DarkHeaderCard title="Basic Info" subtitle="Name your league and set the schedule." />

      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">League Name *</AppText>
        <TextInput
          style={inputStyle}
          value={leagueName}
          onChangeText={onChangeLeagueName}
          placeholder="e.g. Summer Fitness Challenge"
          placeholderTextColor={mflColors.textMuted}
          maxLength={100}
        />
      </View>

      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">Description</AppText>
        <TextInput
          style={[inputStyle, { minHeight: 80, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={onChangeDescription}
          placeholder="Describe your league..."
          placeholderTextColor={mflColors.textMuted}
          multiline
          maxLength={500}
        />
      </View>

      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">Start Date</AppText>
        <TextInput
          style={inputStyle}
          value={startDate}
          onChangeText={onChangeStartDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={mflColors.textMuted}
          maxLength={10}
          keyboardType="numbers-and-punctuation"
        />
      </View>

      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">Duration (days) *</AppText>
        <TextInput
          style={inputStyle}
          value={duration}
          onChangeText={onChangeDuration}
          placeholder="e.g. 30"
          placeholderTextColor={mflColors.textMuted}
          keyboardType="number-pad"
          maxLength={3}
        />
        {durationNum > 365 && (
          <AppText className="text-xs" style={{ color: mflColors.danger }}>
            Duration cannot exceed 365 days
          </AppText>
        )}
      </View>

      {endDate.length > 0 && (
        <Card className="p-4 gap-2">
          <View className="flex-row justify-between">
            <AppText className="text-sm text-muted">End Date</AppText>
            <AppText className="text-sm font-medium text-foreground">{formatDate(endDate)}</AppText>
          </View>
          <View className="flex-row justify-between">
            <AppText className="text-sm text-muted">Rest Days (20%)</AppText>
            <AppText className="text-sm font-medium text-foreground">{restDays}</AppText>
          </View>
        </Card>
      )}

      <View className="flex-row gap-3 mt-2">
        <Button variant="secondary" size="lg" onPress={onBack} className="flex-1">
          <Button.Label>Back</Button.Label>
        </Button>
        <Button variant="primary" size="lg" onPress={onNext} isDisabled={!stepOneValid} className="flex-1">
          <Button.Label>Activities</Button.Label>
        </Button>
      </View>
    </View>
  );
}
