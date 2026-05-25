import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import {
  LEAGUE_CONCEPT_DESC,
  LEAGUE_CONCEPT_POINTS,
  SETTINGS_CHECKLIST,
} from '../data/host-support-data';

export function HostSupportContent() {
  const router = useRouter();

  return (
    <View>
      {/* Section A: League Concept */}
      <Card
        variant="secondary"
        className="p-4 mb-5"
        style={{ borderLeftWidth: 4, borderLeftColor: '#3B82F6' }}
      >
        <View className="flex-row items-center gap-3 mb-3">
          <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: '#DBEAFE' }}>
            <Feather name="zap" size={16} color="#2563EB" />
          </View>
          <View>
            <AppText className="text-base font-bold text-foreground">A) League Concept</AppText>
            <AppText className="text-xs text-muted">What you're creating</AppText>
          </View>
        </View>

        <AppText className="text-sm text-foreground leading-5 mb-3">
          {LEAGUE_CONCEPT_DESC}
        </AppText>

        {LEAGUE_CONCEPT_POINTS.map((point, idx) => (
          <View key={idx} className="flex-row items-start gap-3 mb-2">
            <Feather name="check" size={16} color="#2563EB" style={{ marginTop: 2 }} />
            <AppText className="text-sm text-foreground flex-1">{point}</AppText>
          </View>
        ))}
      </Card>

      {/* Section B: Settings Checklist */}
      <Card
        variant="secondary"
        className="p-4 mb-5"
        style={{ borderLeftWidth: 4, borderLeftColor: '#9333EA' }}
      >
        <View className="flex-row items-center gap-3 mb-3">
          <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: '#F3E8FF' }}>
            <Feather name="sliders" size={16} color="#9333EA" />
          </View>
          <View>
            <AppText className="text-base font-bold text-foreground">B) MFL Settings Checklist</AppText>
            <AppText className="text-xs text-muted">Configure before launch</AppText>
          </View>
        </View>

        {SETTINGS_CHECKLIST.map((item, idx) => (
          <View
            key={idx}
            className="flex-row gap-3 pb-3 mb-3"
            style={idx < SETTINGS_CHECKLIST.length - 1 ? { borderBottomWidth: 1, borderBottomColor: mflColors.border } : undefined}
          >
            <View
              className="w-5 h-5 rounded-full items-center justify-center"
              style={{ backgroundColor: '#F3E8FF' }}
            >
              <AppText className="text-[10px] font-bold" style={{ color: '#9333EA' }}>
                {idx + 1}
              </AppText>
            </View>
            <View className="flex-1">
              <AppText className="text-sm font-medium text-foreground">{item.title}</AppText>
              <AppText className="text-xs text-muted mt-0.5">{item.desc}</AppText>
            </View>
          </View>
        ))}
      </Card>

      {/* Ready to Create */}
      <Card variant="secondary" className="p-4" style={{ backgroundColor: mflColors.brandLight }}>
        <View className="flex-row items-center gap-2 mb-2">
          <Feather name="alert-circle" size={18} color={mflColors.text} />
          <AppText className="text-base font-bold text-foreground">Ready to Create?</AppText>
        </View>
        <AppText className="text-sm text-muted mb-4">
          Once you've reviewed both the concept and settings checklist, you're ready to launch your league!
        </AppText>
        <View className="gap-2">
          <Pressable
            className="rounded-lg py-3 items-center flex-row justify-center gap-2"
            style={{ backgroundColor: mflColors.brand }}
            onPress={() => router.push('/(app)/quick-start-league' as any)}
          >
            <Feather name="zap" size={16} color="#fff" />
            <AppText className="text-sm font-semibold" style={{ color: '#fff' }}>
              Quick Start League
            </AppText>
          </Pressable>
          <Pressable
            className="rounded-lg py-3 items-center flex-row justify-center gap-2"
            style={{ backgroundColor: mflColors.card, borderWidth: 1, borderColor: mflColors.border }}
            onPress={() => router.push('/(app)/create-league' as any)}
          >
            <AppText className="text-sm font-semibold text-foreground">
              Create a League
            </AppText>
            <Feather name="arrow-right" size={16} color={mflColors.text} />
          </Pressable>
        </View>
      </Card>
    </View>
  );
}
