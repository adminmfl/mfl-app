import Feather from '@expo/vector-icons/Feather';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import type { RoleCardData, RoleDetail } from '../types/mfl-rules.types';
import { BulletList } from './bullet-list';

function RoleDetailBlock({ detail }: { detail: RoleDetail }) {
  let body: ReactNode = null;

  if (detail.items) {
    body = <BulletList items={detail.items} />;
  } else if (detail.text) {
    body = <AppText className="text-sm leading-5 text-muted">{detail.text}</AppText>;
  }

  return (
    <View className="gap-2">
      <AppText className="text-sm font-semibold text-foreground">
        {detail.heading}:
      </AppText>
      {body}
    </View>
  );
}

export function RoleCard({
  title,
  subtitle,
  icon,
  iconColor,
  iconBackground,
  details,
}: RoleCardData) {
  return (
    <Card className="p-4">
      <View className="mb-3 flex-row items-start gap-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: iconBackground }}
        >
          <Feather name={icon} size={20} color={iconColor} />
        </View>
        <View className="flex-1">
          <AppText className="text-base font-semibold text-foreground">
            {title}
          </AppText>
          <AppText className="mt-0.5 text-xs text-muted">{subtitle}</AppText>
        </View>
      </View>

      <View className="gap-4">
        {details.map((detail) => (
          <RoleDetailBlock key={detail.heading} detail={detail} />
        ))}
      </View>
    </Card>
  );
}
