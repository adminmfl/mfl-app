import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import { useDrawer } from '../../../contexts/DrawerContext';
import { useThemeColor } from 'heroui-native';
import { Platform, Pressable, View, StyleSheet } from 'react-native';
import { ThemeToggle } from '../../../components/theme-toggle';
import { useAppTheme } from '../../../contexts/app-theme-context';

export default function TabsLayout() {
  const { isDark } = useAppTheme();
  const { openDrawer } = useDrawer();
  const [foreground, background, muted, accent] = useThemeColor([
    'foreground',
    'background',
    'muted',
    'accent',
  ]);

  return (
    <Tabs
      screenOptions={{
        lazy: true,
        headerTitleAlign: 'left',
        headerLeft: () => (
          <Pressable
            onPress={openDrawer}
            style={{ marginLeft: 16, marginRight: 8 }}
          >
            <Feather name="menu" size={24} color={foreground} />
          </Pressable>
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, gap: 4 }}>
            <ThemeToggle />
          </View>
        ),
        headerTransparent: true,
        ...({ headerBlurEffect: isDark ? 'dark' : 'light' } as any),
        headerTintColor: foreground,
        headerStyle: {
          backgroundColor: Platform.select({
            ios: undefined,
            android: background,
          }),
        },
        headerTitleStyle: {
          fontFamily: 'Inter_600SemiBold',
        },
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: muted,
        tabBarStyle: {
          backgroundColor: background,
          borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-activity"
        options={{
          title: 'My Activity',
          tabBarIcon: ({ color, size }) => (
            <Feather name="activity" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-team"
        options={{
          title: 'My Team',
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="team-chat"
        options={{
          title: 'Team Chat',
          tabBarIcon: ({ color, size }) => (
            <Feather name="message-circle" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
