import { Pressable } from 'react-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

interface CustomActivityChoiceChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function CustomActivityChoiceChip({
  label,
  selected,
  onPress,
  disabled = false,
}: CustomActivityChoiceChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      className="rounded-full border px-4 py-2"
      style={{
        backgroundColor: selected ? mflColors.brand : mflColors.card,
        borderColor: selected ? mflColors.brand : mflColors.border,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <AppText
        className="text-sm font-medium"
        numberOfLines={1}
        style={{ color: selected ? mflColors.white : mflColors.text }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
