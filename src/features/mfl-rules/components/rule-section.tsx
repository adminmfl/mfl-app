import Feather from '@expo/vector-icons/Feather';
import { View } from 'react-native';
import { Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import type { RuleSectionData } from '../types/mfl-rules.types';

export function RuleSection({
  title,
  subtitle,
  icon,
  iconColor,
  iconBackground,
  items,
}: RuleSectionData) {
  return (
    <View className="gap-3">
      <SectionLabel label={title} />
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
            {subtitle ? (
              <AppText className="mt-0.5 text-xs text-muted">{subtitle}</AppText>
            ) : null}
          </View>
        </View>
        <View className="gap-2">
          {items.map((item, index) => (
            <View key={`${item}-${index}`} className="flex-row gap-3">
              <View
                className="mt-0.5 h-6 w-6 items-center justify-center rounded-full"
                style={{ backgroundColor: iconBackground }}
              >
                <AppText
                  className="text-[10px] font-bold"
                  style={{ color: iconColor }}
                >
                  {index + 1}
                </AppText>
              </View>
              <AppText className="flex-1 text-sm leading-5 text-foreground">
                {item}
              </AppText>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}
