import { Stack } from 'expo-router';
import { mflColors } from '../../constants/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: mflColors.surface },
      }}
    />
  );
}
