import { Alert, View } from 'react-native';
import { Button, Spinner } from 'heroui-native';
import { StatCard } from '../../../components/stat-card';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { usePreviewRR } from '../../submissions';

interface RRPreviewSectionProps {
  leagueId: string;
  workoutType: string;
  duration: string;
  distance: string;
  steps: string;
  holes: string;
  pointsUnit: string;
  rrPreview: number | null;
  onPreviewResult: (score: number) => void;
}

export function RRPreviewSection({
  leagueId,
  workoutType,
  duration,
  distance,
  steps,
  holes,
  pointsUnit,
  rrPreview,
  onPreviewResult,
}: RRPreviewSectionProps) {
  const preview = usePreviewRR();

  const handlePreview = () => {
    if (!workoutType) return;
    preview.mutate(
      {
        league_id: leagueId,
        type: 'workout',
        workout_type: workoutType,
        ...(duration.trim() ? { duration: parseInt(duration, 10) } : {}),
        ...(distance.trim() ? { distance: parseFloat(distance) } : {}),
        ...(steps.trim() ? { steps: parseInt(steps, 10) } : {}),
        ...(holes.trim() ? { holes: parseInt(holes, 10) } : {}),
      },
      {
        onSuccess: (data) => onPreviewResult(data.rrScore),
        onError: (err) => Alert.alert('Preview Failed', err.message),
      },
    );
  };

  return (
    <View className="gap-2">
      <AppText className="text-sm font-semibold text-muted">{pointsUnit} Score Preview</AppText>
      <Button
        variant="secondary"
        size="md"
        onPress={handlePreview}
        isDisabled={!workoutType || preview.isPending}
        className="w-full"
      >
        {preview.isPending ? (
          <Spinner size="sm" />
        ) : (
          <Button.Label>Preview {pointsUnit} Score</Button.Label>
        )}
      </Button>
      {rrPreview != null && (
        <View className="mt-2">
          <StatCard
            value={rrPreview}
            label={`Estimated ${pointsUnit} Score`}
            color={mflColors.brand}
          />
        </View>
      )}
    </View>
  );
}
