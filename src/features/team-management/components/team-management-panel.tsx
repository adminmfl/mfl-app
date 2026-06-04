import Feather from '@expo/vector-icons/Feather';
import type React from 'react';
import { Pressable, View } from 'react-native';
import { Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

interface TeamManagementPanelProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}

export function TeamManagementPanel({
  title,
  subtitle,
  children,
  onClose,
}: TeamManagementPanelProps) {
  return (
    <Card className="p-4 gap-4">
      <View className="flex-row items-start gap-3">
        <View className="flex-1">
          <AppText className="text-base font-semibold text-foreground">{title}</AppText>
          {subtitle ? (
            <AppText className="text-xs text-muted mt-1">{subtitle}</AppText>
          ) : null}
        </View>
        <Pressable onPress={onClose} hitSlop={10}>
          <Feather name="x" size={22} color={mflColors.textMuted} />
        </Pressable>
      </View>
      {children}
    </Card>
  );
}
