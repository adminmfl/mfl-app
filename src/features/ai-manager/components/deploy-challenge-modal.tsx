import { useEffect, useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { ChallengeTemplate } from '../types/ai-manager.model';

interface DeployChallengeModalProps {
  template: ChallengeTemplate | null;
  isDeploying: boolean;
  onClose: () => void;
  onDeploy: (body: { templateId: string; startDate: string; customName?: string }) => void;
}

export function DeployChallengeModal({
  template,
  isDeploying,
  onClose,
  onDeploy,
}: DeployChallengeModalProps) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    if (template) {
      setName(template.title);
      setStartDate(tomorrowISO());
    }
  }, [template]);

  return (
    <Modal visible={!!template} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <Pressable className="flex-1" onPress={onClose} />
        <View className="rounded-t-2xl p-5" style={{ backgroundColor: mflColors.card }}>
          <AppText className="text-lg font-bold text-foreground mb-1">Deploy Challenge</AppText>
          <AppText className="text-xs text-muted mb-4">
            Launch this template with its automated communication schedule.
          </AppText>

          <AppText className="text-xs font-semibold text-muted mb-1">Challenge Name</AppText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Challenge name"
            placeholderTextColor={mflColors.textMuted}
            className="rounded-lg p-3 text-sm text-foreground mb-3"
            style={{ backgroundColor: mflColors.surface, borderWidth: 1, borderColor: mflColors.border }}
          />

          <AppText className="text-xs font-semibold text-muted mb-1">Start Date</AppText>
          <TextInput
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={mflColors.textMuted}
            className="rounded-lg p-3 text-sm text-foreground mb-4"
            style={{ backgroundColor: mflColors.surface, borderWidth: 1, borderColor: mflColors.border }}
          />

          <View className="flex-row justify-end" style={{ gap: 10 }}>
            <Pressable className="rounded-lg px-4 py-2.5" style={{ backgroundColor: mflColors.inkLight }} onPress={onClose}>
              <AppText className="text-sm font-medium" style={{ color: mflColors.textSub }}>Cancel</AppText>
            </Pressable>
            <Pressable
              className="rounded-lg px-4 py-2.5"
              style={{ backgroundColor: mflColors.brand, opacity: isDeploying || !startDate ? 0.7 : 1 }}
              onPress={() => {
                if (!template || !startDate) return;
                onDeploy({
                  templateId: template.id,
                  startDate,
                  customName: name.trim() || undefined,
                });
              }}
              disabled={isDeploying || !startDate}
            >
              <AppText className="text-sm font-semibold" style={{ color: '#fff' }}>
                {isDeploying ? 'Deploying...' : 'Deploy'}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function tomorrowISO() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}
