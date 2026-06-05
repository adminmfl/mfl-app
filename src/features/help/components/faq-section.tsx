import Feather from '@expo/vector-icons/Feather';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Accordion, Card, InputGroup } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import { FAQ_CATEGORIES, type FaqCategory } from '../data/faq-data';

function filterCategories(categories: FaqCategory[], query: string): FaqCategory[] {
  if (!query.trim()) return categories;
  const q = query.toLowerCase();
  return categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q),
      ),
    }))
    .filter((cat) => cat.items.length > 0);
}

export function FaqSection() {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => filterCategories(FAQ_CATEGORIES, search), [search]);

  return (
    <View>
      {/* Search */}
      <View className="mb-4">
        <InputGroup>
          <InputGroup.Prefix>
            <Feather name="search" size={16} color={mflColors.textMuted} />
          </InputGroup.Prefix>
          <InputGroup.Input
            placeholder="Search help articles..."
            value={search}
            onChangeText={setSearch}
          />
        </InputGroup>
      </View>

      {search.trim() !== '' && filtered.length === 0 ? (
        <Card className="p-6 items-center">
          <Feather name="alert-circle" size={40} color={mflColors.textMuted} />
          <AppText className="text-base font-semibold text-foreground mt-3">
            No results found
          </AppText>
          <AppText className="text-sm text-muted text-center mt-1">
            Try different keywords or contact our support team.
          </AppText>
        </Card>
      ) : (
        filtered.map((category) => (
          <View key={category.category} className="mb-5">
            <View className="flex-row items-center gap-2 mb-2">
              <View
                className="w-6 h-6 rounded-md items-center justify-center"
                style={{ backgroundColor: category.iconBg }}
              >
                <Feather name={category.icon} size={14} color={category.iconColor} />
              </View>
              <SectionLabel label={category.category} />
            </View>
            <Card variant="secondary">
              <Accordion selectionMode="single" isCollapsible>
                {category.items.map((item, idx) => (
                  <Accordion.Item key={idx} value={`${category.category}-${idx}`}>
                    <Accordion.Trigger className="px-4 py-3">
                      <AppText className="text-sm font-semibold text-foreground flex-1 pr-2">
                        {item.question}
                      </AppText>
                      <Accordion.Indicator />
                    </Accordion.Trigger>
                    <Accordion.Content className="px-4 pb-3">
                      <AppText className="text-sm text-muted leading-5">
                        {item.answer}
                      </AppText>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Card>
          </View>
        ))
      )}
    </View>
  );
}
