import { View } from 'react-native';
import { Card } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import type { TeamMember } from '../types/team.model';

function capitalizeName(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/** Top-3 rank colors matching web's gold/silver/bronze */
const RANK_COLORS = ['#F59E0B', '#94A3B8', '#B45309'] as const;

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
}: TeamViewRosterProps) {
  return (
    <View className="gap-2">
      <SectionLabel label={`Team Members (${members.length})`} />

      {members.length > 0 ? (
        <Card className="p-0 overflow-hidden">
          {/* Table Header */}
          <View
            className="flex-row items-center px-4 py-2.5"
            style={{ backgroundColor: mflColors.surface }}
          >
            <AppText className="flex-1 text-[11px] font-semibold uppercase text-muted tracking-wider">
              Player
            </AppText>
            {showRR && (
              <AppText
                className="text-[11px] font-semibold uppercase text-muted tracking-wider text-right"
                style={{ width: 56 }}
              >
                RR
              </AppText>
            )}
            <AppText
              className="text-[11px] font-semibold uppercase text-muted tracking-wider text-right"
              style={{ width: 64 }}
            >
              Pts
            </AppText>
            {showRestDays && (
              <AppText
                className="text-[11px] font-semibold uppercase text-muted tracking-wider text-right"
                style={{ width: 48 }}
              >
                Rest
              </AppText>
            )}
          </View>

          {/* Table Rows */}
          {members.map((member, index) => {
            const rankColor = index < 3 ? RANK_COLORS[index] : undefined;

            return (
              <View
                key={member.leagueMemberId}
                className="flex-row items-center px-4 py-3"
                style={{
                  borderTopWidth: 1,
                  borderTopColor: mflColors.border,
                  ...(rankColor
                    ? { borderLeftWidth: 3, borderLeftColor: rankColor }
                    : {}),
                }}
              >
                {/* Player Name */}
                <View className="flex-1 flex-row items-center gap-2">
                  <AppText className="text-xs text-muted" style={{ width: 20 }}>
                    {index + 1}
                  </AppText>
                  <AppText
                    className="text-sm text-foreground flex-1"
                    numberOfLines={1}
                    style={member.isCaptain ? { fontWeight: '700' } : undefined}
                  >
                    {capitalizeName(member.username)}
                  </AppText>
                  {member.isCaptain && (
                    <Feather name="award" size={12} color={mflColors.amber} />
                  )}
                  {member.points === 0 && (
                    <Feather name="alert-triangle" size={12} color={mflColors.danger} />
                  )}
                </View>

                {/* RR */}
                {showRR && (
                  <AppText
                    className="text-sm text-right"
                    style={{ width: 56, color: mflColors.textSub }}
                  >
                    {member.avgRr.toFixed(2)}
                  </AppText>
                )}

                {/* Points */}
                <AppText
                  className="text-sm font-semibold text-right"
                  style={{ width: 64, color: mflColors.brand }}
                >
                  {member.points}
                </AppText>

                {/* Rest Days */}
                {showRestDays && (
                  <AppText
                    className="text-sm text-right"
                    style={{ width: 48, color: mflColors.textSub }}
                  >
                    {member.restDaysUsed}
                  </AppText>
                )}
              </View>
            );
          })}
        </Card>
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
