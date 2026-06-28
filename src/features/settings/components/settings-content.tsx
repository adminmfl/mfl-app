import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Pressable, Switch } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Separator } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import { useAuth } from '../../../core/auth';
import { AppRoutes } from '../../../core/config/routes';
import { SettingsMenuItem } from './settings-menu-item';

export function SettingsContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={mflColors.text} />
        </Pressable>
        <AppText className="text-lg font-bold text-foreground">Settings</AppText>
        <View style={{ width: 24 }} />
      </View>

      <View className="flex-1 px-4 pt-4">
        {/* Preferences */}
        <SectionLabel label="PREFERENCES" />
        <Card variant="secondary" className="p-4">
          <SettingsMenuItem
            icon="bell"
            label="Notifications"
            trailing={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: mflColors.border, true: mflColors.brand }}
                thumbColor={mflColors.white}
              />
            }
          />
        </Card>

        {/* Info */}
        <SectionLabel label="INFO" style={{ marginTop: 20 }} />
        <Card variant="secondary" className="p-4">
          <SettingsMenuItem
            icon="shield"
            label="Privacy Policy"
            onPress={() => router.push(AppRoutes.privacyPolicy)}
          />
          <Separator />
          <SettingsMenuItem
            icon="help-circle"
            label="Help & Support"
            onPress={() => router.push(AppRoutes.help)}
          />
          <Separator />
          <SettingsMenuItem
            icon="book-open"
            label="MFL Rules"
            onPress={() => router.push(AppRoutes.mflRules)}
          />
          <Separator />
          <SettingsMenuItem
            icon="info"
            label="About"
            trailing={
              <AppText className="text-sm text-muted">v3.0.0</AppText>
            }
          />
        </Card>

        {/* Account */}
        <SectionLabel label="ACCOUNT" style={{ marginTop: 20 }} />
        <Button
          variant="secondary"
          size="lg"
          onPress={logout}
          className="w-full"
        >
          <Button.Label>Log Out</Button.Label>
        </Button>
      </View>
    </View>
  );
}
