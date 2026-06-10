import { Alert } from 'react-native';

const FIELD_LABELS: Record<string, string> = {
  duration: 'duration',
  distance: 'distance',
  steps: 'steps',
};

function formatDetectedValue(field: string, value: string): string {
  if (field === 'duration') return `${value} min`;
  if (field === 'distance') return `${value} km`;
  if (field === 'steps') return `${value} steps`;
  return value;
}

export function confirmOcrValue(
  field: string,
  value: string,
  onApply: () => void,
): void {
  const label = FIELD_LABELS[field] ?? field;
  Alert.alert(
    'Verify Detected Value',
    `Detected ${label}: ${formatDetectedValue(field, value)}. Is this correct?`,
    [
      { text: 'Edit', style: 'cancel' },
      { text: 'Apply', onPress: onApply },
    ],
  );
}
