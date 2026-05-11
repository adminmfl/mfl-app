import Feather from '@expo/vector-icons/Feather';
import { Pressable, View } from 'react-native';
import { AppText } from '../../../../components/app-text';
import { mflColors } from '../../../../constants/colors';
import type { SettingsGroup } from './settings-groups';

interface Props {
  group: SettingsGroup;
  hint?: string;
  onPress: () => void;
}

export function SettingsGroupCard({ group, hint, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-xl border border-default-200 bg-content1 px-4 py-3.5"
      style={{ gap: 12 }}
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-lg"
        style={{ backgroundColor: mflColors.brandLight }}
      >
        <Feather name={group.icon} size={18} color={mflColors.brand} />
      </View>

      <View className="flex-1" style={{ gap: 2 }}>
        <AppText className="text-sm font-semibold text-foreground">
          {group.title}
        </AppText>
        <AppText className="text-xs text-muted" numberOfLines={1}>
          {group.description}
        </AppText>
        {hint ? (
          <AppText
            className="text-[11px] font-medium"
            style={{ color: mflColors.brand }}
            numberOfLines={1}
          >
            {hint}
          </AppText>
        ) : null}
      </View>

      <Feather name="chevron-right" size={18} color={mflColors.textMuted} />
    </Pressable>
  );
}
