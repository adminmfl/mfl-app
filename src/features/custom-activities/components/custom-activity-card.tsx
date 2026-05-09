import Feather from '@expo/vector-icons/Feather';
import { Pressable, View } from 'react-native';
import { Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { CustomActivity } from '../types/custom-activity.model';
import { getMeasurementShortLabel } from '../utils/measurement-types';

interface CustomActivityCardProps {
  activity: CustomActivity;
  isDeleting: boolean;
  deleteDisabled: boolean;
  onEdit: (activity: CustomActivity) => void;
  onDelete: (activity: CustomActivity) => void;
}

export function CustomActivityCard({
  activity,
  isDeleting,
  deleteDisabled,
  onEdit,
  onDelete,
}: CustomActivityCardProps) {
  return (
    <Card className="gap-4 p-4">
      <View className="flex-row items-start gap-3">
        <View className="flex-1 gap-1">
          <View className="flex-row flex-wrap items-center gap-2">
            <AppText
              className="text-base font-bold text-foreground"
              numberOfLines={1}
            >
              {activity.activityName}
            </AppText>
            <StatusBadge label="Custom" tone="brand" />
            {activity.category ? (
              <StatusBadge label={activity.category.displayName} icon="tag" />
            ) : null}
          </View>
          {activity.description ? (
            <AppText className="text-sm text-muted" numberOfLines={3}>
              {activity.description}
            </AppText>
          ) : null}
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <StatusBadge
          label={getMeasurementShortLabel(activity.measurementType)}
          icon={activity.measurementType === 'none' ? 'circle' : 'activity'}
        />
        <StatusBadge
          label={activity.requiresProof ? 'Proof required' : 'Proof optional'}
          icon="camera"
          tone={activity.requiresProof ? 'brand' : 'neutral'}
        />
        <StatusBadge
          label={activity.requiresNotes ? 'Notes required' : 'Notes optional'}
          icon="file-text"
          tone={activity.requiresNotes ? 'brand' : 'neutral'}
        />
        {activity.usageCount > 0 ? (
          <StatusBadge
            label={`Used in ${activity.usageCount} ${activity.usageCount === 1 ? 'league' : 'leagues'}`}
            icon="layers"
          />
        ) : null}
      </View>

      <View className="flex-row gap-2">
        <ActionButton
          label="Edit"
          icon="edit-2"
          onPress={() => onEdit(activity)}
          disabled={deleteDisabled}
        />
        <ActionButton
          label={isDeleting ? 'Deleting' : 'Delete'}
          icon="trash-2"
          tone="danger"
          onPress={() => onDelete(activity)}
          disabled={deleteDisabled}
        />
      </View>
    </Card>
  );
}

function StatusBadge({
  label,
  icon,
  tone = 'neutral',
}: {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  tone?: 'brand' | 'neutral';
}) {
  const backgroundColor = tone === 'brand' ? mflColors.brandLight : mflColors.surface;
  const textColor = tone === 'brand' ? mflColors.brand : mflColors.textSub;

  return (
    <View
      className="flex-row items-center gap-1 rounded-full px-2.5 py-1"
      style={{ backgroundColor }}
    >
      {icon ? <Feather name={icon} size={12} color={textColor} /> : null}
      <AppText className="text-xs font-semibold" style={{ color: textColor }}>
        {label}
      </AppText>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  onPress,
  tone = 'neutral',
  disabled,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  tone?: 'neutral' | 'danger';
  disabled: boolean;
}) {
  const isDanger = tone === 'danger';
  const textColor = isDanger ? mflColors.danger : mflColors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border px-3 py-3"
      style={{
        backgroundColor: isDanger ? mflColors.dangerLight : mflColors.card,
        borderColor: isDanger ? mflColors.dangerLight : mflColors.border,
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <Feather name={icon} size={16} color={textColor} />
      <AppText className="text-sm font-semibold" style={{ color: textColor }}>
        {label}
      </AppText>
    </Pressable>
  );
}
