import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Card, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import type {
  AiManagerChallenge,
  ChallengeTemplate,
} from '../types/ai-manager.model';
import { ChallengeTemplateCard } from './challenge-template-card';
import { DeployChallengeModal } from './deploy-challenge-modal';

interface ChallengesSectionProps {
  challenges: AiManagerChallenge[];
  templates: ChallengeTemplate[];
  isLoadingChallenges: boolean;
  isLoadingTemplates: boolean;
  deploying: boolean;
  onDeployTemplate: (
    body: { templateId: string; startDate: string; customName?: string },
    onDone: () => void,
  ) => void;
}

export function ChallengesSection({
  challenges,
  templates,
  isLoadingChallenges,
  isLoadingTemplates,
  deploying,
  onDeployTemplate,
}: ChallengesSectionProps) {
  const [deployTemplate, setDeployTemplate] = useState<ChallengeTemplate | null>(null);
  const activeChallenges = useMemo(
    () => challenges.filter((item) => item.status !== 'closed' && item.status !== 'published'),
    [challenges],
  );

  return (
    <View>
      <SectionLabel label="Active Challenges" />
      {isLoadingChallenges ? (
        <Card className="p-4 mb-4 items-center">
          <Spinner size="sm" />
        </Card>
      ) : activeChallenges.length === 0 ? (
        <Card className="p-4 mb-4">
          <AppText className="text-xs text-muted text-center py-4">
            No active challenges. Deploy one from the template library below.
          </AppText>
        </Card>
      ) : (
        activeChallenges.map((challenge) => (
          <Card key={challenge.id} className="p-4 mb-3">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <AppText className="text-sm font-bold text-foreground">{challenge.name}</AppText>
                {challenge.endDate && (
                  <AppText className="text-xs text-muted mt-1">
                    Ends {new Date(challenge.endDate).toLocaleDateString()}
                  </AppText>
                )}
              </View>
              <View className="rounded-full px-2 py-1" style={{ backgroundColor: statusBg(challenge.status) }}>
                <AppText className="text-[10px] font-semibold" style={{ color: statusText(challenge.status) }}>
                  {challenge.status}
                </AppText>
              </View>
            </View>
            <AppText className="text-[11px] text-muted mt-2">{challenge.challengeType}</AppText>
          </Card>
        ))
      )}

      <SectionLabel label="Template Library" />
      {isLoadingTemplates ? (
        <Card className="p-4 mb-4 items-center">
          <Spinner size="sm" />
        </Card>
      ) : templates.length === 0 ? (
        <Card className="p-4 mb-4">
          <AppText className="text-xs text-muted text-center py-4">
            No challenge templates available.
          </AppText>
        </Card>
      ) : (
        templates.map((template) => (
          <ChallengeTemplateCard
            key={template.id}
            template={template}
            onDeploy={setDeployTemplate}
          />
        ))
      )}

      <DeployChallengeModal
        template={deployTemplate}
        isDeploying={deploying}
        onClose={() => setDeployTemplate(null)}
        onDeploy={(body) => onDeployTemplate(body, () => setDeployTemplate(null))}
      />
    </View>
  );
}

function statusBg(status: string) {
  if (status === 'active') return `${mflColors.brand}18`;
  if (status === 'scheduled' || status === 'upcoming') return `${mflColors.brand}18`;
  return mflColors.inkLight;
}

function statusText(status: string) {
  if (status === 'active') return mflColors.brand;
  if (status === 'scheduled' || status === 'upcoming') return mflColors.brand;
  return mflColors.textSub;
}
