import Feather from '@expo/vector-icons/Feather';
import { useCallback, useState } from 'react';
import { Alert, Image, Linking, Pressable, View } from 'react-native';
import { Card, Chip, Spinner, Switch } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ScreenState } from '../../../components/screen-state';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import { useLeagueContext } from '../../../contexts/league-context';
import { useRole } from '../../../contexts/role-context';
import {
  useLeagueSponsors,
  useUpdateSponsorSlots,
} from '../hooks/use-league-sponsors';
import { SPONSOR_CATEGORY_LABELS } from '../types/sponsor.model';
import type { LeagueSponsorSlot, SponsorCategory } from '../types/sponsor.model';

const CATEGORY_COLORS: Record<SponsorCategory, { bg: string; text: string }> = {
  title: { bg: '#F3E8FF', text: '#7C3AED' },
  team: { bg: mflColors.blueLight, text: mflColors.blue },
  challenge: { bg: '#FFEDD5', text: '#EA580C' },
  grand_finale: { bg: mflColors.amberLight, text: mflColors.amber },
};

function CategoryBadge({ category }: { category: SponsorCategory }) {
  const colors = CATEGORY_COLORS[category];
  return (
    <Chip size="sm" variant="soft" style={{ backgroundColor: colors.bg }}>
      <Chip.Label style={{ color: colors.text }}>
        {SPONSOR_CATEGORY_LABELS[category]}
      </Chip.Label>
    </Chip>
  );
}

function SlotCard({
  slot,
  saving,
  onToggle,
}: {
  slot: LeagueSponsorSlot;
  saving: boolean;
  onToggle: (slot: LeagueSponsorSlot) => void;
}) {
  return (
    <Card
      className="p-4 mb-3"
      style={
        slot.lockedByAdmin
          ? { borderWidth: 1, borderColor: mflColors.amber }
          : undefined
      }
    >
      <View className="flex-row items-start justify-between gap-3">
        {/* Left: logo + info */}
        <View className="flex-row items-start gap-3 flex-1">
          <View
            className="w-12 h-12 rounded-lg items-center justify-center overflow-hidden"
            style={{ backgroundColor: mflColors.surface, borderWidth: 1, borderColor: mflColors.border }}
          >
            {slot.sponsor?.logoUrl ? (
              <Image
                source={{ uri: slot.sponsor.logoUrl }}
                style={{ width: 48, height: 48 }}
                resizeMode="contain"
              />
            ) : (
              <Feather name="speaker" size={20} color={mflColors.textMuted} />
            )}
          </View>

          <View className="flex-1">
            <AppText className="text-sm font-semibold text-foreground">
              {slot.sponsor?.name ?? 'Unknown Sponsor'}
            </AppText>
            <View className="flex-row items-center gap-2 mt-1 flex-wrap">
              <CategoryBadge category={slot.category} />
              {slot.lockedByAdmin && (
                <View className="flex-row items-center gap-0.5">
                  <Feather name="lock" size={10} color={mflColors.amber} />
                  <AppText className="text-[10px]" style={{ color: mflColors.amber }}>
                    Locked
                  </AppText>
                </View>
              )}
            </View>
            {slot.sponsor?.websiteUrl ? (
              <Pressable
                onPress={() => Linking.openURL(slot.sponsor!.websiteUrl!)}
                className="flex-row items-center gap-1 mt-1"
              >
                <AppText className="text-[10px] text-muted" numberOfLines={1}>
                  {slot.sponsor.websiteUrl}
                </AppText>
                <Feather name="external-link" size={10} color={mflColors.textMuted} />
              </Pressable>
            ) : null}
            {slot.team ? (
              <AppText className="text-[10px] text-muted mt-1">
                Team: {slot.team.teamName}
              </AppText>
            ) : null}
            {slot.challenge ? (
              <AppText className="text-[10px] text-muted mt-1">
                Challenge: {slot.challenge.challengeName}
              </AppText>
            ) : null}
            {slot.activationStart ? (
              <AppText className="text-[10px] text-muted mt-1">
                Active: {new Date(slot.activationStart).toLocaleDateString()}
                {slot.activationEnd
                  ? ` - ${new Date(slot.activationEnd).toLocaleDateString()}`
                  : ' onwards'}
              </AppText>
            ) : null}
          </View>
        </View>

        {/* Right: toggle */}
        <View className="items-center gap-1">
          <AppText className="text-[10px] text-muted">
            {slot.enabled ? 'Visible' : 'Hidden'}
          </AppText>
          {saving ? (
            <Spinner size="sm" />
          ) : (
            <Switch
              isSelected={slot.enabled}
              onSelectedChange={() => onToggle(slot)}
              isDisabled={slot.lockedByAdmin}
            />
          )}
        </View>
      </View>
    </Card>
  );
}

