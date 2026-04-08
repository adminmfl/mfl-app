import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { Redirect, Stack, useRouter } from 'expo-router';
import { useThemeColor } from 'heroui-native';
import { Alert, ActivityIndicator, Platform, Pressable, View } from 'react-native';
import { Drawer as DrawerLayout } from 'react-native-drawer-layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import { withUniwind } from 'uniwind';
import { AppText } from '../../components/app-text';
import { useAuth } from '../../contexts/AuthContext';
import { useAppTheme } from '../../contexts/app-theme-context';
import { DrawerContext } from '../../contexts/DrawerContext';

const StyledFeather = withUniwind(Feather);

function DrawerContent({ closeDrawer }: { closeDrawer: () => void }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
    );
  };

  const primaryItems = [
    { label: 'Dashboard', icon: 'home' as const, route: '(tabs)/dashboard' },
    { label: 'Profile', icon: 'user' as const, route: 'profile' },
    { label: 'Log Activity', icon: 'plus-circle' as const, route: 'log-activity' },
    { label: 'Challenges', icon: 'target' as const, route: 'challenges' },
  ];

  const secondaryItems = [
    { label: 'Settings', icon: 'settings' as const, route: 'settings' },
    { label: 'Help', icon: 'help-circle' as const, route: 'help' },
  ];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* User Header */}
      <View className="p-5 border-b border-separator">
        <View className="h-12 w-12 rounded-full bg-accent items-center justify-center mb-3 overflow-hidden">
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              style={{ width: 48, height: 48 }}
              contentFit="cover"
            />
          ) : (
            <AppText className="text-lg font-bold text-white">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AppText>
          )}
        </View>
        <AppText className="text-base font-semibold text-foreground">
          {user?.firstName} {user?.lastName}
        </AppText>
        <AppText className="text-sm text-muted">
          {user?.email || user?.phone}
        </AppText>
      </View>

      {/* Nav Items */}
      <View className="flex-1 py-2">
        {primaryItems.map((item) => (
          <Pressable
            key={item.route}
            onPress={() => {
              closeDrawer();
              if (item.route.startsWith('(tabs)')) {
                router.navigate(`/(app)/${item.route}` as any);
              } else {
                router.push(`/(app)/${item.route}` as any);
              }
            }}
            className="flex-row items-center gap-3 px-5 py-3.5"
          >
            <StyledFeather name={item.icon} size={20} className="text-foreground flex-shrink-0" />
            <AppText className="text-sm font-medium text-foreground flex-1" numberOfLines={1}>
              {item.label}
            </AppText>
          </Pressable>
        ))}

        <View className="h-px bg-separator mx-5 my-2" />

        {secondaryItems.map((item) => (
          <Pressable
            key={item.route}
            onPress={() => {
              closeDrawer();
              if (item.route.startsWith('(tabs)')) {
                router.navigate(`/(app)/${item.route}` as any);
              } else {
                router.push(`/(app)/${item.route}` as any);
              }
            }}
            className="flex-row items-center gap-3 px-5 py-3.5"
          >
            <StyledFeather name={item.icon} size={20} className="text-muted flex-shrink-0" />
            <AppText className="text-sm font-medium text-muted flex-1" numberOfLines={1}>
              {item.label}
            </AppText>
          </Pressable>
        ))}
      </View>

      {/* Logout */}
      <View className="border-t border-separator p-5" style={{ paddingBottom: insets.bottom + 16 }}>
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center gap-3"
        >
          <StyledFeather name="log-out" size={20} className="text-danger flex-shrink-0" />
          <AppText className="text-sm font-medium text-danger flex-1" numberOfLines={1}>
            Log Out
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark } = useAppTheme();
  const [foreground, background] = useThemeColor([
    'foreground',
    'background',
  ]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const drawerContext = useMemo(
    () => ({
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    [],
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <DrawerContext.Provider value={drawerContext}>
      <DrawerLayout
        open={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
        drawerType="front"
        drawerStyle={{
          backgroundColor: background,
          width: 280,
        }}
        overlayStyle={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        renderDrawerContent={() => (
          <DrawerContent closeDrawer={() => setDrawerOpen(false)} />
        )}
      >
        <Stack
          screenOptions={{
            headerTintColor: foreground,
            headerTransparent: true,
            ...({ headerBlurEffect: isDark ? 'dark' : 'light' } as any),
            headerStyle: {
              backgroundColor: Platform.select({
                ios: undefined,
                android: background,
              }),
            },
            headerTitleStyle: {
              fontFamily: 'Inter_600SemiBold',
            },
            headerBackButtonDisplayMode: 'minimal',
            contentStyle: {
              backgroundColor: background,
            },
          }}
        >
          {/* Tabs — uses its own header with hamburger */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Inner screens */}
          <Stack.Screen name="profile" options={{ title: 'Profile' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
          <Stack.Screen name="help" options={{ title: 'Help & Support' }} />
          <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
        </Stack>
      </DrawerLayout>
    </DrawerContext.Provider>
  );
}
