import { useCallback, useState } from 'react';
import { View, ScrollView, RefreshControl, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../components/app-text';
import { DarkHeaderCard } from '../../components/dark-header-card';
import { SectionLabel } from '../../components/section-label';
import { ScreenState } from '../../components/screen-state';
import { useLeagueContext } from '../../contexts/league-context';
import { useRole } from '../../contexts/role-context';
import { mflColors } from '../../constants/colors';
import type { MilestoneDraft } from '../../features/captain-engagement/types/captain-engagement.model';
import {
  useCaptainAtRisk,
  useMilestoneDrafts,
  useEditMilestoneDraft,
  useSendMilestoneDraft,
  CaptainAtRiskFeed,
  MilestoneDraftCard,
} from '../../features/captain-engagement';

export default function CaptainEngagementScreen() {
  const insets = useSafeAreaInsets();
  const { activeLeague } = useLeagueContext();
  const { isCaptain, isHost, isGovernor } = useRole();
  const leagueId = activeLeague?.leagueId ?? '';

  if (!isCaptain && !isHost && !isGovernor) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ScreenState
          state="empty"
          message="Captain Engagement is available to captains, hosts, and governors."
        />
      </View>
    );
  }

  if (!activeLeague) {
    return (
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <ScreenState state="empty" message="Select a league first" />
      </View>
    );
  }

  return <CaptainEngagementContent leagueId={leagueId} />;
}

function CaptainEngagementContent({ leagueId }: { leagueId: string }) {
  const insets = useSafeAreaInsets();
  const atRiskQ = useCaptainAtRisk(leagueId);
  const draftsQ = useMilestoneDrafts(leagueId);
  const editMutation = useEditMilestoneDraft(leagueId);
  const sendMutation = useSendMilestoneDraft(leagueId);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([atRiskQ.refetch(), draftsQ.refetch()]);
    setRefreshing(false);
  }, [atRiskQ, draftsQ]);

  const handleSaveDraft = (draftId: string, content: string) => {
    editMutation.mutate(
      { draftId, content },
      {
        onSuccess: () => Alert.alert('Saved', 'Draft saved.'),
        onError: () => Alert.alert('Error', 'Failed to save draft'),
      },
    );
  };

  const handleSendDraft = (draftId: string) => {
    sendMutation.mutate(draftId, {
      onSuccess: () => Alert.alert('Sent', 'Message sent!'),
      onError: () => Alert.alert('Error', 'Failed to send message'),
    });
  };

  const atRiskPlayers = atRiskQ.data ?? [];
  const drafts = draftsQ.data ?? [];

  return (
    <ScrollView
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <DarkHeaderCard
        title="Captain Engagement"
        subtitle="Review at-risk teammates and send milestone messages"
        style={{ marginTop: 12, marginBottom: 16 }}
      />

      {/* At-Risk Section */}
      <View className="mb-6">
        <View className="flex-row items-center gap-2 mb-2">
          <Feather name="alert-triangle" size={16} color={mflColors.amber} />
          <SectionLabel label="At-Risk Players" />
        </View>
        <CaptainAtRiskFeed
          players={atRiskPlayers}
          isLoading={atRiskQ.isLoading}
          error={atRiskQ.isError ? 'Failed to load at-risk players' : null}
        />
      </View>

      {/* Milestone Drafts Section */}
      <View className="mb-4">
        <View className="flex-row items-center gap-2 mb-2">
          <Feather name="message-square" size={16} color={mflColors.brand} />
          <SectionLabel label="Milestone Messages" />
          {drafts.length > 0 && (
            <View className="rounded-full px-2 py-0.5 ml-auto" style={{ backgroundColor: mflColors.inkLight }}>
              <AppText className="text-[10px] font-bold text-muted">{drafts.length}</AppText>
            </View>
          )}
        </View>

        {draftsQ.isLoading ? (
          <Card className="p-4">
            <AppText className="text-xs text-muted text-center">Loading milestone drafts...</AppText>
          </Card>
        ) : drafts.length === 0 ? (
          <Card className="p-4">
            <AppText className="text-xs text-muted text-center">No milestone drafts right now.</AppText>
          </Card>
        ) : (
          drafts.map((draft: MilestoneDraft) => (
            <MilestoneDraftCard
              key={draft.id}
              draft={draft}
              onSave={handleSaveDraft}
              onSend={handleSendDraft}
              isSaving={!!(editMutation.isPending && editMutation.variables?.draftId === draft.id)}
              isSending={!!(sendMutation.isPending && sendMutation.variables === draft.id)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}
