import Feather from '@expo/vector-icons/Feather';
import { Pressable } from 'react-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

interface MessagingChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  disabled?: boolean;
  tone?: 'neutral' | 'brand' | 'danger' | 'amber';
}

export function MessagingChip({
  label,
  selected = false,
  onPress,
  icon,
  disabled = false,
  tone = 'neutral',
}: MessagingChipProps) {
  const colors = getColors(selected, tone);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      className="flex-row items-center gap-2 rounded-full border px-3 py-2"
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {icon ? <Feather name={icon} size={14} color={colors.text} /> : null}
      <AppText className="text-xs font-semibold" style={{ color: colors.text }}>
        {label}
      </AppText>
    </Pressable>
  );
}

function getColors(selected: boolean, tone: NonNullable<MessagingChipProps['tone']>) {
  if (selected) {
    if (tone === 'danger') {
      return {
        background: mflColors.danger,
        border: mflColors.danger,
        text: mflColors.white,
      };
    }
    if (tone === 'amber') {
      return {
        background: mflColors.amber,
        border: mflColors.amber,
        text: mflColors.white,
      };
    }
    return {
      background: mflColors.brand,
      border: mflColors.brand,
      text: mflColors.white,
    };
  }

  if (tone === 'danger') {
    return {
      background: mflColors.dangerLight,
      border: mflColors.dangerLight,
      text: mflColors.danger,
    };
  }
  if (tone === 'amber') {
    return {
      background: mflColors.amberLight,
      border: mflColors.amberLight,
      text: mflColors.amber,
    };
  }
  if (tone === 'brand') {
    return {
      background: mflColors.brandLight,
      border: mflColors.brandLight,
      text: mflColors.brand,
    };
  }

  return {
    background: mflColors.card,
    border: mflColors.border,
    text: mflColors.text,
  };
}
