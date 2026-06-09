export const ROUTES = {
  analytics: '/(app)/analytics',
  challenges: '/(app)/challenges',
  dashboard: '/(app)/(tabs)/dashboard',
  governor: '/(app)/governor',
  leagueRules: '/(app)/league-rules',
  leagueSettings: '/(app)/league-settings',
  myActivity: '/(app)/(tabs)/my-activity',
  restDayDonations: '/(app)/rest-day-donations',
  sponsors: '/(app)/sponsors',
  teamManagement: '/(app)/team-management',
} as const;

// Extend this shared route map as additional modules need typed navigation targets.
