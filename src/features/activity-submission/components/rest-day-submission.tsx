import { useCallback, useMemo, useState } from 'react';
import { View, TextInput, Pressable, Alert } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Button, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { useUpsertEntry } from '../../submissions';
import { useRestDays } from '../../rest-days';
import {
  todayISO,
  yesterdayISO,
  formatDisplayDate,
  shiftDateISO,
  clampDate,
  compareDates,
  getIANATimezone,
  getTZOffsetMinutes,
} from '../utils/date-helpers';
import type { UserLeague } from '../../leagues/types/league.model';

interface Props {
  leagueId: string;
  league: UserLeague;
  onSuccess: () => void;
}

export function RestDaySubmission({ leagueId, league, onSuccess }: Props) {
  const upsert = useUpsertEntry();
  const { data: restDayStats, isLoading: statsLoading } = useRestDays(leagueId);

  const today = todayISO();
  const yesterday = yesterdayISO();

  const leagueStartDate = useMemo(() => {
    if (!league.startDate) return null;
    return String(league.startDate).slice(0, 10);
  }, [league.startDate]);

  const leagueEndDate = useMemo(() => {
    if (!league.endDate) return null;
    return String(league.endDate).slice(0, 10);
  }, [league.endDate]);

  const maxDate = useMemo(() => {
    if (!leagueEndDate) return today;
    return compareDates(today, leagueEndDate) < 0 ? today : leagueEndDate;
  }, [leagueEndDate, today]);

  const minDate = useMemo(() => {
    if (leagueStartDate && compareDates(today, leagueStartDate) < 0) {
      return shiftDateISO(leagueStartDate, -3);
    }
    return compareDates(maxDate, yesterday) < 0 ? maxDate : yesterday;
  }, [maxDate, yesterday, leagueStartDate, today]);

  const [entryDate, setEntryDate] = useState(() => clampDate(today, minDate, maxDate));
  const [reason, setReason] = useState('');

  const isAtLimit = restDayStats?.isAtLimit ?? false;
  const isExemptionRequest = isAtLimit;

  const shiftDate = useCallback(
    (days: number) => {
      setEntryDate((prev) => clampDate(shiftDateISO(prev, days), minDate, maxDate));
    },
    [minDate, maxDate],
  );

  const handleSubmit = useCallback(async () => {
    if (leagueStartDate) {
      const trialStart = shiftDateISO(leagueStartDate, -3);
      if (compareDates(today, trialStart) < 0) {
        Alert.alert('Not Yet Open', `Submissions open on ${formatDisplayDate(trialStart)}.`);
        return;
      }
    }

    const notesText = isExemptionRequest
      ? `[EXEMPTION_REQUEST] ${reason.trim()}`
      : reason.trim() || undefined;

    try {
      await upsert.mutateAsync({
        league_id: leagueId,
        date: entryDate,
        type: 'rest',
        ...(notesText ? { notes: notesText } : {}),
        overwrite: true,
        tzOffsetMinutes: getTZOffsetMinutes(),
        ianaTimezone: getIANATimezone() ?? undefined,
      });

      const msg = isExemptionRequest
        ? 'Rest day exemption request submitted! Awaiting approval.'
        : 'Rest day logged successfully!';
      Alert.alert('Success', msg, [{ text: 'OK', onPress: onSuccess }]);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to submit rest day.';
      Alert.alert('Submission Failed', msg);
    }
  }, [leagueId, entryDate, reason, isExemptionRequest, upsert, onSuccess, leagueStartDate, today]);

  return (
    <>
      {/* Rest Day Stats */}
      {statsLoading ? (
        <View className="items-center py-4">
          <Spinner size="sm" />
        </View>
      ) : restDayStats ? (
        <View className="bg-card rounded-xl border border-separator p-4 gap-3">
          <AppText className="text-sm font-semibold text-foreground">Rest Day Quota</AppText>
          <View className="flex-row justify-between">
            <View className="items-center flex-1">
              <AppText className="text-2xl font-bold" style={{ color: mflColors.brand }}>{restDayStats.remaining}</AppText>
              <AppText className="text-xs text-muted">Remaining</AppText>
            </View>
            <View className="items-center flex-1">
              <AppText className="text-2xl font-bold text-foreground">{restDayStats.used}</AppText>
              <AppText className="text-xs text-muted">Used</AppText>
            </View>
            <View className="items-center flex-1">
              <AppText className="text-2xl font-bold text-foreground">{restDayStats.totalAllowed}</AppText>
              <AppText className="text-xs text-muted">Total Allowed</AppText>
            </View>
          </View>
          {restDayStats.pending > 0 && (
            <AppText className="text-xs text-muted">{restDayStats.pending} rest day(s) pending approval</AppText>
          )}
        </View>
      ) : null}

      {/* At Limit Warning */}
      {isAtLimit && (
        <View className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200">
          <AppText className="text-sm font-semibold" style={{ color: mflColors.amber }}>
            Rest Day Limit Reached
          </AppText>
          <AppText className="text-sm text-amber-700 dark:text-amber-400 mt-1">
            You have used all your rest days. Submitting will create an exemption request that requires captain/governor approval.
          </AppText>
        </View>
      )}

      {/* Date Picker */}
      <View className="gap-2">
        <AppText className="text-sm font-semibold text-muted">Date</AppText>
        <View className="bg-card rounded-xl border border-separator p-3">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={() => shiftDate(-1)} hitSlop={8}>
              <Feather name="chevron-left" size={22} color={mflColors.text} />
            </Pressable>
            <AppText className="text-base font-medium text-foreground">
              {formatDisplayDate(entryDate)}
            </AppText>
            <Pressable
              onPress={() => shiftDate(1)}
              hitSlop={8}
              disabled={compareDates(entryDate, maxDate) >= 0}
            >
              <Feather
                name="chevron-right"
                size={22}
                color={compareDates(entryDate, maxDate) >= 0 ? mflColors.textMuted : mflColors.text}
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Reason / Notes */}
      <View className="gap-2">
        <AppText className="text-sm font-semibold text-muted">
          {isExemptionRequest ? 'Reason for Exemption *' : 'Reason (optional)'}
        </AppText>
        <TextInput
          style={{
            backgroundColor: mflColors.card,
            borderWidth: 1,
            borderColor: mflColors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: mflColors.text,
            minHeight: 80,
            textAlignVertical: 'top',
          }}
          value={reason}
          onChangeText={setReason}
          placeholder={isExemptionRequest ? 'Please explain why you need an exemption...' : 'Why are you taking a rest day?'}
          placeholderTextColor={mflColors.textMuted}
          multiline
        />
      </View>

      {/* Submit */}
      <View className="pt-2">
        <Button
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          isDisabled={upsert.isPending || (isExemptionRequest && !reason.trim())}
          className="w-full"
        >
          {upsert.isPending ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label>
              {isExemptionRequest ? 'Request Rest Day Exemption' : 'Log Rest Day'}
            </Button.Label>
          )}
        </Button>
      </View>
    </>
  );
}
