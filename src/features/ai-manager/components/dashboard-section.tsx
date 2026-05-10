import { View, Pressable } from 'react-native';
import { Card } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { SectionLabel } from '../../../components/section-label';
import { AlertCard } from './alert-card';
import { DigestCard } from './digest-card';
import type { DigestItem } from '../types/ai-manager.model';
import type { Intervention } from '../types/ai-manager.model';

interface DashboardSectionProps {
  digestItems: DigestItem[];
  interventions: Intervention[];
  generatingIntId: string | null;
  onMarkDigestRead: (ids: string[]) => void;
  onDismissDigest: (ids: string[]) => void;
  onGenerateDraft: (interventionId: string) => void;
  onDismissIntervention: (ids: string[]) => void;
}

export function DashboardSection({
  digestItems,
  interventions,
  generatingIntId,
  onMarkDigestRead,
  onDismissDigest,
  onGenerateDraft,
  onDismissIntervention,
}: DashboardSectionProps) {
  const unreadDigest = digestItems.filter((d) => d.status === 'unread');
  const pendingAlerts = interventions.filter((i) => i.status === 'pending');

  return (
    <View>
      {/* Alerts Section */}
      <View className="flex-row items-center justify-between mb-2">
        <SectionLabel label="Alerts" />
        {pendingAlerts.length > 0 && (
          <AppText className="text-xs text-muted">({pendingAlerts.length} pending)</AppText>
        )}
      </View>

      {interventions.length === 0 ? (
        <Card className="p-4 mb-4">
          <AppText className="text-xs text-muted text-center py-4">
            No alerts. Run a scan to check for at-risk members.
          </AppText>
        </Card>
      ) : (
        interventions.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            isGenerating={generatingIntId === alert.id}
            onGenerateDraft={onGenerateDraft}
            onDismiss={(id) => onDismissIntervention([id])}
          />
        ))
      )}

      {/* Digest Insights Section */}
      <View className="flex-row items-center justify-between mt-4 mb-2">
        <SectionLabel label="Digest Insights" />
        {unreadDigest.length > 0 && (
          <Pressable
            className="flex-row items-center"
            onPress={() => onMarkDigestRead(unreadDigest.map((d) => d.id))}
          >
            <Feather name="eye" size={14} color={mflColors.brand} style={{ marginRight: 4 }} />
            <AppText className="text-xs font-medium" style={{ color: mflColors.brand }}>
              Mark all read
            </AppText>
          </Pressable>
        )}
      </View>

      {digestItems.length === 0 ? (
        <Card className="p-4 mb-4">
          <AppText className="text-xs text-muted text-center py-4">
            No digest items today. Run a scan to check your league health.
          </AppText>
        </Card>
      ) : (
        digestItems.map((item) => (
          <DigestCard
            key={item.id}
            item={item}
            onMarkRead={(id) => onMarkDigestRead([id])}
            onDismiss={(id) => onDismissDigest([id])}
          />
        ))
      )}
    </View>
  );
}
