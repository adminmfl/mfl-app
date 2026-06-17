import { Pressable, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { compareDates, formatDisplayDate } from '../utils/date-helpers';

interface DatePickerRowProps {
  value: string;
  minDate: string;
  maxDate: string;
  isLocked?: boolean;
  onShift: (days: number) => void;
}

export function DatePickerRow({
  value,
  maxDate,
  isLocked = false,
  onShift,
}: DatePickerRowProps) {
  const atMax = compareDates(value, maxDate) >= 0;

  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        <AppText className="text-sm font-semibold text-muted">Date</AppText>
        {isLocked && (
          <View className="bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">
            <AppText className="text-xs text-amber-700 dark:text-amber-400">
              Locked to original date
            </AppText>
          </View>
        )}
      </View>
      <View className="bg-card rounded-xl border border-separator p-3">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={() => onShift(-1)} hitSlop={8} disabled={isLocked}>
            <Feather
              name="chevron-left"
              size={22}
              color={isLocked ? mflColors.textMuted : mflColors.text}
            />
          </Pressable>
          <AppText className="text-base font-medium text-foreground">
            {formatDisplayDate(value)}
          </AppText>
          <Pressable
            onPress={() => onShift(1)}
            hitSlop={8}
            disabled={isLocked || atMax}
          >
            <Feather
              name="chevron-right"
              size={22}
              color={isLocked || atMax ? mflColors.textMuted : mflColors.text}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
