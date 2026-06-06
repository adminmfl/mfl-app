import analytics from '@react-native-firebase/analytics';

export async function logScreenView(screenName: string, screenClass?: string): Promise<void> {
  await analytics().logScreenView({
    screen_name: screenName,
    screen_class: screenClass ?? screenName,
  });
}

export async function logEvent(name: string, params?: Record<string, any>): Promise<void> {
  await analytics().logEvent(name, params);
}

export async function setUser(userId: string): Promise<void> {
  await analytics().setUserId(userId);
}

export async function setUserProperty(name: string, value: string): Promise<void> {
  await analytics().setUserProperty(name, value);
}

export async function logUserLogin(method: string): Promise<void> {
  await analytics().logLogin({ method });
}

export async function logUserSignUp(method: string): Promise<void> {
  await analytics().logSignUp({ method });
}

export async function logSearchEvent(searchTerm: string): Promise<void> {
  await analytics().logSearch({ search_term: searchTerm });
}

export async function logShareEvent(contentType: string, itemId: string): Promise<void> {
  await analytics().logShare({ content_type: contentType, item_id: itemId, method: 'app' });
}

export async function logPurchaseEvent(value: number, currency: string): Promise<void> {
  await analytics().logPurchase({ value, currency });
}

// ─── App-specific events ───

export async function logActivitySubmitted(params: {
  league_id: string;
  activity_type: string;
  is_resubmit?: boolean;
}): Promise<void> {
  await analytics().logEvent('activity_submitted', params);
}

export async function logLeagueJoined(params: {
  league_id: string;
  league_name: string;
}): Promise<void> {
  await analytics().logEvent('league_joined', params);
}

export async function logChallengeCompleted(params: {
  challenge_id: string;
  challenge_name: string;
  league_id: string;
}): Promise<void> {
  await analytics().logEvent('challenge_completed', params);
}

export async function logLeaderboardViewed(params: {
  league_id: string;
  tab?: string;
}): Promise<void> {
  await analytics().logEvent('leaderboard_viewed', params);
}
