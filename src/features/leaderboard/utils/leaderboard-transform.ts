import type {
  LeaderboardDataDTO,
  TeamMetadataDTO,
  TeamsMetadataResponseDTO,
} from '../types/leaderboard.dto';

function assignRankTiers<T extends { rank: number }>(
  items: T[],
  league: LeaderboardDataDTO['league'],
): T[] {
  if (!league.tiered_rank_enabled || items.length === 0) return items;

  const config = league.tiered_rank_config || {
    top_percent: 20,
    middle_percent: 50,
    bottom_percent: 30,
  };

  const total = items.length;
  if (total < 3) {
    return items.map((item) => ({ ...item, rank_tier: 'top' as const }));
  }

  const topCutoff = Math.max(1, Math.ceil(total * (config.top_percent / 100)));
  const middleCutoff = Math.ceil(
    total * ((config.top_percent + config.middle_percent) / 100),
  );

  const middleNudges = [
    "You're in the middle of the pack, keep pushing!",
    'A few more points to break into the top tier!',
    'Consistency is key, keep it up!',
  ];
  const bottomNudges = [
    "Every step counts. You've got this!",
    "Don't give up! Keep building those habits.",
    'Your fitness journey is a marathon, not a sprint.',
  ];

  return items.map((item, index) => {
    if (index < topCutoff) return { ...item, rank_tier: 'top' as const };
    if (index < middleCutoff) {
      const bandPct = Math.ceil(((index + 1) / total) * 10) * 10;
      return {
        ...item,
        rank_tier: 'middle' as const,
        rank_band: `Top ${bandPct}%`,
        motivational_nudge: middleNudges[index % middleNudges.length],
      };
    }
    return {
      ...item,
      rank_tier: 'bottom' as const,
      motivational_nudge: bottomNudges[index % bottomNudges.length],
    };
  });
}

function attachTeamLogos(
  data: LeaderboardDataDTO,
  teams: TeamMetadataDTO[],
): LeaderboardDataDTO {
  const logoByTeamId = new Map(
    teams.map((team) => [team.team_id, team.logo_url ?? null]),
  );

  return {
    ...data,
    teams: data.teams.map((team) => ({
      ...team,
      logo_url: logoByTeamId.get(team.team_id) ?? null,
    })),
    pendingWindow: data.pendingWindow
      ? {
          ...data.pendingWindow,
          teams: data.pendingWindow.teams.map((team) => ({
            ...team,
            logo_url: logoByTeamId.get(team.team_id) ?? null,
          })),
        }
      : undefined,
  };
}

function applyTeamSizeNormalization(
  data: LeaderboardDataDTO,
  teamsResponse?: TeamsMetadataResponseDTO,
): LeaderboardDataDTO {
  const league = teamsResponse?.data?.league;
  const variance = teamsResponse?.data?.teamSizeVariance;
  const normalizeActive = Boolean(league?.normalize_points_by_team_size);

  if (
    !normalizeActive ||
    !variance?.hasVariance ||
    variance.maxSize <= 0 ||
    data.teams.length === 0
  ) {
    return {
      ...data,
      normalization: {
        active: false,
        hasVariance: Boolean(variance?.hasVariance),
        avgSize: Number(variance?.avgSize ?? 0),
        minSize: Number(variance?.minSize ?? 0),
        maxSize: Number(variance?.maxSize ?? 0),
      },
    };
  }

  const memberCountByTeam = new Map(
    (teamsResponse?.data?.teams ?? []).map((team) => [
      team.team_id,
      Number(team.member_count ?? 0),
    ]),
  );

  const normalizedTeams = data.teams
    .map((team) => {
      const memberCount = Math.max(1, team.member_count);
      const normalizedBase = Math.round(
        team.points * (variance.maxSize / memberCount),
      );
      const normalizedIndividualChallenge = Math.round(
        (team.individual_challenge_points || 0) *
          (variance.maxSize / memberCount),
      );
      const fixedTeamPoints = team.fixed_team_points || 0;
      return {
        ...team,
        normalized_points: normalizedBase,
        total_points:
          normalizedBase + normalizedIndividualChallenge + fixedTeamPoints,
      };
    })
    .sort((a, b) =>
      b.total_points !== a.total_points
        ? b.total_points - a.total_points
        : b.avg_rr - a.avg_rr,
    )
    .map((team, index) => ({ ...team, rank: index + 1 }));

  let pendingWindow = data.pendingWindow;
  if (pendingWindow?.dates?.length) {
    const latestDate = [...pendingWindow.dates].sort((a, b) =>
      a.localeCompare(b),
    )[pendingWindow.dates.length - 1];

    if (latestDate) {
      pendingWindow = {
        ...pendingWindow,
        teams: pendingWindow.teams
          .map((team) => {
            const memberCount = Math.max(
              1,
              memberCountByTeam.get(team.team_id) ?? 0,
            );
            const pointsByDate: Record<string, number> = {};
            Object.entries(team.pointsByDate || {}).forEach(([date, points]) => {
              pointsByDate[date] = Math.round(
                Number(points || 0) * (variance.maxSize / memberCount),
              );
            });
            return { ...team, pointsByDate };
          })
          .sort(
            (a, b) =>
              (b.pointsByDate?.[latestDate] ?? 0) -
              (a.pointsByDate?.[latestDate] ?? 0),
          )
          .map((team, index) => ({ ...team, rank: index + 1 })),
      };
    }
  }

  return {
    ...data,
    teams: normalizedTeams,
    pendingWindow,
    normalization: {
      active: true,
      hasVariance: true,
      avgSize: variance.avgSize,
      minSize: variance.minSize,
      maxSize: variance.maxSize,
    },
  };
}

export function buildLeaderboardViewData(
  leaderboard: LeaderboardDataDTO,
  teamsMetadata?: TeamsMetadataResponseDTO,
): LeaderboardDataDTO {
  const withLogos = attachTeamLogos(
    leaderboard,
    teamsMetadata?.data?.teams ?? [],
  );
  const normalized = applyTeamSizeNormalization(withLogos, teamsMetadata);

  return {
    ...normalized,
    teams: assignRankTiers(normalized.teams, normalized.league),
    individuals: assignRankTiers(normalized.individuals, normalized.league),
  };
}
