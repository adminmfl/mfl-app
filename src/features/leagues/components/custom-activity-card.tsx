import { AppText } from '../../../components/app-text';
import { Chip } from 'heroui-native';
import { mflColors } from '../../../constants/colors';
import { MEASUREMENT_LABELS } from '../utils/activity-config';
import type { CustomActivityConfig } from '../types/activity-config.model';
import Feather from '@expo/vector-icons/Feather';
import { Pressable, View } from 'react-native';

export function CustomActivityCard({
  activity,
  canManage,
  isDeleting,
  onEdit,
  onDelete,
}: {
  activity: CustomActivityConfig;
  canManage: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View
      className="rounded-xl border p-3"
      style={{ borderColor: mflColors.border, backgroundColor: mflColors.white }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-2">
          <View className="flex-row flex-wrap items-center gap-2">
            <AppText className="text-sm font-bold text-foreground">
              {activity.activity_name}
            </AppText>
            <Chip size="sm" variant="soft">
              <Chip.Label>Custom</Chip.Label>
            </Chip>
            {activity.category ? (
              <Chip size="sm" variant="soft">
                <Chip.Label>{activity.category.display_name}</Chip.Label>
              </Chip>
            ) : null}
          </View>
          {activity.description ? (
            <AppText className="text-xs text-muted" numberOfLines={2}>
              {activity.description}
            </AppText>
          ) : null}
          <View className="flex-row flex-wrap gap-2">
            <Chip size="sm" variant="soft">
              <Chip.Label>
                {MEASUREMENT_LABELS[activity.measurement_type]}
              </Chip.Label>
            </Chip>
            <Chip size="sm" variant="soft">
              <Chip.Label>
                Proof {activity.requires_proof ? 'required' : 'optional'}
              </Chip.Label>
            </Chip>
            <Chip size="sm" variant="soft">
              <Chip.Label>
                Notes {activity.requires_notes ? 'required' : 'optional'}
              </Chip.Label>
            </Chip>
            {typeof activity.usage_count === 'number' ? (
              <Chip size="sm" variant="soft">
                <Chip.Label>{activity.usage_count} uses</Chip.Label>
              </Chip>
            ) : null}
          </View>
        </View>

        {canManage ? (
          <View className="flex-row gap-2">
            <Pressable onPress={onEdit} hitSlop={8}>
              <View
                className="h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: mflColors.brandLight }}
              >
                <Feather name="edit-2" size={16} color={mflColors.brand} />
              </View>
            </Pressable>
            <Pressable onPress={onDelete} disabled={isDeleting} hitSlop={8}>
              <View
                className="h-9 w-9 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: mflColors.dangerLight,
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                <Feather name="trash-2" size={16} color={mflColors.danger} />
              </View>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}
