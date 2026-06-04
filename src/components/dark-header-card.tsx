import { View, type ViewStyle } from 'react-native';
import { AppText } from './app-text';
import { mflColors } from '../constants/colors';

interface DarkHeaderCardProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function DarkHeaderCard({ title, subtitle, children, style }: DarkHeaderCardProps) {
  return (
    <View className="rounded-2xl p-5" style={[{ backgroundColor: mflColors.ink }, style]}>
      <AppText className="text-lg font-bold" style={{ color: mflColors.white }}>{title}</AppText>
      {subtitle && (
        <AppText className="text-sm text-muted mt-1">{subtitle}</AppText>
      )}
      {children}
    </View>
  );
}
