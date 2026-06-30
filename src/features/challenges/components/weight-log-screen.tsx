import { useState } from 'react';
import { View, TextInput, Alert } from 'react-native';
import { Button, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import { useWeightLossLogPlayer, useSubmitWeightLog } from '../hooks/use-weight-loss-log';
import { WeightLossPredictionBanner } from './weight-loss-prediction-banner';
import { WeightLossResults } from './weight-loss-results';
import { reportError } from '../../../core/utils/report-error';

interface WeightLogScreenProps {
  leagueId: string;
  challengeId: string;
  onBack?: () => void;
}

export function WeightLogScreen({ leagueId, challengeId }: WeightLogScreenProps) {
  const { data: logData, isLoading } = useWeightLossLogPlayer(leagueId, challengeId);
  const submitLog = useSubmitWeightLog(leagueId, challengeId);
  const [weightInput, setWeightInput] = useState('');

  const hasStartLog = logData?.logs?.some((l) => l.logType === 'start');
  const hasEndLog = logData?.logs?.some((l) => l.logType === 'end');

  const handleLogWeight = async (logType: 'start' | 'progress' | 'end') => {
    if (!weightInput.trim() || isNaN(Number(weightInput))) {
      Alert.alert('Invalid Weight', 'Please enter a valid number.');
      return;
    }

    try {
      await submitLog.mutateAsync({
        logType,
        weight: Number(weightInput),
      });
      setWeightInput('');
      Alert.alert('Success', 'Weight logged successfully!');
    } catch (err: any) {
      if (__DEV__) {
        reportError(err);
      }
      Alert.alert('Error', err.message || 'Failed to log weight.');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center p-8">
        <Spinner size="lg" />
      </View>
    );
  }

  return (
    <View className="gap-6 p-4">
      {logData?.prediction && (
        <WeightLossPredictionBanner prediction={logData.prediction} />
      )}

      {logData?.result ? (
        <WeightLossResults result={logData.result} />
      ) : (
        <View className="gap-4">
          <SectionLabel label="Log Your Weight" />
          <View className="p-4 rounded-xl border border-border bg-card gap-4">
            <View className="gap-2">
              <AppText className="text-xs font-semibold text-muted uppercase">Weight</AppText>
              <TextInput
                style={{
                  backgroundColor: mflColors.card,
                  borderWidth: 1,
                  borderColor: mflColors.border,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  fontSize: 15,
                  color: mflColors.text,
                }}
                value={weightInput}
                onChangeText={setWeightInput}
                placeholder="Enter weight"
                placeholderTextColor={mflColors.textMuted}
                keyboardType="numeric"
              />
            </View>

            <View className="gap-2 flex-row">
              {!hasStartLog && (
                <Button
                  variant="primary"
                  className="flex-1"
                  onPress={() => handleLogWeight('start')}
                  isDisabled={submitLog.isPending}
                >
                  {submitLog.isPending ? <Spinner size="sm" /> : <Button.Label>Log Start</Button.Label>}
                </Button>
              )}

              {hasStartLog && !hasEndLog && (
                <>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onPress={() => handleLogWeight('progress')}
                    isDisabled={submitLog.isPending}
                  >
                    {submitLog.isPending ? <Spinner size="sm" /> : <Button.Label>Log Progress</Button.Label>}
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onPress={() => handleLogWeight('end')}
                    isDisabled={submitLog.isPending}
                  >
                    {submitLog.isPending ? <Spinner size="sm" /> : <Button.Label>Log End</Button.Label>}
                  </Button>
                </>
              )}
            </View>
          </View>
        </View>
      )}

      {logData?.logs && logData.logs.length > 0 && (
        <View className="gap-3 mt-4">
          <SectionLabel label="History" />
          <View className="rounded-xl border border-border bg-card overflow-hidden">
            {logData.logs.map((log, i) => (
              <View
                key={log.id}
                className={`flex-row justify-between p-4 ${
                  i < logData.logs.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <AppText className="text-sm font-semibold text-foreground capitalize">
                  {log.logType} Weight
                </AppText>
                <AppText className="text-sm font-bold text-foreground">
                  {log.weight}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
