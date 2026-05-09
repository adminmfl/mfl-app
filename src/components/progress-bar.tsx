import { View, type ViewStyle } from 'react-native';
import { mflColors } from '../constants/colors';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  color = mflColors.brand,
  trackColor = mflColors.inkLight,
  height = 8,
  style,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View className="rounded-full overflow-hidden" style={[{ height, backgroundColor: trackColor }, style]}>
      <View
        className="h-full rounded-full"
        style={{ width: `${clamped * 100}%`, backgroundColor: color }}
      />
    </View>
  );
}
