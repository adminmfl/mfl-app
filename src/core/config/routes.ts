export const AppRoutes = {
  // Auth
  login: '/(auth)/login',
  signup: '/(auth)/signup',
  passwordSetup: '/(auth)/password-setup',
  resetPassword: '/(auth)/reset-password',
  forgotPassword: '/(auth)/forgot-password',

  // App / Tabs
  dashboard: '/(app)/(tabs)/dashboard',
  leaderboard: '/(app)/(tabs)/leaderboard',
  myActivity: '/(app)/(tabs)/my-activity',
  myTeam: '/(app)/(tabs)/my-team',
  teamChat: '/(app)/(tabs)/team-chat',

  // App (non-tab)
  completeProfile: '/(app)/complete-profile',
  profile: '/(app)/profile',
  editProfile: '/(app)/edit-profile',
  notifications: '/(app)/notifications',
  settings: '/(app)/settings',
  help: '/(app)/help',
  privacyPolicy: '/(app)/privacy-policy',
  mflRules: '/(app)/mfl-rules',
  wearables: '/(app)/wearables',
  partnerActivity: '/(app)/partner-activity',

  // Leagues / Challenges / Submissions
  leagues: '/(app)/leagues',
  leagueOverview: '/(app)/league-overview',
  joinLeague: '/(app)/join-league',
  createLeague: '/(app)/create-league',
  quickStartLeague: '/(app)/quick-start-league',
  challenges: '/(app)/challenges',
  challengeDetail: '/(app)/challenges/[challengeId]', // use with params
  challengeSubmit: '/(app)/challenge-submit',
  submissionDetail: '/(app)/submission-detail',
  reuploadSubmission: '/(app)/reupload-submission',
  submissionValidation: '/(app)/submission-validation',

  // League tools
  leagueSettings: '/(app)/league-settings',
  leagueRules: '/(app)/league-rules',
  governor: '/(app)/governor',
  teamManagement: '/(app)/team-management',
  teamActivities: '/(app)/team-activities',
  customActivities: '/(app)/custom-activities',
  sponsors: '/(app)/sponsors',
  restDayDonations: '/(app)/rest-day-donations',
  analytics: '/(app)/analytics',
  communities: '/(app)/communities',
  captainEngagement: '/(app)/captain-engagement',
  engagementDashboard: '/(app)/engagement-dashboard',

  // Activity / submission flows
  logActivity: '/(app)/log-activity',
  manualEntry: '/(app)/manual-entry',

  // AI & advanced
  aiCoach: '/(app)/ai-coach',
  aiManager: '/(app)/ai-manager',
  aiUsage: '/(app)/ai-usage',

  // Payments / misc
  paymentCheckout: '/(app)/payment-checkout',
  hostSupport: '/(app)/host-support',
} as const;

export type AppRoute = (typeof AppRoutes)[keyof typeof AppRoutes];
