import Feather from '@expo/vector-icons/Feather';
import { Pressable, View } from 'react-native';
import { Button, Chip, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type {
  LeagueActivityConfig,
  RequirementLevel,
} from '../types/activity-config.model';
import {
  MEASUREMENT_LABELS,
  REQUIREMENT_LABELS,
  nextRequirement,
} from '../utils/activity-config';

export function ActivityConfigCard({
  activity,
  isEnabled,
  isBusy,
  canConfigure,
  onAdd,
  onRemove,
  onChangeRequirement,
}: {
  activity: LeagueActivityConfig;
  isEnabled: boolean;
  isBusy: boolean;
  canConfigure: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onChangeRequirement: (
    field: 'proof_requirement' | 'notes_requirement',
    value: RequirementLevel,
  ) => void;
}) {
  const proofRequirement = activity.proof_requirement ?? 'mandatory';
  const notesRequirement = activity.notes_requirement ?? 'optional';

  return (
    <View
      className="rounded-xl border p-3"
      style={{
        borderColor: isEnabled ? mflColors.brand : mflColors.border,
        backgroundColor: isEnabled ? mflColors.brandLight : mflColors.white,
        opacity: isBusy ? 0.65 : 1,
      }}
    >
      <View className="flex-row items-start gap-3">
        <View
          className="mt-1 h-6 w-6 items-center justify-center rounded-md"
          style={{
            backgroundColor: isEnabled ? mflColors.brand : mflColors.surface,
            borderWidth: 1,
            borderColor: isEnabled ? mflColors.brand : mflColors.border,
          }}
        >
          {isBusy ? (
            <Spinner size="sm" />
          ) : isEnabled ? (
            <Feather name="check" size={14} color={mflColors.white} />
          ) : null}
        </View>

        <View className="flex-1 gap-2">
          <View className="flex-row flex-wrap items-center gap-2">
            <AppText className="text-sm font-bold text-foreground">
              {activity.activity_name}
            </AppText>
            {activity.is_custom ? (
              <Chip size="sm" variant="soft">
                <Chip.Label>Custom</Chip.Label>
              </Chip>
            ) : null}
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
                {MEASUREMENT_LABELS[activity.measurement_type] ??
                  activity.measurement_type}
              </Chip.Label>
            </Chip>
            {isEnabled ? (
              <Chip size="sm" variant="soft">
                <Chip.Label>Active</Chip.Label>
              </Chip>
            ) : null}
          </View>

          {isEnabled ? (
            <View className="gap-2">
              <RequirementButton
                label="Proof"
                value={proofRequirement}
                disabled={!canConfigure || isBusy}
                onPress={() =>
                  onChangeRequirement(
                    'proof_requirement',
                    nextRequirement(proofRequirement),
                  )
                }
              />
              <RequirementButton
                label="Notes"
                value={notesRequirement}
                disabled={!canConfigure || isBusy}
                onPress={() =>
                  onChangeRequirement(
                    'notes_requirement',
                    nextRequirement(notesRequirement),
                  )
                }
              />
            </View>
          ) : null}
        </View>
      </View>

      {canConfigure ? (
        <View className="mt-3">
          {isEnabled ? (
            <Button
              variant="secondary"
              size="sm"
              onPress={onRemove}
              isDisabled={isBusy}
            >
              <Button.Label style={{ color: mflColors.danger }}>
                Remove Activity
              </Button.Label>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onPress={onAdd}
              isDisabled={isBusy}
            >
              <Button.Label>Enable Activity</Button.Label>
            </Button>
          )}
        </View>
      ) : null}
    </View>
  );
}

export function RequirementButton({
  label,
  value,
  disabled,
  onPress,
}: {
  label: string;
  value: RequirementLevel;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="flex-row items-center justify-between rounded-lg px-3 py-2"
      style={{
        backgroundColor: mflColors.white,
        borderWidth: 1,
        borderColor: mflColors.border,
        opacity: disabled ? 0.6 : 1,
      }}
      onPress={onPress}
      disabled={disabled}
    >
      <AppText className="text-xs font-medium text-muted">{label}</AppText>
      <View className="flex-row items-center gap-1">
        <AppText className="text-xs font-semibold" style={{ color: mflColors.brand }}>
          {REQUIREMENT_LABELS[value]}
        </AppText>
        {!disabled ? (
          <Feather name="chevron-down" size={14} color={mflColors.brand} />
        ) : null}
      </View>
    </Pressable>
  );
}
