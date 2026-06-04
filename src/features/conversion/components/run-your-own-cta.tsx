import { useEffect, useRef } from 'react';
import { Alert, Pressable, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { useConversionCandidate } from '../hooks/use-conversion-candidate';
import { useTrackConversion } from '../hooks/use-track-conversion';

interface RunYourOwnCTAProps {
  leagueId: string;
}

export function RunYourOwnCTA({ leagueId }: RunYourOwnCTAProps) {
  const router = useRouter();
  const { data: candidate, isLoading } = useConversionCandidate(leagueId);
  const trackMutation = useTrackConversion();
  const impressionTracked = useRef(false);

  useEffect(() => {
    if (candidate && !impressionTracked.current) {
      impressionTracked.current = true;
      trackMutation.mutate({ stage: 'shown', sourceLeagueId: leagueId });
    }
  }, [candidate, leagueId]);

  if (isLoading || !candidate) return null;

  const handleStart = () => {
    trackMutation.mutate(
      { stage: 'clicked', sourceLeagueId: leagueId },
      {
        onSuccess: () => {
          router.push({
            pathname: '/create-league',
            params: { source_league_id: leagueId },
          });
        },
        onError: () => {
          Alert.alert('Error', 'Failed to start. Please try again.');
        },
      },
    );
  };

  return (
    <View
      className="mt-4 rounded-xl p-4"
      style={{
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(212,175,55,0.25)',
      }}
    >
      <View className="flex-row items-center gap-2">
        <Feather name="zap" size={18} color="#F6E27A" />
        <AppText className="text-base font-semibold" style={{ color: '#F6E27A' }}>
          Loved this league? Run your own.
        </AppText>
      </View>
      <AppText className="mt-2 text-sm" style={{ color: '#D8C996' }}>
        We can pre-fill settings from this league to help you get started quickly.
      </AppText>
      <Pressable
        onPress={handleStart}
        disabled={trackMutation.isPending}
        className="mt-3 flex-row items-center justify-center gap-2 rounded-lg py-2.5 px-4"
        style={{
          backgroundColor: mflColors.brand,
          opacity: trackMutation.isPending ? 0.6 : 1,
        }}
      >
        <Feather name="play-circle" size={16} color="#FFFFFF" />
        <AppText className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
          {trackMutation.isPending ? 'Starting...' : 'Run Your Own'}
        </AppText>
      </Pressable>
    </View>
  );
}
