import { View, type ViewStyle } from 'react-native';
import { Avatar, Chip } from 'heroui-native';
import { AppText } from './app-text';
import { mflColors } from '../constants/colors';

interface MemberRowProps {
  name: string;
  avatarUrl?: string | null;
  role?: string;
  streak?: number;
  logged?: boolean;
  rr?: number;
  style?: ViewStyle;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export function MemberRow({ name, avatarUrl, role, streak, logged, rr, style }: MemberRowProps) {
  return (
    <View className="flex-row items-center py-3 gap-3" style={style}>
      <Avatar size="md" alt={name}>
        {avatarUrl ? <Avatar.Image source={{ uri: avatarUrl }} /> : null}
        <Avatar.Fallback>{getInitials(name)}</Avatar.Fallback>
      </Avatar>
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <AppText className="text-sm font-semibold text-foreground" numberOfLines={1}>
            {name}
          </AppText>
          {role && (
            <Chip size="sm" variant="soft">
              {role}
            </Chip>
          )}
        </View>
        <View className="flex-row gap-3">
          {streak !== undefined && (
            <AppText className="text-xs text-muted">{streak}d streak</AppText>
          )}
          {logged !== undefined && (
            <AppText className="text-xs" style={{ color: logged ? mflColors.brand : mflColors.textMuted }}>
              {logged ? 'Logged' : 'Not logged'}
            </AppText>
          )}
        </View>
      </View>
      {rr !== undefined && (
        <AppText className="text-base font-bold" style={{ color: mflColors.brand }}>
          {rr.toFixed(1)}
        </AppText>
      )}
    </View>
  );
}
