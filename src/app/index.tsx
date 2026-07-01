import { Redirect } from 'expo-router';
import { useMemo } from 'react';
import { useAuth } from '../core/auth';
import { ActivityIndicator, View } from 'react-native';
import { mflColors } from '../constants/colors';
import { AppRoutes } from '../core/config/routes';
import { useUserProfile } from '../features/profile/hooks/use-user-profile';

function hasCompleteProfile(profile: { username?: string | null; dateOfBirth?: string | null; gender?: string | null } | null | undefined): boolean {
  return !!profile?.username?.trim() && !!profile?.dateOfBirth?.trim() && !!profile?.gender?.trim();
}

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const profileQuery = useUserProfile(isAuthenticated);

  const showLoading = useMemo(() => {
    if (isLoading) return true;
    if (!isAuthenticated) return false;
    return profileQuery.isLoading || profileQuery.isFetching;
  }, [isAuthenticated, isLoading, profileQuery.isFetching, profileQuery.isLoading]);

  if (showLoading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: mflColors.surface }}>
        <ActivityIndicator size="large" color={mflColors.brand} />
      </View>
    );
  }

  if (isAuthenticated) {
    if (profileQuery.data && !hasCompleteProfile(profileQuery.data)) {
      return <Redirect href={AppRoutes.completeProfile} />;
    }

    return <Redirect href={AppRoutes.dashboard} />;
  }

  return <Redirect href={AppRoutes.login} />;
}
