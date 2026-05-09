import Feather from '@expo/vector-icons/Feather';
import { Pressable, View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { MenuItemProps } from '../types/settings.types';

export function SettingsMenuItem({ icon, label, onPress, trailing }: MenuItemProps) {
  return (
    <Pressable
      className="flex-row items-center justify-between py-3"
      onPress={onPress}
      disabled={!onPress && !trailing}
    >
      <View className="flex-row items-center gap-3">
        <Feather name={icon} size={20} color={mflColors.textSub} />
        <AppText className="text-base text-foreground">{label}</AppText>
      </View>
      {trailing ?? <Feather name="chevron-right" size={18} color={mflColors.textMuted} />}
    </Pressable>
  );
}
