import { useMemo } from 'react';
import { View } from 'react-native';
import { Avatar, Card, Chip } from 'heroui-native';
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

/** Top-3 left-border colors matching web's gold/silver/bronze */
const RANK_BORDER_COLORS = ['#F59E0B', '#94A3B8', '#B45309'] as const;

interface TeamViewRosterProps {
  members: TeamMember[];
  showRR: boolean;
  showRestDays: boolean;
  isCaptain?: boolean;
}

export function TeamViewRoster({
  members,
  showRR,
  showRestDays,
  isCaptain = false,
}: TeamViewRosterProps) {
  const highestPoints = useMemo(
    () => Math.max(...members.map((m) => m.points || 0), 1),
    [members],
  );

  return (
    <View className="gap-2">
      <SectionLabel label={`Team Members (${members.length})`} />

      {members.length > 0 ? (
        members.map((member, index) => {
          const isAtRisk = member.points === 0;
          const progressPct =
            highestPoints > 0 ? (member.points / highestPoints) * 100 : 0;
          const rankBorderColor =
            index < 3 ? RANK_BORDER_COLORS[index] : undefined;

          return (
            <Card
              key={member.leagueMemberId}
              className="p-4"
              style={
                rankBorderColor
                  ? { borderLeftWidth: 3, borderLeftColor: rankBorderColor }
                  : undefined
              }
            >
              {/* Top: avatar + name + stats */}
              <View className="flex-row items-start gap-3">
                {/* Avatar with captain badge */}
                <View>
                  <Avatar
                    size="md"
                    alt={member.username}
                    style={
                      member.isCaptain
                        ? { borderWidth: 2, borderColor: mflColors.amber }
                        : isAtRisk
                          ? { borderWidth: 2, borderColor: mflColors.danger }
                          : undefined
                    }
                  >
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

                {/* Name + role + at-risk chip */}
                <View className="flex-1 gap-1">
                  <View className="flex-row items-center gap-2 flex-wrap">
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
                      <AppText className="text-[10px] text-muted">
                        Player
                      </AppText>
                    )}
                  </View>
                  {isAtRisk && isCaptain && (
                    <View
                      className="flex-row items-center gap-1 self-start rounded-full px-2 py-0.5"
                      style={{ backgroundColor: mflColors.dangerLight }}
                    >
                      <Feather
                        name="alert-triangle"
                        size={10}
                        color={mflColors.danger}
                      />
                      <AppText
                        className="text-[10px] font-semibold"
                        style={{ color: mflColors.danger }}
                      >
                        At risk
                      </AppText>
                    </View>
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

              {/* Contribution bar */}
              <View className="mt-3">
                <AppText
                  className="text-[9px] uppercase mb-1"
                  style={{
                    color: mflColors.textMuted,
                    letterSpacing: 0.8,
                  }}
                >
                  CONTRIBUTION
                </AppText>
                {progressPct > 0 ? (
                  <View
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: mflColors.inkLight }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: mflColors.brand,
                      }}
                    />
                  </View>
                ) : (
                  <AppText className="text-[10px] text-muted">
                    No activity yet
                  </AppText>
                )}
              </View>
            </Card>
          );
        })
      ) : (
        <Card className="p-4">
          <View className="py-6 items-center">
            <AppText className="text-sm text-muted">
              No members in this team yet.
            </AppText>
          </View>
        </Card>
      )}
    </View>
  );
}
