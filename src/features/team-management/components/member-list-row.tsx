import Feather from '@expo/vector-icons/Feather';
import type React from 'react';
import { Pressable, View } from 'react-native';
import { Avatar } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { formatRole, getInitials, visibleRoles } from '../utils/team-management-utils';

interface MemberListRowProps {
  name: string;
  email?: string;
  roles?: string[];
  points?: number;
  selected?: boolean;
  captain?: boolean;
  onPress?: () => void;
  right?: React.ReactNode;
}

export function MemberListRow({
  name,
  email,
  roles = [],
  points,
  selected = false,
  captain = false,
  onPress,
  right,
}: MemberListRowProps) {
  const content = (
    <View className="flex-row items-center gap-3">
      <Avatar size="sm" alt={name}>
        <Avatar.Fallback>{getInitials(name)}</Avatar.Fallback>
      </Avatar>
      <View className="flex-1">
        <View className="flex-row items-center gap-1">
          <AppText className="text-sm font-semibold text-foreground" numberOfLines={1}>
            {name}
          </AppText>
          {captain ? <Feather name="award" size={13} color={mflColors.amber} /> : null}
        </View>
        {email ? (
          <AppText className="text-xs text-muted" numberOfLines={1}>
            {points != null ? `Points: ${points}` : email}
          </AppText>
        ) : null}
        {visibleRoles(roles).length > 0 ? (
          <AppText className="text-xs text-muted" numberOfLines={1}>
            {visibleRoles(roles).map(formatRole).join(', ')}
          </AppText>
        ) : null}
      </View>
      {selected ? <Feather name="check-circle" size={18} color={mflColors.brand} /> : null}
      {right}
    </View>
  );

  if (!onPress) {
    return (
      <View className="rounded-xl border p-3" style={{ borderColor: mflColors.border }}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl border p-3"
      style={{
        borderColor: selected ? mflColors.brand : mflColors.border,
        backgroundColor: selected ? mflColors.brandLight : mflColors.card,
      }}
    >
      {content}
    </Pressable>
  );
}
