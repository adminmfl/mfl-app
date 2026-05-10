import { View, Pressable } from 'react-native';
import { Chip } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { SuggestedQuestion } from '../types/ai-coach.model';

interface SuggestedQuestionsProps {
  questions: SuggestedQuestion[];
  onSelect: (text: string) => void;
  disabled?: boolean;
}

export function SuggestedQuestions({ questions, onSelect, disabled }: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <View className="px-4 pb-2">
      <AppText className="text-xs font-medium text-muted mb-1.5">Suggested Questions</AppText>
      <View className="flex-row flex-wrap gap-1.5">
        {questions.map((q, i) => (
          <Pressable
            key={i}
            onPress={() => onSelect(q.text)}
            disabled={disabled}
            style={{ opacity: disabled ? 0.5 : 1 }}
          >
            <Chip size="sm" variant="soft" style={{ backgroundColor: mflColors.accentLight }}>
              <Chip.Label style={{ color: mflColors.accent }} className="text-xs">
                {q.text}
              </Chip.Label>
            </Chip>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
