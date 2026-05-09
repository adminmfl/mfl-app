import Feather from '@expo/vector-icons/Feather';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from 'heroui-native';
import { withUniwind } from 'uniwind';
import { AppText } from '../../../components/app-text';

const StyledFeather = withUniwind(Feather);

interface PolicySectionProps {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  delay?: number;
  children: React.ReactNode;
}

export function PolicySection({ icon, title, delay = 0, children }: PolicySectionProps) {
  return (
    <Animated.View entering={FadeInDown.duration(300).delay(delay)}>
      <Card className="shadow-none border border-separator">
        <View className="gap-3">
          <View className="flex-row items-center gap-2">
            <StyledFeather name={icon} size={18} className="text-accent" />
            <AppText className="text-base font-semibold text-foreground">{title}</AppText>
          </View>
          {children}
        </View>
      </Card>
    </Animated.View>
  );
}
