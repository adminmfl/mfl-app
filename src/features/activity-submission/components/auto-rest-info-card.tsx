import { Pressable, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

interface AutoRestInfoCardProps {
  /** Whether to show the full dismissible card (first-time view). */
  showCard: boolean;
  onDismiss: () => void;
}

const INFO_TEXT =
  "If you're traveling and receive an automatic rest day, you can still submit your activity — the rest day will be replaced automatically.";

/**
 * Renders a dismissible one-time info card explaining auto-rest-day overwrite behavior.
 * The ℹ️ icon is always visible even after dismissal so users can re-read.
 */
export function AutoRestInfoCard({ showCard, onDismiss }: AutoRestInfoCardProps) {
  if (!showCard) return null;

  return (
    <View
      className="rounded-xl p-3 gap-2"
      style={{
        backgroundColor: mflColors.blueLight,
        borderWidth: 1,
        borderColor: mflColors.blue + '30',
      }}
    >
      <View className="flex-row items-start gap-2">
        <Feather name="info" size={16} color={mflColors.blue} style={{ marginTop: 1 }} />
        <AppText className="flex-1 text-xs" style={{ color: mflColors.blue }}>
          {INFO_TEXT}
        </AppText>
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Feather name="x" size={16} color={mflColors.blue} />
        </Pressable>
      </View>
    </View>
  );
}

/**
 * Standalone ℹ️ icon that always renders — tapping it re-opens the info card.
 * Place this next to the "Rest Day" tab label.
 */
export function AutoRestInfoIcon({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={10} className="ml-1">
      <Feather name="info" size={13} color={mflColors.textMuted} />
    </Pressable>
  );
}
