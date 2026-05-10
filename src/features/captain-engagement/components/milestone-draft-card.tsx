import { useState } from 'react';
import { View, TextInput, Alert } from 'react-native';
import { Card, Spinner, Button } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { MilestoneDraft } from '../types/captain-engagement.model';

interface MilestoneDraftCardProps {
  draft: MilestoneDraft;
  onSave: (draftId: string, content: string) => void;
  onSend: (draftId: string) => void;
  isSaving: boolean;
  isSending: boolean;
}

export function MilestoneDraftCard({
  draft,
  onSave,
  onSend,
  isSaving,
  isSending,
}: MilestoneDraftCardProps) {
  const [content, setContent] = useState(draft.content);
  const isModified = content !== draft.content;

  return (
    <Card className="p-4 mb-3">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <AppText className="text-sm font-semibold text-foreground">
          {draft.targetUsername}
        </AppText>
        <AppText className="text-[10px] text-muted capitalize">
          {(draft.milestoneType ?? draft.type ?? 'milestone').replace(/_/g, ' ')}
        </AppText>
      </View>

      {/* Editable content */}
      <TextInput
        className="bg-background rounded-lg p-3 text-sm text-foreground mb-3"
        style={{
          minHeight: 80,
          textAlignVertical: 'top',
          borderWidth: 1,
          borderColor: mflColors.border,
        }}
        multiline
        value={content}
        onChangeText={setContent}
        placeholder="Edit the draft message..."
        placeholderTextColor={mflColors.textMuted}
      />

      {/* Action buttons */}
      <View className="flex-row gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onPress={() => onSave(draft.id, content)}
          isDisabled={isSaving || isSending || !isModified}
        >
          {isSaving ? <Spinner size="sm" /> : <Button.Label>Save Draft</Button.Label>}
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          onPress={() => {
            Alert.alert(
              'Send Message',
              `Send this message to ${draft.targetUsername}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Send', onPress: () => onSend(draft.id) },
              ],
            );
          }}
          isDisabled={isSending}
          style={{ backgroundColor: mflColors.brand }}
        >
          {isSending ? <Spinner size="sm" /> : <Button.Label style={{ color: '#fff' }}>Send Message</Button.Label>}
        </Button>
      </View>
    </Card>
  );
}
