import { View } from 'react-native';
import { Avatar, Card, Chip, Separator } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import type { TeamMember } from '../types/team.model';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function capitalizeName(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

interface TeamViewRosterProps {
  members: TeamMember[];
  showRR: boolean;
  showRestDays: boolean;
}

export function TeamViewRoster({
  members,
  showRR,
  showRestDays,
}: TeamViewRosterProps) {
  return (
    <View className="gap-2">
      <SectionLabel label={`Team Members (${members.length})`} />

      <Card className="p-4">
        {members.length > 0 ? (
          members.map((member, index) => (
            <View key={member.leagueMemberId}>
              {index > 0 && <Separator className="my-0" />}
              <View className="flex-row items-center py-3 gap-3">
                {/* Rank */}
                <AppText className="text-xs text-muted w-5 text-center">
                  {index + 1}
                </AppText>

                {/* Avatar with captain badge */}
                <View>
                  <Avatar size="md" alt={member.username}>
                    {member.profilePictureUrl ? (
                      <Avatar.Image
                        source={{ uri: member.profilePictureUrl }}
                      />
                    ) : null}
                    <Avatar.Fallback>
                      <AppText
                        className="text-xs font-semibold"
                        style={{ color: mflColors.brand }}
                      >
                        {getInitials(member.username)}
                      </AppText>
                    </Avatar.Fallback>
                  </Avatar>
                  {member.isCaptain && (
                    <View
                      className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full items-center justify-center"
                      style={{ backgroundColor: mflColors.amber }}
                    >
                      <Feather name="award" size={10} color={mflColors.white} />
                    </View>
                  )}
                </View>

                {/* Name + role chip */}
                <View className="flex-1 gap-0.5">
                  <AppText
                    className="text-sm font-semibold text-foreground"
                    numberOfLines={1}
                  >
                    {capitalizeName(member.username)}
                  </AppText>
                  {member.isCaptain ? (
                    <Chip size="sm" variant="soft">
                      <Chip.Label>Captain</Chip.Label>
                    </Chip>
                  ) : (
                    <AppText className="text-[10px] text-muted">Player</AppText>
                  )}
                </View>

                {/* Stats */}
                <View className="items-end gap-0.5">
                  <AppText
                    className="text-sm font-bold"
                    style={{ color: mflColors.brand }}
                  >
                    {member.points}
                  </AppText>
                  {showRR && (
                    <View className="flex-row items-center gap-0.5">
                      <Feather name="star" size={10} color={mflColors.amber} />
                      <AppText className="text-[10px] text-muted">
                        {member.avgRr.toFixed(2)}
                      </AppText>
                    </View>
                  )}
                  {showRestDays && (
                    <AppText className="text-[10px] text-muted">
                      Rest: {member.restDaysUsed}
                    </AppText>
                  )}
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className="py-6 items-center">
            <AppText className="text-sm text-muted">
              No members in this team yet.
            </AppText>
          </View>
        )}
      </Card>
    </View>
  );
}
