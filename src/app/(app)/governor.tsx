import Feather from '@expo/vector-icons/Feather';
import { useCallback } from 'react';
import { View, ScrollView, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Card, Spinner } from 'heroui-native';
import { AppText } from '../../components/app-text';
import { DarkHeaderCard } from '../../components/dark-header-card';
import { ScreenState } from '../../components/screen-state';
import { SectionLabel } from '../../components/section-label';
import { mflColors } from '../../constants/colors';
import { useLeagueContext } from '../../contexts/league-context';
import { useGovernors } from '../../features/governor/hooks/use-governor-dashboard';
import { useHostDigest } from '../../features/governor/hooks/use-host-digest';
import { useLeagueReport } from '../../features/governor/hooks/use-league-report';
import type { Governor } from '../../features/governor/types/governor.model';

// ─── Governor Card ──────────────────────────────────────────────────────────

function GovernorCard({ governor }: { governor: Governor }) {
  return (
    <Card className="p-4 mb-3">
      <View className="flex-row items-center">
        <Avatar size="md" alt={governor.username}>
          <Avatar.Fallback>
            <AppText className="text-xs font-bold">
              {governor.username.substring(0, 2).toUpperCase()}
            </AppText>
          </Avatar.Fallback>
        </Avatar>
        <View className="flex-1 ml-3">
          <AppText className="text-sm font-semibold text-foreground">
            {governor.username}
          </AppText>
          <AppText className="text-xs text-muted mt-0.5">
            {governor.email}
          </AppText>
        </View>
      </View>
    </Card>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function GovernorScreen() {
  const insets = useSafeAreaInsets();
  const { activeLeague } = useLeagueContext();
  const leagueId = activeLeague?.leagueId ?? '';

  const {
    data: governors,
    isLoading,
    isError,
    refetch,
  } = useGovernors(leagueId);

  const digestMutation = useHostDigest();
  const reportMutation = useLeagueReport();

  const handleHostDigest = useCallback(() => {
    digestMutation.mutate(leagueId, {
      onSuccess: (data) => {
        Alert.alert('Host Digest', data.message);
      },
      onError: (error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to generate host digest.';
        Alert.alert('Error', message);
      },
    });
  }, [leagueId, digestMutation]);

  const handleLeagueReport = useCallback(() => {
    reportMutation.mutate(leagueId, {
      onSuccess: (data) => {
        Alert.alert('League Report', data.message);
      },
      onError: (error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to generate league report.';
        Alert.alert('Error', message);
      },
    });
  }, [leagueId, reportMutation]);

  if (!activeLeague) {
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ScreenState
          screen="governor"
          state="empty"
          message="Select a league to view the Governor Dashboard"
        />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ScreenState screen="governor" state="loading" />
      </View>
    );
  }

  if (isError) {
    return (
      <View
        className="flex-1 bg-background"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ScreenState
          screen="governor"
          state="error"
          message="Failed to load governor data"
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      <DarkHeaderCard
        title="Governor Dashboard"
        subtitle={activeLeague.name}
        style={{ marginTop: 12, marginBottom: 16 }}
      />

      {/* Quick Actions */}
      <SectionLabel label="Quick Actions" />
      <Card className="p-0 mb-4 overflow-hidden">
        <Pressable
          className="flex-row items-center px-4 py-4"
          onPress={handleHostDigest}
          disabled={digestMutation.isPending}
        >
          <View
            className="w-9 h-9 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: mflColors.brandLight }}
          >
            <Feather name="file-text" size={18} color={mflColors.brand} />
          </View>
          <AppText className="text-sm font-medium text-foreground flex-1">
            Generate Host Digest
          </AppText>
          {digestMutation.isPending ? (
            <Spinner size="sm" />
          ) : (
            <Feather name="chevron-right" size={18} color={mflColors.textMuted} />
          )}
        </Pressable>

        <View style={{ height: 1, backgroundColor: mflColors.border }} />

        <Pressable
          className="flex-row items-center px-4 py-4"
          onPress={handleLeagueReport}
          disabled={reportMutation.isPending}
        >
          <View
            className="w-9 h-9 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: mflColors.accentLight }}
          >
            <Feather name="bar-chart-2" size={18} color={mflColors.accent} />
          </View>
          <AppText className="text-sm font-medium text-foreground flex-1">
            Generate League Report
          </AppText>
          {reportMutation.isPending ? (
            <Spinner size="sm" />
          ) : (
            <Feather name="chevron-right" size={18} color={mflColors.textMuted} />
          )}
        </Pressable>
      </Card>

      {/* Governors List */}
      <SectionLabel label="Governors" style={{ marginTop: 8 }} />
      {governors && governors.length > 0 ? (
        governors.map((gov) => (
          <GovernorCard key={gov.userId} governor={gov} />
        ))
      ) : (
        <Card className="p-4 mb-4">
          <AppText className="text-sm text-muted text-center py-5">
            No governors assigned
          </AppText>
        </Card>
      )}
    </ScrollView>
  );
}
