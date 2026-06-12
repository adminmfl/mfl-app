import { View, Pressable, ActivityIndicator } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { OcrExtraction } from '../../../lib/ocr/types';
import type { OcrStatus, SuggestedField } from '../hooks/use-proof-ocr';

interface OcrSuggestionPanelProps {
  extraction: OcrExtraction | null;
  status: OcrStatus;
  error: string | null;
  autoFilledFields: string[];
  suggestedFields: SuggestedField[];
  onApplySuggestion: (field: string, value: string) => void;
}

const FIELD_LABELS: Record<string, string> = {
  duration: 'Duration',
  distance: 'Distance',
  steps: 'Steps',
  calories: 'Calories',
  date: 'Date',
};

export function OcrSuggestionPanel({
  extraction,
  status,
  error,
  autoFilledFields,
  suggestedFields,
  onApplySuggestion,
}: OcrSuggestionPanelProps) {
  if (status === 'idle') return null;

  if (status === 'processing') {
    return (
      <View className="flex-row items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
        <ActivityIndicator size="small" color={mflColors.blue} />
        <AppText className="text-sm text-blue-700">Reading proof image...</AppText>
      </View>
    );
  }

  if (status === 'error' || error) {
    return (
      <View className="flex-row items-center gap-2 rounded-xl border border-default-200 bg-default-50 px-3 py-2">
        <Feather name="eye" size={16} color={mflColors.textMuted} />
        <AppText className="text-sm text-muted">
          {error ?? 'Could not read proof — please enter values manually.'}
        </AppText>
      </View>
    );
  }

  if (
    !extraction ||
    (autoFilledFields.length === 0 && suggestedFields.length === 0)
  ) {
    if (extraction?.warnings.length) {
      return (
        <View className="flex-row items-center gap-2 rounded-xl border border-default-200 bg-default-50 px-3 py-2">
          <Feather name="eye" size={16} color={mflColors.textMuted} />
          <AppText className="text-sm text-muted">{extraction.warnings[0]}</AppText>
        </View>
      );
    }
    return null;
  }

  return (
    <View className="gap-2 rounded-xl border border-separator p-3">
      {/* Source badge */}
      {extraction.source && extraction.source !== 'unknown' && (
        <View className="flex-row items-center gap-2">
          <View className="bg-default-100 px-2 py-0.5 rounded-full">
            <AppText className="text-xs font-medium capitalize text-foreground">
              {extraction.source.replace('_', ' ')}
            </AppText>
          </View>
          <AppText className="text-xs text-muted">detected</AppText>
        </View>
      )}

      {/* Auto-filled fields */}
      {autoFilledFields.length > 0 && (
        <View className="flex-row items-start gap-2">
          <Feather name="check-circle" size={16} color={mflColors.brand} style={{ marginTop: 1 }} />
          <AppText className="text-sm" style={{ color: mflColors.brand }}>
            Auto-filled: {autoFilledFields.map((f) => FIELD_LABELS[f] || f).join(', ')}
          </AppText>
        </View>
      )}

      {/* Suggestions needing confirmation */}
      {suggestedFields.length > 0 && (
        <View className="gap-1.5">
          {suggestedFields.map((s) => {
            const label = (FIELD_LABELS[s.field] || s.field).toLowerCase();
            const unit =
              s.field === 'duration' ? ' min' : s.field === 'distance' ? ' km' : s.field === 'steps' ? ' steps' : '';
            return (
              <View
                key={s.field}
                className="rounded-lg border px-3 py-2.5 gap-2"
                style={{ borderColor: '#FDE68A', backgroundColor: '#FFFBEB' }}
              >
                <AppText className="text-sm text-foreground">
                  Detected {label}: {s.value}{unit}. Is this correct?
                </AppText>
                {s.field !== 'calories' && (
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => onApplySuggestion(s.field, s.value)}
                      hitSlop={6}
                      className="px-3 py-1 rounded"
                      style={{ backgroundColor: mflColors.brand }}
                    >
                      <AppText className="text-xs font-semibold text-white">Apply</AppText>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
