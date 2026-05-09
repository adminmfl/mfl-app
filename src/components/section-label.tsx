import { View, Pressable, type ViewStyle } from 'react-native';
import { AppText } from './app-text';
import { mflColors } from '../constants/colors';

interface SectionLabelProps {
  label: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SectionLabel({ label, actionLabel, onAction, style }: SectionLabelProps) {
  return (
    <View className="flex-row items-center justify-between" style={style}>
      <AppText className="text-xs font-semibold text-muted uppercase tracking-wider">
        {label}
      </AppText>
      {actionLabel && onAction && (
        <Pressable onPress={onAction}>
          <AppText className="text-xs font-semibold" style={{ color: mflColors.brand }}>
            {actionLabel}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}
