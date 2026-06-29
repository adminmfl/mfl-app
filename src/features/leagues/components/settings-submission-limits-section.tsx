import { View } from 'react-native';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import { Stepper, Divider } from './settings-form-fields';

interface Props {
  minSubmissionsPerDay: number;
  maxSubmissionsPerDay: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}

export function SettingsSubmissionLimitsSection({
  minSubmissionsPerDay,
  maxSubmissionsPerDay,
  onChangeMin,
  onChangeMax,
}: Props) {
  const hasError = maxSubmissionsPerDay < minSubmissionsPerDay;

  return (
    <View className="gap-3">
      <SectionLabel label="SUBMISSION LIMITS" />
      <Card className="p-4">
        <Stepper
          label="Min submissions per day"
          description="Minimum activities a player must log each day"
          value={minSubmissionsPerDay}
          onIncrement={() => onChangeMin(Math.min(minSubmissionsPerDay + 1, 10))}
          onDecrement={() => onChangeMin(Math.max(minSubmissionsPerDay - 1, 1))}
          min={1}
          max={10}
        />
        <Divider />
        <Stepper
          label="Max submissions per day"
          description="Maximum activities a player can log each day"
          value={maxSubmissionsPerDay}
          onIncrement={() => onChangeMax(Math.min(maxSubmissionsPerDay + 1, 10))}
          onDecrement={() => onChangeMax(Math.max(maxSubmissionsPerDay - 1, 1))}
          min={1}
          max={10}
        />
        {hasError && (
          <View
            className="mt-2 rounded-lg px-3 py-2"
            style={{ backgroundColor: mflColors.dangerLight }}
          >
            <AppText className="text-xs" style={{ color: mflColors.danger }}>
              Max submissions per day must be ≥ min.
            </AppText>
          </View>
        )}
      </Card>
    </View>
  );
}
