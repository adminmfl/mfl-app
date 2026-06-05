import { View } from 'react-native';
import { Button } from 'heroui-native';
import LottieView from 'lottie-react-native';
import { AppText } from './app-text';

// Map screen names to their Lottie assets
const LOTTIE_ASSETS: Record<string, any> = {
  'dashboard': require('../../assets/lottie/dashboard.json'),
  'my-activity': require('../../assets/lottie/my-activity.json'),
  'activity-guide': require('../../assets/lottie/activity-guide.json'),
  'challenges': require('../../assets/lottie/challenges.json'),
  'challenge-detail': require('../../assets/lottie/challenge-detail.json'),
  'my-team': require('../../assets/lottie/my-team.json'),
  'team-chat': require('../../assets/lottie/team-chat.json'),
  'league-leaderboard': require('../../assets/lottie/league-leaderboard.json'),
  'coach': require('../../assets/lottie/coach.json'),
  'governor': require('../../assets/lottie/governor.json'),
  'profile': require('../../assets/lottie/profile.json'),
  'submissions': require('../../assets/lottie/submissions.json'),
  'payments': require('../../assets/lottie/payments.json'),
  'notifications': require('../../assets/lottie/notifications.json'),
  'settings': require('../../assets/lottie/settings.json'),
  'rest-days': require('../../assets/lottie/rest-days.json'),
  'validation': require('../../assets/lottie/validation.json'),
  'communities': require('../../assets/lottie/communities.json'),
};

interface ScreenStateProps {
  screen?: string;
  state: 'loading' | 'empty' | 'error';
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const DEFAULT_MESSAGES: Record<string, string> = {
  loading: 'Loading...',
  empty: 'Nothing here yet',
  error: 'Something went wrong',
};

export function ScreenState({ screen, state, message, actionLabel, onAction }: ScreenStateProps) {
  const lottieSource = screen ? LOTTIE_ASSETS[screen] : undefined;

  return (
    <View className="flex-1 justify-center items-center p-8">
      {lottieSource ? (
        <LottieView
          source={lottieSource}
          autoPlay
          loop={state === 'loading'}
          style={{ width: 120, height: 120 }}
        />
      ) : (
        <View className="w-20 h-20 rounded-full bg-default items-center justify-center mb-4">
          <AppText className="text-3xl text-muted">{state === 'error' ? '!' : state === 'loading' ? '...' : '-'}</AppText>
        </View>
      )}
      <AppText className="text-sm text-muted text-center mt-4">
        {message || DEFAULT_MESSAGES[state]}
      </AppText>
      {actionLabel && onAction && (
        <Button
          variant={state === 'error' ? 'secondary' : 'primary'}
          size="md"
          onPress={onAction}
          className="mt-4"
        >
          <Button.Label>{actionLabel}</Button.Label>
        </Button>
      )}
    </View>
  );
}
