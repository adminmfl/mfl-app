import { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable } from 'react-native';
import { Spinner } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../components/app-text';
import { DarkHeaderCard } from '../../components/dark-header-card';
import { ScreenState } from '../../components/screen-state';
import { mflColors } from '../../constants/colors';
import { useLeagueContext } from '../../contexts/league-context';
import { useRole } from '../../contexts/role-context';

import { useDigest } from '../../features/ai-manager/hooks/use-digest';
import { useDrafts } from '../../features/ai-manager/hooks/use-drafts';
import { useInterventions } from '../../features/ai-manager/hooks/use-interventions';
import {
  useRunScan,
  useMarkDigestRead,
  useDismissDigest,
  useSendDraft,
  useScheduleDraft,
  useCancelDraft,
  useDismissDraft,
  useDeleteDraft,
  useEditDraft,
  useDismissIntervention,
  useGenerateDraftFromIntervention,
} from '../../features/ai-manager/hooks/use-ai-manager-actions';

import { DashboardSection } from '../../features/ai-manager/components/dashboard-section';
import { CommunicationSection } from '../../features/ai-manager/components/communication-section';

// ─── Tab Switcher ────────────────────────────────────────────────────────────

type Tab = 'dashboard' | 'communication';

function TabBar({
  activeTab,
  onTabChange,
  pendingCount,
  draftCount,
}: {
  activeTab: Tab;
  onTabChange: (t: Tab) => void;
  pendingCount: number;
  draftCount: number;
}) {
  return (
    <View className="flex-row rounded-lg overflow-hidden mb-4" style={{ backgroundColor: mflColors.inkLight }}>
      <TabButton
        label="Dashboard"
        badge={pendingCount}
        active={activeTab === 'dashboard'}
        onPress={() => onTabChange('dashboard')}
      />
      <TabButton
        label="Communication"
        badge={draftCount}
        active={activeTab === 'communication'}
        onPress={() => onTabChange('communication')}
      />
    </View>
  );
}

