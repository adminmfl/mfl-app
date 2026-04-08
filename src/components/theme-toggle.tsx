import { Ionicons } from '@expo/vector-icons';

import AntDesign from '@expo/vector-icons/AntDesign';
import * as Haptics from 'expo-haptics';
import { type FC, useRef } from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import { withUniwind } from 'uniwind';
import { useAppTheme } from '../contexts/app-theme-context';

const StyledIonicons = withUniwind(Ionicons);
const StyledAntDesign = withUniwind(AntDesign);

export const ThemeToggle: FC = () => {
  const { toggleTheme, isLight } = useAppTheme();
  const pendingRef = useRef(false);

  return (
    <TouchableOpacity
      onPress={() => {
        if (pendingRef.current) return;
        pendingRef.current = true;

        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        // Defer theme change off the current frame to avoid UI freeze
        setTimeout(() => {
          toggleTheme();
          pendingRef.current = false;
        }, 100);
      }}
      className="p-3 z-50"
      hitSlop={12}
      activeOpacity={0.8}
    >
      {isLight ? (
        <StyledAntDesign name="moon" size={20} className="text-foreground" />
      ) : (
        <StyledIonicons name="sunny" size={20} className="text-foreground" />
      )}
    </TouchableOpacity>
  );
};
