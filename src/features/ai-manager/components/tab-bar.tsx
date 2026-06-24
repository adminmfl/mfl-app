import { View, Pressable } from 'react-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

export type AiManagerTab = 'dashboard' | 'communication' | 'challenges';

function TabButton({
  label,
  badge,
  active,
  onPress,
}: {
  label: string;
  badge: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="flex-1 flex-row items-center justify-center py-2.5"
      style={active ? { backgroundColor: mflColors.brand, borderRadius: 8 } : undefined}
      onPress={onPress}
    >
      <AppText
        className="text-xs font-semibold"
        style={{ color: active ? '#fff' : mflColors.textSub }}
      >
        {label}
      </AppText>
      {badge > 0 ? (
        <View
          className="rounded-full ml-1.5 items-center justify-center"
          style={{
            backgroundColor: active ? '#fff' : mflColors.danger,
            minWidth: 18,
            height: 18,
            paddingHorizontal: 4,
          }}
        >
          <AppText
            className="text-[10px] font-bold"
            style={{ color: active ? mflColors.brand : '#fff' }}
          >
            {badge}
          </AppText>
        </View>
      ) : null}
    </Pressable>
  );
}

interface TabBarProps {
  activeTab: AiManagerTab;
  onTabChange: (tab: AiManagerTab) => void;
  pendingCount: number;
  draftCount: number;
  challengeCount: number;
}

export function TabBar({
  activeTab,
  onTabChange,
  pendingCount,
  draftCount,
  challengeCount,
}: TabBarProps) {
  return (
    <View
      className="flex-row rounded-lg overflow-hidden mb-4"
      style={{ backgroundColor: mflColors.inkLight }}
    >
      <TabButton
        label="Dashboard"
        badge={pendingCount}
        active={activeTab === 'dashboard'}
        onPress={() => onTabChange('dashboard')}
      />
      <TabButton
        label="Communication"
        badge={draftCount}
        active={activeTab === 'communication'}
        onPress={() => onTabChange('communication')}
      />
      <TabButton
        label="Challenges"
        badge={challengeCount}
        active={activeTab === 'challenges'}
        onPress={() => onTabChange('challenges')}
      />
    </View>
  );
}
