// Removed React import
import { View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { WeightLossPrediction } from '../types/challenge.model';

interface WeightLossPredictionBannerProps {
  prediction: WeightLossPrediction;
}

export function WeightLossPredictionBanner({ prediction }: WeightLossPredictionBannerProps) {
  return (
    <View
      className="p-4 rounded-xl items-center border"
      style={{
        backgroundColor: mflColors.brandLight,
        borderColor: mflColors.brand,
      }}
    >
      <AppText className="text-sm font-semibold" style={{ color: mflColors.brand }}>
        If you maintain this weight, you'll earn {prediction.predictedPoints} pts!
      </AppText>
      <AppText className="text-xs mt-1" style={{ color: mflColors.brand }}>
        Current Progress: {prediction.currentPercentLost.toFixed(1)}% lost
      </AppText>
    </View>
  );
}
