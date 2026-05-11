import { useMemo } from 'react';
import { View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import type { IndividualRankingDTO, TeamRankingDTO } from '../types/leaderboard.dto';
import { computeFinaleAwards } from '../utils/compute-awards';
import type { AwardCard } from '../types/awards.model';
import { RunYourOwnCTA } from '../../conversion';
import { formatNumber } from '../utils/leaderboard-format';
import { CeremonyPhotosSection } from './ceremony-photos-section';

// ─── Theme colors (mirrors web grande-finale) ───
const gf = {
  bg: '#0B1A3A',
  bgCard: '#102756',
  bgMuted: '#0D1F44',
  bgRow: '#132C61',
  textPrimary: '#F8F2D8',
  textSecondary: '#E7D7A2',
  textHeading: '#F1D675',
  textEmphasis: '#F6E27A',
  textSubtle: '#D8C996',
  avatarBg: '#1A356E',
  avatarText: '#F4E5B0',
  badgeBg: '#D4AF37',
  badgeText: '#0A1A3A',
  border20: 'rgba(212,175,55,0.2)',
  border30: 'rgba(212,175,55,0.3)',
  border60: 'rgba(212,175,55,0.6)',
} as const;

// ─── Helpers ───

function getPostLeagueDayInfo(endDate: string): { isPostLeague: boolean; day: number } {
  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) return { isPostLeague: false, day: 0 };
  const closeMoment = new Date(end);
  closeMoment.setHours(23, 59, 59, 999);
  const now = new Date();
  if (now <= closeMoment) return { isPostLeague: false, day: 0 };
  const msPerDay = 24 * 60 * 60 * 1000;
  const day = Math.floor((now.getTime() - closeMoment.getTime()) / msPerDay) + 1;
  return { isPostLeague: true, day };
}

// ─── Sub-components ───

