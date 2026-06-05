import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import { universalPrinciples, acceptedProofs, roleCards } from '../data/mfl-rules.data';
import { RuleSection } from './rule-section';
import { RoleCard } from './role-card';

export function MflRulesScreen() {
  const router = useRouter();

  return (
    <ScreenScrollView contentContainerClassName="gap-5 pb-10">
      <View className="flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full"
        >
          <Feather name="arrow-left" size={24} color={mflColors.text} />
        </Pressable>
      </View>

      <View className="gap-1">
        <View className="flex-row items-center gap-2">
          <Feather name="info" size={20} color={mflColors.brand} />
          <AppText className="flex-1 text-xl font-bold text-foreground">
            MFL Roles {'\u2013'} Standard Framework
          </AppText>
        </View>
        <AppText className="text-sm text-muted">
          Understanding authority, responsibilities, and flow
        </AppText>
      </View>

      <RuleSection
        title="UNIVERSAL MFL PRINCIPLES"
        subtitle="Applies unless explicitly overridden"
        icon="info"
        iconColor={mflColors.blue}
        iconBackground={mflColors.blueLight}
        items={universalPrinciples}
      />

      <RuleSection
        title="ACCEPTED PROOFS (WEARABLE MANDATORY)"
        subtitle="Proof rules and medical exceptions"
        icon="check-circle"
        iconColor={mflColors.brand}
        iconBackground={mflColors.brandLight}
        items={acceptedProofs}
      />

      <View className="gap-3">
        <SectionLabel label="ROLES" />
        {roleCards.map((role) => (
          <RoleCard key={role.title} {...role} />
        ))}
      </View>

      <Card className="p-4" style={{ backgroundColor: mflColors.dangerLight }}>
        <View className="flex-row items-center gap-2">
          <Feather name="alert-triangle" size={16} color={mflColors.danger} />
          <AppText
            className="flex-1 text-sm font-semibold"
            style={{ color: mflColors.danger }}
          >
            Governor decisions are final. No appeals
          </AppText>
        </View>
      </Card>
    </ScreenScrollView>
  );
}
