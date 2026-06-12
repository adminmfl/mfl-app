import { Share } from 'react-native';
import { Button, Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { TeamManagementPanel } from './team-management-panel';
import type { ManagedTeam } from '../types/team-management';

interface InvitePanelProps {
  leagueName: string;
  team: ManagedTeam | null;
  inviteCode: string;
  memberCount: number;
  maxCapacity: number;
  onClose: () => void;
}

export function InvitePanel({
  leagueName,
  team,
  inviteCode,
  memberCount,
  maxCapacity,
  onClose,
}: InvitePanelProps) {
  const invitePath = team ? `/invite/team/${inviteCode}` : `/invite/${inviteCode}`;
  const label = team ? `Join ${team.team_name}` : `Join ${leagueName}`;
  const shareText = team
    ? `Join my team "${team.team_name}" in ${leagueName} on MyFitnessLeague. Use code: ${inviteCode}`
    : `Join ${leagueName} on MyFitnessLeague. Use code: ${inviteCode}`;

  return (
    <TeamManagementPanel
      title={team ? 'Invite to Team' : 'League Invite'}
      subtitle={`${memberCount} / ${maxCapacity} members`}
      onClose={onClose}
    >
      <Card className="p-4 gap-2">
        <AppText className="text-xs text-muted">Invite Code</AppText>
        <AppText className="text-2xl font-bold text-foreground text-center tracking-widest">
          {inviteCode || 'No code'}
        </AppText>
      </Card>
      <AppText className="text-xs text-muted">Path: {invitePath}</AppText>
      <Button
        variant="primary"
        size="lg"
        onPress={() =>
          Share.share({
            title: label,
            message: `${shareText}\n${invitePath}`,
          })
        }
        isDisabled={!inviteCode}
      >
        <Button.Label>Share Invite</Button.Label>
      </Button>
    </TeamManagementPanel>
  );
}
