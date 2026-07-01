// Removed React import
import { View } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { WeightLossPrediction } from '../types/challenge.model';

interface WeightLossPredictionBannerProps {
  prediction: WeightLossPrediction;
}

export function WeightLossPredictionBanner({ prediction }: WeightLossPredictionBannerProps) {
  const hasLost = prediction.currentPercentLost > 0;

  return (
    <View
      className="p-4 rounded-xl items-center border"
      style={{
        backgroundColor: mflColors.brandLight,
        borderColor: mflColors.brand,
      }}
    >
      <AppText className="text-sm font-semibold" style={{ color: mflColors.brand }}>
        {hasLost
          ? `If you maintain this weight, you'll earn ${prediction.predictedPoints} pts!`
          : "Log your progress to see your prediction"}
      </AppText>
      {hasLost ? (
        <AppText className="text-xs mt-1" style={{ color: mflColors.brand }}>
          Current Progress: {prediction.currentPercentLost.toFixed(1)}% lost
        </AppText>
      ) : null}
    </View>
  );
}
