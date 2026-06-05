import Feather from '@expo/vector-icons/Feather';
import { Linking, Pressable, View } from 'react-native';
import { Card, Separator } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import { CONTACT_ITEMS } from '../data/contact-data';

export function ContactSupport() {
  return (
    <View>
      <SectionLabel label="STILL NEED HELP?" />
      <Card variant="secondary" className="p-4 mt-1">
        {CONTACT_ITEMS.map((item, idx) => (
          <View key={item.email}>
            {idx > 0 && <Separator className="my-1" />}
            <Pressable
              className="flex-row items-center justify-between py-3"
              onPress={() => Linking.openURL(`mailto:${item.email}`)}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <Feather name={item.icon} size={20} color={mflColors.accent} />
                <View className="flex-1">
                  <AppText className="text-sm font-semibold text-foreground">
                    {item.label}
                  </AppText>
                  <AppText className="text-xs text-muted mt-0.5">{item.email}</AppText>
                </View>
              </View>
              <Feather name="external-link" size={16} color={mflColors.textMuted} />
            </Pressable>
          </View>
        ))}
      </Card>
    </View>
  );
}