function TabButton({
  label,
  badge,
  active,
  onPress,
}: {
  label: string;
  badge: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="flex-1 flex-row items-center justify-center py-2.5"
      style={active ? { backgroundColor: mflColors.brand, borderRadius: 8 } : undefined}
      onPress={onPress}
    >
      <AppText
        className="text-xs font-semibold"
        style={{ color: active ? '#fff' : mflColors.textSub }}
      >
        {label}
      </AppText>
      {badge > 0 && (
        <View
          className="rounded-full ml-1.5 items-center justify-center"
          style={{
            backgroundColor: active ? '#fff' : mflColors.danger,
            minWidth: 18,
            height: 18,
            paddingHorizontal: 4,
          }}
        >
          <AppText
            className="text-[10px] font-bold"
            style={{ color: active ? mflColors.brand : '#fff' }}
          >
            {badge}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function AiManagerScreen() {
  const insets = useSafeAreaInsets();
  const { activeLeague } = useLeagueContext();
  const { isHost, isGovernor } = useRole();
  const leagueId = activeLeague?.leagueId ?? '';

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // ── RBAC guard ──
  if (!isHost && !isGovernor) {
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ScreenState
          screen="ai-manager"
          state="empty"
          message="AI Manager is only available to hosts and governors."
        />
      </View>
    );
  }

  if (!activeLeague) {
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ScreenState
          screen="ai-manager"
          state="empty"
          message="Select a league to view AI Manager"
        />
      </View>
    );
  }

  return <AiManagerContent leagueId={leagueId} activeTab={activeTab} setActiveTab={setActiveTab} />;
}

function AiManagerContent({
  leagueId,
  activeTab,
  setActiveTab,
}: {
  leagueId: string;
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
}) {
  const insets = useSafeAreaInsets();

  // ── Queries ──
  const digestQ = useDigest(leagueId);
  const draftsQ = useDrafts(leagueId);
  const interventionsQ = useInterventions(leagueId);

  const digestItems = digestQ.data ?? [];
  const drafts = draftsQ.data ?? [];
  const interventions = interventionsQ.data ?? [];

  const isLoading = digestQ.isLoading || draftsQ.isLoading || interventionsQ.isLoading;

  // ── Mutations ──
  const scanMutation = useRunScan(leagueId);
  const markReadMutation = useMarkDigestRead(leagueId);
  const dismissDigestMutation = useDismissDigest(leagueId);
  const sendDraftMutation = useSendDraft(leagueId);
  const scheduleDraftMutation = useScheduleDraft(leagueId);
  const cancelDraftMutation = useCancelDraft(leagueId);
  const dismissDraftMutation = useDismissDraft(leagueId);
  const deleteDraftMutation = useDeleteDraft(leagueId);
  const editDraftMutation = useEditDraft(leagueId);
  const dismissIntMutation = useDismissIntervention(leagueId);
  const generateDraftMutation = useGenerateDraftFromIntervention(leagueId);

  // ── 30s polling for scheduled drafts ──
  useEffect(() => {
    const hasScheduled = drafts.some((d) => d.status === 'scheduled');
    if (!hasScheduled) return;
    const interval = setInterval(() => draftsQ.refetch(), 30000);
    return () => clearInterval(interval);
  }, [drafts, draftsQ]);

  // ── Pull-to-refresh ──
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([digestQ.refetch(), draftsQ.refetch(), interventionsQ.refetch()]);
    setRefreshing(false);
  }, [digestQ, draftsQ, interventionsQ]);

  // ── Action handlers ──
  const handleRunScan = () => {
    scanMutation.mutate(undefined, {
      onSuccess: (data) => {
        Alert.alert(
          'Scan Complete',
          `${data.digestCount} digest items, ${data.interventionCount} alerts`,
        );
      },
      onError: (err: any) => {
        Alert.alert('Scan Failed', err?.response?.data?.error || err?.message || 'Failed to run scan');
      },
    });
  };

  const handleSendDraft = (draftId: string) => {
    sendDraftMutation.mutate(draftId, {
      onSuccess: () => Alert.alert('Sent', 'Message sent!'),
      onError: () => Alert.alert('Error', 'Failed to send'),
    });
  };

  const handleScheduleDraft = (draftId: string) => {
    scheduleDraftMutation.mutate(draftId, {
      onSuccess: () =>
        Alert.alert('Scheduled', 'Will auto-send in 10 minutes unless cancelled.'),
      onError: () => Alert.alert('Error', 'Failed to schedule'),
    });
  };

  const handleCancelDraft = (draftId: string) => {
    cancelDraftMutation.mutate(draftId, {
      onSuccess: () => Alert.alert('Cancelled', 'Scheduled send cancelled.'),
      onError: () => Alert.alert('Error', 'Failed to cancel'),
    });
  };

  const handleGenerateDraft = (interventionId: string) => {
    generateDraftMutation.mutate(interventionId, {
      onSuccess: () => {
        Alert.alert('Draft Generated', 'Check the Communication tab.');
        setActiveTab('communication');
      },
      onError: () => Alert.alert('Error', 'Failed to generate draft'),
    });
  };

  const handleEditDraft = (draftId: string, content: string) => {
    editDraftMutation.mutate(
      { draftId, content },
      {
        onError: () => Alert.alert('Error', 'Failed to update draft'),
      },
    );
  };

  // ── Counts ──
  const pendingAlerts = interventions.filter((i) => i.status === 'pending').length;
  const unreadDigest = digestItems.filter((d) => d.status === 'unread').length;
  const activeDrafts = drafts.filter(
    (d) => d.status === 'pending' || d.status === 'edited' || d.status === 'scheduled',
  ).length;

  if (isLoading) {
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ScreenState screen="ai-manager" state="loading" />
      </View>
    );
  }

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
        title="AI League Manager"
        subtitle="Dashboard & Communications"
        style={{ marginTop: 12, marginBottom: 16 }}
      />

      {/* Run Scan Button */}
      <Pressable
        className="flex-row items-center justify-center rounded-lg py-3 mb-4"
        style={{ backgroundColor: mflColors.inkLight }}
        onPress={handleRunScan}
        disabled={scanMutation.isPending}
      >
        {scanMutation.isPending ? (
          <Spinner size="sm" style={{ marginRight: 6 }} />
        ) : (
          <Feather name="refresh-cw" size={16} color={mflColors.textSub} style={{ marginRight: 6 }} />
        )}
        <AppText className="text-sm font-semibold" style={{ color: mflColors.textSub }}>
          {scanMutation.isPending ? 'Scanning...' : 'Run Scan Now'}
        </AppText>
      </Pressable>

      {/* Tabs */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingAlerts + unreadDigest}
        draftCount={activeDrafts}
      />

      {/* Tab Content */}
      {activeTab === 'dashboard' ? (
        <DashboardSection
          digestItems={digestItems}
          interventions={interventions}
          generatingIntId={generateDraftMutation.isPending ? (generateDraftMutation.variables ?? null) : null}
          onMarkDigestRead={(ids) => markReadMutation.mutate(ids)}
          onDismissDigest={(ids) => dismissDigestMutation.mutate(ids)}
          onGenerateDraft={handleGenerateDraft}
          onDismissIntervention={(ids) => dismissIntMutation.mutate(ids)}
        />
      ) : (
        <CommunicationSection
          drafts={drafts}
          sendingDraftId={sendDraftMutation.isPending ? (sendDraftMutation.variables ?? null) : null}
          schedulingDraftId={scheduleDraftMutation.isPending ? (scheduleDraftMutation.variables ?? null) : null}
          editSaving={editDraftMutation.isPending}
          onSendDraft={handleSendDraft}
          onScheduleDraft={handleScheduleDraft}
          onCancelDraft={handleCancelDraft}
          onDismissDraft={(id) => dismissDraftMutation.mutate(id)}
          onDeleteDraft={(id) => deleteDraftMutation.mutate(id)}
          onEditDraft={handleEditDraft}
        />
      )}
    </ScrollView>
  );
}