function AwardCardItem({ card }: { card: AwardCard }) {
  return (
    <View
      className="rounded-lg p-3"
      style={{ backgroundColor: gf.bgCard, borderWidth: 1, borderColor: gf.border20 }}
    >
      <View className="flex-row items-center gap-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: gf.avatarBg }}
        >
          <AppText className="text-xs font-bold" style={{ color: gf.avatarText }}>
            {card.fallback}
          </AppText>
        </View>
        <View className="flex-1">
          <AppText className="text-sm font-semibold" style={{ color: gf.textEmphasis }}>
            {card.subtitle}
          </AppText>
          <AppText className="text-xs mt-0.5" style={{ color: gf.textSecondary }}>
            {card.recipient}
          </AppText>
        </View>
        {card.pointsLabel ? (
          <View
            className="rounded-full px-2 py-1"
            style={{ backgroundColor: gf.badgeBg }}
          >
            <AppText className="text-[10px] font-bold" style={{ color: gf.badgeText }}>
              {card.pointsLabel}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function AwardSection({
  icon,
  title,
  cards,
  emptyText,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  cards: AwardCard[];
  emptyText: string;
}) {
  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        <Feather name={icon} size={16} color={gf.textEmphasis} />
        <AppText className="text-base font-semibold" style={{ color: gf.textEmphasis }}>
          {title}
        </AppText>
      </View>
      {cards.length === 0 ? (
        <AppText className="text-xs" style={{ color: gf.textSubtle }}>
          {emptyText}
        </AppText>
      ) : (
        <View className="gap-2">
          {cards.map((card, i) => (
            <AwardCardItem key={`${card.subtitle}-${i}`} card={card} />
          ))}
        </View>
      )}
    </View>
  );
}

function TrophyLeaderboard({ teams }: { teams: TeamRankingDTO[] }) {
  if (teams.length === 0) return null;
  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        <Feather name="list" size={16} color={gf.textEmphasis} />
        <AppText className="text-base font-semibold" style={{ color: gf.textEmphasis }}>
          Trophy Leaderboard
        </AppText>
      </View>
      <View
        className="rounded-lg overflow-hidden"
        style={{ borderWidth: 1, borderColor: gf.border20 }}
      >
        {teams.map((team, i) => (
          <View
            key={team.team_id}
            className="flex-row items-center px-3 py-2.5 gap-3"
            style={{
              backgroundColor: i % 2 === 0 ? gf.bgCard : gf.bgRow,
              borderBottomWidth: i < teams.length - 1 ? 1 : 0,
              borderBottomColor: gf.border20,
            }}
          >
            <View
              className="h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: gf.badgeBg }}
            >
              <AppText className="text-xs font-bold" style={{ color: gf.badgeText }}>
                {team.rank}
              </AppText>
            </View>
            <AppText
              className="flex-1 text-sm font-medium"
              numberOfLines={1}
              style={{ color: gf.textPrimary }}
            >
              {team.team_name}
            </AppText>
            <AppText className="text-sm font-semibold" style={{ color: gf.textEmphasis }}>
              {formatNumber(team.total_points)} pts
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Main Component ───

interface GrandeFinaleCelebrationProps {
  leagueId: string;
  leagueName: string;
  leagueEndDate: string;
  teams: TeamRankingDTO[];
  individuals: IndividualRankingDTO[];
}

export function GrandeFinaleCelebration({
  leagueId,
  leagueName,
  leagueEndDate,
  teams,
  individuals,
}: GrandeFinaleCelebrationProps) {
  const { isPostLeague, day } = useMemo(
    () => getPostLeagueDayInfo(leagueEndDate),
    [leagueEndDate],
  );

  const awards = useMemo(
    () => computeFinaleAwards(teams, individuals),
    [teams, individuals],
  );

  if (!isPostLeague) return null;

  const isTrophyMode = day <= 14;
  const remainingDays = Math.max(0, 14 - day + 1);

  return (
    <View
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: gf.bg, borderWidth: 1, borderColor: gf.border30 }}
    >
      <View className="p-4 gap-5">
        {/* Header */}
        <View
          className="rounded-lg p-4"
          style={{ backgroundColor: gf.bgMuted, borderWidth: 1, borderColor: gf.border30 }}
        >
          <View className="flex-row flex-wrap gap-2">
            <View className="rounded-full px-3 py-1" style={{ backgroundColor: gf.badgeBg }}>
              <AppText className="text-xs font-bold" style={{ color: gf.badgeText }}>
                {isTrophyMode ? 'Trophy Mode' : 'Extended Archive'}
              </AppText>
            </View>
            <View
              className="rounded-full px-3 py-1"
              style={{ borderWidth: 1, borderColor: gf.border60 }}
            >
              <AppText className="text-xs font-semibold" style={{ color: gf.textEmphasis }}>
                {isTrophyMode
                  ? `${remainingDays} day${remainingDays === 1 ? '' : 's'} remaining`
                  : 'Celebration window complete'}
              </AppText>
            </View>
          </View>

          <View className="mt-3 flex-row items-start justify-between">
            <View className="flex-1">
              <AppText className="text-xl font-bold" style={{ color: gf.textEmphasis }}>
                Grande Finale
              </AppText>
              <AppText className="mt-1 text-sm" style={{ color: gf.textSecondary }}>
                {leagueName} has entered the finale experience with trophy rankings and
                award cards.
              </AppText>
            </View>
            <Feather name="award" size={28} color={gf.badgeBg} />
          </View>

          {/* Run Your Own CTA */}
          <RunYourOwnCTA leagueId={leagueId} />
        </View>

        {/* Winner Awards */}
        <AwardSection
          icon="award"
          title="Winner Awards (Top 3 Teams)"
          cards={awards.winnerAwards}
          emptyText="Winner awards will appear when rankings are available."
        />

        {/* Team Character Awards */}
        <AwardSection
          icon="star"
          title="Team Character Awards"
          cards={awards.teamCharacterAwards}
          emptyText="No remaining teams to assign team character awards yet."
        />

        {/* Leadership Awards */}
        <AwardSection
          icon="shield"
          title="Leadership Awards"
          cards={awards.leadershipAwards}
          emptyText="Leadership awards need enough individual data to compute."
        />

        {/* Individual Awards */}
        <AwardSection
          icon="user"
          title="Individual Awards"
          cards={awards.individualAwards}
          emptyText="Individual awards will appear when participants have scored entries."
        />

        {/* Trophy Leaderboard */}
        <TrophyLeaderboard teams={teams} />

        {/* Ceremony Photos */}
        <CeremonyPhotosSection leagueId={leagueId} />
      </View>
    </View>
  );
}