export function SponsorManagementScreen() {
  const { activeLeague } = useLeagueContext();
  const { isHost, isGovernor } = useRole();
  const leagueId = activeLeague?.leagueId ?? '';

  const { data: slots, isLoading, isError, refetch } = useLeagueSponsors(leagueId);
  const updateMutation = useUpdateSponsorSlots(leagueId);
  const [savingSlotId, setSavingSlotId] = useState<string | null>(null);

  const handleToggle = useCallback(
    async (slot: LeagueSponsorSlot) => {
      if (slot.lockedByAdmin) {
        Alert.alert('Locked', 'This slot is locked by an admin and cannot be modified.');
        return;
      }

      setSavingSlotId(slot.id);
      try {
        await updateMutation.mutateAsync([
          { slot_id: slot.id, enabled: !slot.enabled },
        ]);
      } catch {
        Alert.alert('Error', 'Failed to update sponsor slot.');
      } finally {
        setSavingSlotId(null);
      }
    },
    [updateMutation],
  );

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  if (!activeLeague) {
    return (
      <ScreenScrollView>
        <ScreenState
          screen="governor"
          state="empty"
          message="Select a league to manage sponsors"
        />
      </ScreenScrollView>
    );
  }

  if (!isHost && !isGovernor) {
    return (
      <ScreenScrollView>
        <View className="flex-1 justify-center items-center p-8">
          <Feather name="alert-circle" size={32} color={mflColors.danger} />
          <AppText className="text-base font-semibold text-foreground mt-4">
            Access Restricted
          </AppText>
          <AppText className="text-sm text-muted text-center mt-1">
            Only hosts and governors can manage sponsors.
          </AppText>
        </View>
      </ScreenScrollView>
    );
  }

  if (isLoading) {
    return (
      <ScreenScrollView>
        <ScreenState screen="governor" state="loading" />
      </ScreenScrollView>
    );
  }

  if (isError) {
    return (
      <ScreenScrollView>
        <ScreenState
          screen="governor"
          state="error"
          message="Failed to load sponsors"
          actionLabel="Retry"
          onAction={handleRefresh}
        />
      </ScreenScrollView>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <ScreenScrollView onRefresh={handleRefresh}>
        <View className="py-4">
          <SectionLabel label="SPONSOR MANAGEMENT" />
          <Card className="p-6 mt-2">
            <View className="items-center gap-3">
              <Feather name="speaker" size={32} color={mflColors.textMuted} />
              <AppText className="text-base font-semibold text-foreground">
                No Sponsor Slots
              </AppText>
              <AppText className="text-sm text-muted text-center">
                No sponsors have been assigned to this league yet. Contact your
                platform admin to set up sponsor slots.
              </AppText>
            </View>
          </Card>
        </View>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView onRefresh={handleRefresh}>
      <View className="py-4 gap-4">
        <View>
          <SectionLabel label="SPONSOR MANAGEMENT" />
          <AppText className="text-sm text-muted mt-1">
            Toggle sponsor visibility for your league. Locked slots are managed
            by admins.
          </AppText>
        </View>

        <View>
          {slots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              saving={savingSlotId === slot.id}
              onToggle={handleToggle}
            />
          ))}
        </View>
      </View>
    </ScreenScrollView>
  );
}
