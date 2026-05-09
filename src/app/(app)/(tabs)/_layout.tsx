import Feather from '@expo/vector-icons/Feather';
import { Tabs, useRouter } from 'expo-router';
import { Platform, Pressable, View } from 'react-native';
import { useDrawer } from '../../../contexts/drawer-context';
import { useRole } from '../../../contexts/role-context';
import { mflColors } from '../../../constants/colors';

export default function TabsLayout() {
  const router = useRouter();
  const { openDrawer } = useDrawer();
  const { activeRole } = useRole();

  const roleColor =
    activeRole === 'host' ? '#D97706' :
    activeRole === 'governor' ? '#2563EB' :
    activeRole === 'captain' || activeRole === 'vice_captain' ? '#059669' :
    mflColors.textMuted;

  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: 'left',
        headerLeft: () => (
          <Pressable
            onPress={openDrawer}
            style={{ marginLeft: 16, marginRight: 8 }}
          >
            <Feather name="menu" size={24} color={mflColors.text} />
          </Pressable>
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, gap: 8 }}>
            {activeRole && activeRole !== 'player' && (
              <View style={{
                backgroundColor: roleColor + '20',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 12,
              }}>
                <Feather name={activeRole === 'host' ? 'award' : activeRole === 'governor' ? 'shield' : 'users'} size={14} color={roleColor} />
              </View>
            )}
            <Pressable
              onPress={() => router.push('/(app)/notifications')}
              hitSlop={8}
              style={{ padding: 6 }}
            >
              <Feather name="bell" size={22} color={mflColors.text} />
            </Pressable>
          </View>
        ),
        headerTransparent: true,
        headerStyle: {
          backgroundColor: Platform.select({
            ios: undefined,
            android: mflColors.surface,
          }),
        },
        headerTitleStyle: {
          fontFamily: 'Inter_600SemiBold',
          color: mflColors.text,
        },
        tabBarActiveTintColor: mflColors.brand,
        tabBarInactiveTintColor: mflColors.textMuted,
        tabBarStyle: {
          backgroundColor: mflColors.surface,
          borderTopColor: mflColors.border,
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
          title: 'My Fitness League',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-activity"
        options={{
          title: 'My Activity',
          href: null,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color, size }) => <Feather name="bar-chart-2" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-team"
        options={{
          title: 'My Team',
          tabBarIcon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'AI Coach',
          tabBarIcon: ({ color, size }) => <Feather name="cpu" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="team-chat"
        options={{
          title: 'Team Chat',
          href: null,
        }}
      />
    </Tabs>
  );
}
