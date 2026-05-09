import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Spinner } from 'heroui-native';
import { AppText } from '../../components/app-text';
import { ScreenScrollView } from '../../components/screen-scroll-view';
import { DarkHeaderCard } from '../../components/dark-header-card';
import { mflColors } from '../../constants/colors';
import { useJoinLeague } from '../../features/leagues/hooks/use-join-league';

export default function JoinLeagueScreen() {
  const router = useRouter();
  const joinMutation = useJoinLeague();

  const [code, setCode] = useState('');
  const [successInfo, setSuccessInfo] = useState<{
    leagueId: string;
    leagueName: string;
    alreadyMember: boolean;
  } | null>(null);

  const canSubmit = code.trim().length > 0 && !joinMutation.isPending;

  const handleJoin = () => {
    if (!canSubmit) return;
    setSuccessInfo(null);
    joinMutation.mutate(code.trim().toUpperCase(), {
      onSuccess: (result) => {
        setSuccessInfo({
          leagueId: result.leagueId,
          leagueName: result.leagueName,
          alreadyMember: result.alreadyMember,
        });
        // Navigate to dashboard after a short delay so the user sees the success message
        setTimeout(() => {
          router.replace('/(app)/(tabs)/dashboard');
        }, 1500);
      },
    });
  };

  return (
    <ScreenScrollView avoidKeyboard>
      {/* Header bar */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={mflColors.text} />
        </Pressable>
        <AppText className="text-lg font-bold text-foreground">Join League</AppText>
        <View style={{ width: 24 }} />
      </View>

      <View className="gap-6">
        {/* Hero card */}
        <DarkHeaderCard
          title="Join a League"
          subtitle="Enter the invite code shared by your league host to join."
        />

        {/* Code input */}
        <View className="gap-2">
          <AppText className="text-sm font-medium text-muted">Invite Code</AppText>
          <TextInput
            style={{
              backgroundColor: mflColors.white,
              borderWidth: 1,
              borderColor: mflColors.border,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 16,
              fontSize: 24,
              color: mflColors.text,
              textAlign: 'center',
              letterSpacing: 6,
              fontWeight: '700',
            }}
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            placeholder="XXXXXX"
            placeholderTextColor={mflColors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={20}
            returnKeyType="done"
            onSubmitEditing={handleJoin}
          />
        </View>

        {/* Error feedback */}
        {joinMutation.isError && (
          <View className="bg-danger-50 p-3 rounded-lg">
            <AppText className="text-sm" style={{ color: mflColors.danger }}>
              {(joinMutation.error as any)?.response?.data?.error ||
                'Invalid invite code. Please check and try again.'}
            </AppText>
          </View>
        )}

        {/* Success feedback */}
        {successInfo && (
          <Card className="p-4" style={{ backgroundColor: mflColors.brandLight }}>
            <View className="flex-row items-center gap-2">
              <Feather name="check-circle" size={20} color={mflColors.brand} />
              <AppText className="text-sm font-semibold" style={{ color: mflColors.brand }}>
                {successInfo.alreadyMember
                  ? `You're already a member of ${successInfo.leagueName}!`
                  : `Successfully joined ${successInfo.leagueName}!`}
              </AppText>
            </View>
          </Card>
        )}

        {/* Join button */}
        <Button
          variant="primary"
          size="lg"
          onPress={handleJoin}
          isDisabled={!canSubmit}
          className="w-full"
        >
          {joinMutation.isPending ? (
            <Spinner size="sm" />
          ) : (
            <Button.Label>Join</Button.Label>
          )}
        </Button>
      </View>
    </ScreenScrollView>
  );
}
