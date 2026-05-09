import Feather from '@expo/vector-icons/Feather';
import { Pressable } from 'react-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

interface ActionButtonProps {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export function ActionButton({
  label,
  icon,
  onPress,
  variant = 'secondary',
  disabled = false,
}: ActionButtonProps) {
  const colors = getColors(variant, disabled);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-center gap-2 rounded-full border px-3 py-2"
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Feather name={icon} size={15} color={colors.text} />
      <AppText className="text-xs font-semibold" style={{ color: colors.text }}>
        {label}
      </AppText>
    </Pressable>
  );
}

function getColors(variant: NonNullable<ActionButtonProps['variant']>, disabled: boolean) {
  if (disabled) {
    return {
      background: mflColors.surface,
      border: mflColors.border,
      text: mflColors.textMuted,
    };
  }
  if (variant === 'primary') {
    return {
      background: mflColors.brand,
      border: mflColors.brand,
      text: mflColors.white,
    };
  }
  if (variant === 'danger') {
    return {
      background: mflColors.dangerLight,
      border: mflColors.dangerLight,
      text: mflColors.danger,
    };
  }
  return {
    background: mflColors.card,
    border: mflColors.border,
    text: mflColors.text,
  };
}
