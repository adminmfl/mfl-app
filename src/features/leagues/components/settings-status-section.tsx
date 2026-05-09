import Feather from '@expo/vector-icons/Feather';
import { View, Pressable } from 'react-native';
import { Button, Card, Chip, Spinner } from 'heroui-native';
import { useRouter } from 'expo-router';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';

interface Props {
  status: string;
  phase: string;
  inviteCode: string | null;
  leagueId: string;
  isDraft: boolean;
  isLaunching: boolean;
  isDeleting: boolean;
  onLaunch: () => void;
  onDelete: () => void;
}

const PHASE_LABELS: Record<string, string> = {
  mobilisation: 'Mobilisation',
  launch_meet: 'Launch Meet',
  league_active: 'League Active',
  challenges_live: 'Challenges Live',
  league_closure: 'League Closure',
  grand_finale: 'Grand Finale',
  post_league_archive: 'Post-League Archive',
};

export function SettingsStatusSection({
  status,
  phase,
  inviteCode,
  isDraft,
  isLaunching,
  isDeleting,
  onLaunch,
  onDelete,
}: Props) {
  const router = useRouter();

  return (
    <>
      {/* League Status */}
      <View className="gap-3">
        <SectionLabel label="LEAGUE STATUS" />
        <Card className="p-4">
          <View className="flex-row items-center justify-between">
            <AppText className="text-sm font-medium text-foreground">Current Status</AppText>
            <Chip
              size="sm"
              variant="soft"
              style={{
                backgroundColor: isDraft ? mflColors.amberLight : mflColors.brandLight,
              }}
            >
              <Chip.Label
                style={{
                  color: isDraft ? mflColors.amber : mflColors.brand,
                  textTransform: 'capitalize',
                }}
              >
                {status}
              </Chip.Label>
            </Chip>
          </View>

          {phase && (
            <View className="flex-row items-center justify-between mt-2">
              <AppText className="text-sm font-medium text-foreground">Phase</AppText>
              <AppText className="text-sm text-muted">
                {PHASE_LABELS[phase] ?? phase}
              </AppText>
            </View>
          )}

          {inviteCode && (
            <View className="flex-row items-center justify-between mt-2">
              <AppText className="text-sm font-medium text-foreground">Invite Code</AppText>
              <View className="flex-row items-center gap-2 bg-default-100 rounded-lg px-3 py-1.5">
                <AppText className="text-sm font-mono font-bold" style={{ color: mflColors.brand }}>
                  {inviteCode}
                </AppText>
              </View>
            </View>
          )}

          {isDraft && (
            <View className="mt-4">
              <Button
                variant="primary"
                size="lg"
                onPress={onLaunch}
                isDisabled={isLaunching}
                className="w-full"
                style={{ backgroundColor: mflColors.brand }}
              >
                {isLaunching ? <Spinner size="sm" /> : <Button.Label>Launch League</Button.Label>}
              </Button>
            </View>
          )}
        </Card>
      </View>

      {/* Quick Actions */}
      <View className="gap-3">
        <SectionLabel label="MANAGE" />
        <Card className="p-4">
          <Pressable
            className="flex-row items-center justify-between py-3"
            onPress={() => router.push('/(app)/team-management' as any)}
          >
            <View className="flex-row items-center gap-3">
              <Feather name="users" size={18} color={mflColors.brand} />
              <AppText className="text-sm font-medium text-foreground">Team Management</AppText>
            </View>
            <Feather name="chevron-right" size={18} color={mflColors.textMuted} />
          </Pressable>
          <View style={{ height: 1, backgroundColor: mflColors.border }} />
          <Pressable
            className="flex-row items-center justify-between py-3"
            onPress={() => router.push('/(app)/custom-activities' as any)}
          >
            <View className="flex-row items-center gap-3">
              <Feather name="activity" size={18} color={mflColors.brand} />
              <AppText className="text-sm font-medium text-foreground">Configure Activities</AppText>
            </View>
            <Feather name="chevron-right" size={18} color={mflColors.textMuted} />
          </Pressable>
        </Card>
      </View>

      {/* Danger Zone */}
      <View className="gap-3">
        <SectionLabel label="DANGER ZONE" />
        <Card
          className="p-4"
          style={{ borderWidth: 1, borderColor: mflColors.danger }}
        >
          <AppText className="text-sm text-muted mb-3">
            Deleting a league is permanent and cannot be undone.
          </AppText>
          <Button
            variant="secondary"
            size="lg"
            onPress={onDelete}
            isDisabled={isDeleting}
            className="w-full"
            style={{ borderColor: mflColors.danger }}
          >
            {isDeleting ? (
              <Spinner size="sm" />
            ) : (
              <Button.Label style={{ color: mflColors.danger }}>Delete League</Button.Label>
            )}
          </Button>
        </Card>
      </View>
    </>
  );
}
