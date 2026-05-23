import Feather from '@expo/vector-icons/Feather';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, Share, View } from 'react-native';
import { Button } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import {
  TEMPLATES,
  addDaysToDate,
  formatDate,
  type WizardData,
  type WizardResult,
} from './quick-start.types';

interface Props {
  data: WizardData;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  result: WizardResult | null;
}

export function StepReviewLaunch({ data, onBack, onSubmit, loading, result }: Props) {
  const template = TEMPLATES.find((t) => t.id === data.template);

  const effectiveName = useMemo(() => {
    if (data.leagueName.trim()) return data.leagueName.trim();
    const typeLabel =
      data.leagueType === 'corporate'
        ? 'Corporate'
        : data.leagueType === 'residential'
          ? 'Residential'
          : 'Custom';
    return `${typeLabel} ${data.duration}-Day League`;
  }, [data.leagueName, data.leagueType, data.duration]);

  const endDate = useMemo(() => {
    if (data.startDate.length !== 10) return '';
    return addDaysToDate(data.startDate, data.duration);
  }, [data.startDate, data.duration]);

  const handleShare = async (text: string) => {
    try {
      await Share.share({ message: text });
    } catch {
      // cancelled
    }
  };

  // ── Success state ──
  if (result) {
    return (
      <View className="gap-5">
        <View className="items-center gap-2 py-4">
          <View
            className="w-16 h-16 rounded-full items-center justify-center"
            style={{ backgroundColor: mflColors.brandLight }}
          >
            <Feather name="check" size={32} color={mflColors.brand} />
          </View>
          <AppText className="text-2xl font-bold text-foreground">League Created!</AppText>
          <AppText className="text-sm text-muted text-center">
            {result.league_name} is ready. Share the captain invite links below.
          </AppText>
        </View>

        {/* League invite code */}
        <View
          className="p-4 rounded-xl gap-2"
          style={{ backgroundColor: mflColors.white, borderWidth: 1, borderColor: mflColors.border }}
        >
          <AppText className="text-sm font-bold text-foreground">League Invite Code</AppText>
          <AppText className="text-xs text-muted">
            Share this code to let players join the league.
          </AppText>
          <View className="flex-row items-center gap-2 mt-1">
            <View
              className="flex-1 items-center py-2 rounded-lg"
              style={{ backgroundColor: mflColors.inkLight }}
            >
              <AppText className="text-lg font-bold tracking-widest" style={{ color: mflColors.brand }}>
                {result.invite_code}
              </AppText>
            </View>
            <Pressable
              onPress={() => handleShare(`Join my league! Use invite code: ${result.invite_code}`)}
              className="w-10 h-10 rounded-lg items-center justify-center"
              style={{ borderWidth: 1, borderColor: mflColors.border }}
            >
              <Feather name="share" size={16} color={mflColors.textMuted} />
            </Pressable>
          </View>
        </View>

        {/* Team invite links */}
        {result.team_invites.length > 0 && (
          <View
            className="p-4 rounded-xl gap-2"
            style={{ backgroundColor: mflColors.white, borderWidth: 1, borderColor: mflColors.border }}
          >
            <AppText className="text-sm font-bold text-foreground">Captain Invite Links</AppText>
            <AppText className="text-xs text-muted">
              Send each link to the respective team captain.
            </AppText>
            <View className="gap-2 mt-1">
              {result.team_invites.map((ti) => (
                <View
                  key={ti.invite_code}
                  className="flex-row items-center justify-between p-2.5 rounded-lg"
                  style={{ backgroundColor: mflColors.inkLight }}
                >
                  <View className="flex-1 mr-2">
                    <AppText className="text-sm font-medium text-foreground">
                      {ti.team_name}
                    </AppText>
                    <AppText className="text-xs text-muted" numberOfLines={1}>
                      {ti.invite_code}
                    </AppText>
                  </View>
                  <Pressable
                    onPress={() =>
                      handleShare(
                        `Join ${ti.team_name}! Use team invite code: ${ti.invite_code}`,
                      )
                    }
                    hitSlop={8}
                  >
                    <Feather name="share" size={14} color={mflColors.brand} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Summary stats */}
        <View className="flex-row gap-2">
          <SuccessStat value={String(result.teams_created)} label="Teams" />
          <SuccessStat value={String(result.activities_added)} label="Activities" />
          <SuccessStat value={String(result.challenges_added)} label="Challenges" />
          <SuccessStat value={String(data.duration)} label="Days" />
        </View>
      </View>
    );
  }

  // ── Review state ──
  const typeLabel =
    data.leagueType === 'corporate'
      ? 'Corporate'
      : data.leagueType === 'residential'
        ? 'Residential'
        : 'Custom';

  return (
    <View className="gap-5">
      <View>
        <AppText className="text-lg font-bold text-foreground">Review & Launch</AppText>
        <AppText className="text-sm text-muted">
          Confirm your league details and create.
        </AppText>
      </View>

      <View
        className="p-4 rounded-xl gap-3"
        style={{ backgroundColor: mflColors.white, borderWidth: 1, borderColor: mflColors.border }}
      >
        {/* League name & subtitle */}
        <View className="flex-row items-center gap-2">
          <Feather name="zap" size={18} color={mflColors.brand} />
          <AppText className="text-base font-bold text-foreground flex-1" numberOfLines={2}>
            {effectiveName}
          </AppText>
        </View>
        <AppText className="text-xs text-muted">
          {template ? template.title : `${data.duration}-Day League`} · {typeLabel}
          {data.cloneFromLeagueId ? ' · Cloned' : ''}
        </AppText>

        {/* Stats grid */}
        <View className="flex-row flex-wrap gap-2 mt-1">
          <StatChip icon="calendar" label="Duration" value={`${data.duration} days`} />
          <StatChip icon="users" label="Players" value={String(data.playerCount)} />
          <StatChip icon="users" label="Teams" value={String(data.numTeams)} />
          <StatChip icon="activity" label="Activities" value={String(data.activities.length)} />
          <StatChip icon="coffee" label="Rest Days" value={`${data.restDays}/wk`} />
          <StatChip
            icon={data.leagueType === 'corporate' ? 'briefcase' : data.leagueType === 'residential' ? 'home' : 'star'}
            label="Type"
            value={typeLabel}
          />
        </View>

        {/* Date range + config */}
        <View className="rounded-lg p-3 gap-1 mt-1" style={{ backgroundColor: mflColors.inkLight }}>
          <DetailRow label="Starts" value={formatDate(data.startDate)} />
          <DetailRow label="Ends" value={endDate ? formatDate(endDate) : '...'} />
          <DetailRow label="Scoring" value={data.scoringFormula.replace('_', ' ')} />
          <DetailRow label="Photo Proof" value={data.proofRequirement} />
          <DetailRow label="Mode" value={data.leagueMode.replace('_', ' ')} />
          <DetailRow label="Visibility" value={data.isPublic ? 'Public' : 'Invite Only'} />
        </View>

        {/* Activity chips */}
        <View className="flex-row flex-wrap gap-1.5 mt-1">
          {data.activities.map((activity) => (
            <View
              key={activity}
              className="px-2 py-0.5 rounded-full"
              style={{ backgroundColor: mflColors.brandLight }}
            >
              <AppText className="text-[11px] font-medium" style={{ color: mflColors.brand }}>
                {activity}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      {/* Navigation */}
      <View className="flex-row gap-3">
        <Button variant="secondary" size="lg" onPress={onBack} isDisabled={loading} className="flex-1">
          <Button.Label>Back</Button.Label>
        </Button>
        <Button
          variant="primary"
          size="lg"
          onPress={onSubmit}
          isDisabled={loading}
          className="flex-1"
          style={{ backgroundColor: mflColors.brand }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={mflColors.white} />
          ) : (
            <Button.Label>Create League</Button.Label>
          )}
        </Button>
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <AppText className="text-sm text-muted">{label}</AppText>
      <AppText className="text-sm font-medium text-foreground capitalize">{value}</AppText>
    </View>
  );
}

function StatChip({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View
      className="flex-row items-center gap-2 p-2 rounded-lg"
      style={{ backgroundColor: mflColors.inkLight, minWidth: '45%', flexGrow: 1 }}
    >
      <Feather name={icon} size={14} color={mflColors.brand} />
      <View className="flex-1">
        <AppText className="text-[10px] text-muted">{label}</AppText>
        <AppText className="text-sm font-semibold text-foreground">{value}</AppText>
      </View>
    </View>
  );
}

function SuccessStat({ value, label }: { value: string; label: string }) {
  return (
    <View
      className="flex-1 items-center p-3 rounded-xl"
      style={{ backgroundColor: mflColors.brandLight }}
    >
      <AppText className="text-xl font-bold" style={{ color: mflColors.brand }}>
        {value}
      </AppText>
      <AppText className="text-xs text-muted">{label}</AppText>
    </View>
  );
}
