import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from 'heroui-native';
import { withUniwind } from 'uniwind';
import { AppText } from '../../../components/app-text';
import type { FaqItem } from '../types/settings.types';

const StyledFeather = withUniwind(Feather);

interface FaqSectionProps {
  items: FaqItem[];
  delay?: number;
}

export function FaqSection({ items, delay = 400 }: FaqSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <Animated.View entering={FadeInDown.duration(300).delay(delay)}>
      <Card className="shadow-none border border-separator">
        <View className="gap-1">
          <View className="flex-row items-center gap-2 mb-3">
            <StyledFeather name="help-circle" size={18} className="text-accent" />
            <AppText className="text-base font-semibold text-foreground">
              Frequently Asked Questions
            </AppText>
          </View>
          {items.map((faq, i) => (
            <Pressable
              key={i}
              onPress={() => setExpandedIndex(expandedIndex === i ? null : i)}
              className="border-t border-separator pt-3"
            >
              <View className="flex-row items-center justify-between">
                <AppText className="text-sm font-medium text-foreground flex-1">
                  {faq.q}
                </AppText>
                <StyledFeather
                  name={expandedIndex === i ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  className="text-muted"
                />
              </View>
              {expandedIndex === i && (
                <AppText className="text-sm text-muted mt-2 leading-relaxed">
                  {faq.a}
                </AppText>
              )}
            </Pressable>
          ))}
        </View>
      </Card>
    </Animated.View>
  );
}
