import { Pressable, View } from 'react-native';
import { Card } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { ChallengeTemplate } from '../types/ai-manager.model';

interface ChallengeTemplateCardProps {
  template: ChallengeTemplate;
  onDeploy: (template: ChallengeTemplate) => void;
}

export function ChallengeTemplateCard({ template, onDeploy }: ChallengeTemplateCardProps) {
  const communicationCount = Array.isArray(template.commTemplates)
    ? template.commTemplates.length
    : 0;
  const ruleCount = Array.isArray(template.rules) ? template.rules.length : 0;

  return (
    <Card className="p-4 mb-3">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 pr-3">
          <AppText className="text-sm font-bold text-foreground">{template.title}</AppText>
          {template.description && (
            <AppText className="text-xs text-muted mt-1" numberOfLines={2}>
              {template.description}
            </AppText>
          )}
        </View>
        <View className="rounded-full px-2 py-1" style={{ backgroundColor: mflColors.inkLight }}>
          <AppText className="text-[10px] font-semibold" style={{ color: mflColors.textSub }}>
            {template.challengeType}
          </AppText>
        </View>
      </View>

      <View className="flex-row flex-wrap mb-3" style={{ gap: 8 }}>
        <Meta icon="calendar" label={`${template.durationDays} days`} />
        {template.totalPoints != null && <Meta icon="award" label={`${template.totalPoints} pts`} />}
        {communicationCount > 0 && <Meta icon="message-square" label={`${communicationCount} messages`} />}
        {ruleCount > 0 && <Meta icon="list" label={`${ruleCount} rules`} />}
      </View>

      <Pressable
        className="flex-row items-center justify-center rounded-lg py-2.5"
        style={{ backgroundColor: mflColors.brand }}
        onPress={() => onDeploy(template)}
      >
        <Feather name="zap" size={14} color="#fff" style={{ marginRight: 6 }} />
        <AppText className="text-sm font-semibold" style={{ color: '#fff' }}>
          Deploy Challenge
        </AppText>
      </Pressable>
    </Card>
  );
}

function Meta({ icon, label }: { icon: keyof typeof Feather.glyphMap; label: string }) {
  return (
    <View className="flex-row items-center">
      <Feather name={icon} size={12} color={mflColors.textMuted} style={{ marginRight: 3 }} />
      <AppText className="text-[11px] text-muted">{label}</AppText>
    </View>
  );
}
