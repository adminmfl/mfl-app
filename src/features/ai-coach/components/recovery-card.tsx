import { View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import type { RecoveryInfo } from '../types/ai-coach.model';

interface RecoveryCardProps {
  recovery: RecoveryInfo;
}

export function RecoveryCard({ recovery }: RecoveryCardProps) {
  if (!recovery.needsRecovery || !recovery.suggestion) return null;

  return (
    <Card
      className="p-3 mb-2"
      style={{ backgroundColor: '#FFF7ED', borderColor: '#FED7AA', borderWidth: 1 }}
    >
      <View className="flex-row items-start">
        <View
          className="w-7 h-7 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: '#FFEDD5' }}
        >
          <Feather name="heart" size={14} color="#EA580C" />
        </View>
        <View className="flex-1">
          <AppText className="text-sm font-semibold" style={{ color: '#9A3412' }}>
            Welcome Back
          </AppText>
          <AppText className="text-xs mt-0.5" style={{ color: '#C2410C' }}>
            {recovery.daysSinceLastActivity} days since last activity
          </AppText>
          <AppText className="text-xs mt-1" style={{ color: '#7C2D12' }}>
            {recovery.suggestion}
          </AppText>
        </View>
      </View>
    </Card>
  );
}
