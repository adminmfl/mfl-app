import { Pressable, View } from 'react-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

export type DonationTab = 'request' | 'my-donations' | 'approval';

interface TabItem {
  key: DonationTab;
  label: string;
  badgeCount?: number;
}

interface Props {
  activeTab: DonationTab;
  canApprove: boolean;
  approvalCount: number;
  onChange: (tab: DonationTab) => void;
}

export function DonationTabs({
  activeTab,
  canApprove,
  approvalCount,
  onChange,
}: Props) {
  const tabs: TabItem[] = [
    { key: 'request', label: 'Donate' },
    { key: 'my-donations', label: 'Mine' },
  ];

  if (canApprove) {
    tabs.push({
      key: 'approval',
      label: 'Approvals',
      badgeCount: approvalCount,
    });
  }

  return (
    <View
      className="flex-row rounded-xl p-1"
      style={{ backgroundColor: mflColors.surface }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            className="min-h-10 flex-1 flex-row items-center justify-center gap-1.5 rounded-lg px-2"
            style={isActive ? { backgroundColor: mflColors.white } : undefined}
          >
            <AppText
              className="text-xs font-semibold"
              style={{ color: isActive ? mflColors.text : mflColors.textSub }}
            >
              {tab.label}
            </AppText>
            {tab.badgeCount ? (
              <View
                className="h-5 min-w-5 items-center justify-center rounded-full px-1"
                style={{ backgroundColor: mflColors.danger }}
              >
                <AppText className="text-[10px] font-bold text-white">
                  {tab.badgeCount}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
