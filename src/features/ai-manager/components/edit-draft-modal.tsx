import { useState, useEffect } from 'react';
import { View, TextInput, Modal, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Spinner } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { Draft } from '../types/ai-manager.model';

interface EditDraftModalProps {
  draft: Draft | null;
  isSaving: boolean;
  onSave: (content: string) => void;
  onClose: () => void;
}

export function EditDraftModal({ draft, isSaving, onSave, onClose }: EditDraftModalProps) {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (draft) setContent(draft.content);
  }, [draft]);

  return (
    <Modal visible={!!draft} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <Pressable className="flex-1" onPress={onClose} />
        <View
          className="rounded-t-2xl p-5"
          style={{ backgroundColor: mflColors.card, maxHeight: '80%' }}
        >
          <AppText className="text-lg font-bold text-foreground mb-1">Edit Draft</AppText>
          <AppText className="text-xs text-muted mb-4">
            Edit the message before sending. The AI generated this — make it yours.
          </AppText>

          <TextInput
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className="rounded-lg p-3 text-sm text-foreground mb-4"
            style={{
              backgroundColor: mflColors.surface,
              borderWidth: 1,
              borderColor: mflColors.border,
              minHeight: 120,
              color: mflColors.text,
            }}
          />

          <View className="flex-row justify-end" style={{ gap: 10 }}>
            <Pressable
              className="rounded-lg px-4 py-2.5"
              style={{ backgroundColor: mflColors.inkLight }}
              onPress={onClose}
            >
              <AppText className="text-sm font-medium" style={{ color: mflColors.textSub }}>
                Cancel
              </AppText>
            </Pressable>
            <Pressable
              className="flex-row items-center rounded-lg px-4 py-2.5"
              style={{ backgroundColor: mflColors.brand }}
              onPress={() => onSave(content)}
              disabled={isSaving}
            >
              {isSaving ? (
                <Spinner size="sm" style={{ marginRight: 4 }} />
              ) : (
                <Feather name="check" size={14} color="#fff" style={{ marginRight: 4 }} />
              )}
              <AppText className="text-sm font-semibold" style={{ color: '#fff' }}>
                Save
              </AppText>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
