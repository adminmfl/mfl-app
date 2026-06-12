import Feather from '@expo/vector-icons/Feather';
import { View } from 'react-native';
import { Button, Card, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { ManualWeekRow } from '../types/manual-entry';
import { getEntrySummary } from '../utils/manual-entry-utils';

interface ManualEntryWeekListProps {
  rows: ManualWeekRow[] | undefined;
  isLoading: boolean;
  hasSelectedMember: boolean;
  activityNameMap: Map<string, string>;
  onOpenRow: (row: ManualWeekRow) => void;
}

export function ManualEntryWeekList({
  rows,
  isLoading,
  hasSelectedMember,
  activityNameMap,
  onOpenRow,
}: ManualEntryWeekListProps) {
  return (
    <Card className="p-0 overflow-hidden">
      {!hasSelectedMember ? (
        <View className="px-4 py-6">
          <AppText className="text-sm text-muted">Select a player to view the week.</AppText>
        </View>
      ) : isLoading ? (
        <View className="px-4 py-8 items-center gap-3">
          <Spinner size="sm" />
          <AppText className="text-sm text-muted">Loading week...</AppText>
        </View>
      ) : !rows || rows.length === 0 ? (
        <View className="px-4 py-6">
          <AppText className="text-sm text-muted">No data for this week.</AppText>
        </View>
      ) : (
        rows.map((row, index) => {
          const canAct = row.state !== 'upcoming';
          const isApproved = row.state === 'approved';
          const statusColor = getStatusColor(row.state);

          return (
            <View
              key={row.date}
              className="px-4 py-4"
              style={{
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: mflColors.border,
              }}
            >
              <View className="gap-3">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <AppText className="text-sm font-semibold text-foreground">
                      {row.label}
                    </AppText>
                    <AppText className="text-xs mt-1" style={{ color: statusColor }}>
                      {row.entry
                        ? getEntrySummary(row.entry, activityNameMap)
                        : row.state === 'missed'
                          ? 'Missed day'
                          : row.state === 'upcoming'
                            ? 'Upcoming'
                            : 'No submission'}
                    </AppText>
                  </View>
                  <View className="items-end">
                    <AppText className="text-sm font-semibold text-muted">
                      {row.pointsLabel}
                    </AppText>
                  </View>
                </View>

                <Button
                  variant={isApproved ? 'secondary' : 'primary'}
                  size="sm"
                  onPress={() => onOpenRow(row)}
                  isDisabled={!canAct}
                  className="self-start"
                >
                  <Feather
                    name={isApproved ? 'edit-3' : 'plus-circle'}
                    size={16}
                    color={isApproved ? mflColors.text : mflColors.white}
                  />
                  <Button.Label>{isApproved ? 'Overwrite' : 'Add activity'}</Button.Label>
                </Button>
              </View>
            </View>
          );
        })
      )}
    </Card>
  );
}

function getStatusColor(state: ManualWeekRow['state']) {
  switch (state) {
    case 'approved':
      return mflColors.brand;
    case 'pending':
      return mflColors.amber;
    case 'rejected':
      return mflColors.danger;
    default:
      return mflColors.textMuted;
  }
}
