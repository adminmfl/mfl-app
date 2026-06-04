import { Redirect } from 'expo-router';
import { useAuth } from '../core/auth';
import { ActivityIndicator, View } from 'react-native';
import { mflColors } from '../constants/colors';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: mflColors.surface }}>
        <ActivityIndicator size="large" color={mflColors.brand} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}
