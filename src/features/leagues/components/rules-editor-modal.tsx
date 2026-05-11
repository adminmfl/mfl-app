import Feather from '@expo/vector-icons/Feather';
import { Alert, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Button, Spinner } from 'heroui-native';
import * as DocumentPicker from 'expo-document-picker';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { PickedRulesDocument } from '../types/league-management.model';

const MAX_SUMMARY_LENGTH = 200;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function inferMimeType(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.endsWith('.pdf')) return 'application/pdf';
  if (lowerName.endsWith('.doc')) return 'application/msword';
  if (lowerName.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  return 'application/octet-stream';
}

interface Props {
  visible: boolean;
  summary: string;
  onChangeSummary: (v: string) => void;
  pickedFile: PickedRulesDocument | null;
  onPickFile: (file: PickedRulesDocument | null) => void;
  hasExistingDoc: boolean;
  existingFileType: string | null;
  saving: boolean;
  deleting: boolean;
  onSave: () => void;
  onClose: () => void;
  onDeleteDocument: () => void;
}

export function RulesEditorModal({
  visible,
  summary,
  onChangeSummary,
  pickedFile,
  onPickFile,
  hasExistingDoc,
  existingFileType,
  saving,
  deleting,
  onSave,
  onClose,
  onDeleteDocument,
}: Props) {
  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      if (asset.size && asset.size > MAX_FILE_SIZE_BYTES) {
        Alert.alert('File Too Large', 'File size must be less than 10MB.');
        return;
      }

      const mimeType = asset.mimeType || inferMimeType(asset.name);
      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        Alert.alert('Unsupported File', 'Please upload a PDF, DOC, or DOCX file.');
        return;
      }

      onPickFile({
        uri: asset.uri,
        name: asset.name,
        type: mimeType,
      });
    } catch {
      Alert.alert('File Picker Error', 'Unable to select a document right now.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background" style={{ paddingTop: 16 }}>
        {/* Modal Header */}
        <View className="flex-row items-center justify-between px-4 pb-4 border-b border-default-200">
          <Pressable onPress={onClose} hitSlop={12} disabled={saving || deleting}>
            <AppText className="text-sm" style={{ color: mflColors.textMuted }}>Cancel</AppText>
          </Pressable>
          <View className="flex-row items-center gap-2">
            <Feather name="edit-3" size={16} color={mflColors.brand} />
            <AppText className="text-base font-bold text-foreground">Edit League Rules</AppText>
          </View>
          <Pressable onPress={onSave} disabled={saving || deleting} hitSlop={12}>
            {saving ? (
              <Spinner size="sm" />
            ) : (
              <AppText className="text-sm font-semibold" style={{ color: mflColors.brand }}>Save</AppText>
            )}
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            gap: 16,
            paddingBottom: 32,
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <AppText className="text-xs text-muted">
            Add a brief summary and upload a rules document (PDF, DOC, DOCX).
          </AppText>

          {/* Rules Summary */}
          <View className="gap-1">
            <View className="flex-row items-center justify-between">
              <AppText className="text-sm font-medium text-foreground">Rules Summary</AppText>
              <AppText className="text-xs text-muted">
                {summary.length}/{MAX_SUMMARY_LENGTH}
              </AppText>
            </View>
            <TextInput
              style={{
                backgroundColor: mflColors.white,
                borderWidth: 1,
                borderColor: mflColors.brand,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 15,
                color: mflColors.text,
                minHeight: 120,
                textAlignVertical: 'top',
              }}
              value={summary}
              onChangeText={(t) => onChangeSummary(t.slice(0, MAX_SUMMARY_LENGTH))}
              placeholder="Brief overview of league rules..."
              placeholderTextColor={mflColors.textMuted}
              multiline
              maxLength={MAX_SUMMARY_LENGTH}
            />
          </View>

          {/* Rules Document */}
          <View className="gap-2">
            <AppText className="text-sm font-medium text-foreground">Rules Document</AppText>

            {/* Current document */}
            {hasExistingDoc && !pickedFile && (
              <View
                className="flex-row items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: mflColors.surface, borderWidth: 1, borderColor: mflColors.border }}
              >
                <View className="flex-row items-center gap-2">
                  <Feather name="file" size={18} color={mflColors.brand} />
                  <AppText className="text-sm text-foreground">
                    Current: {existingFileType?.toUpperCase() ?? 'PDF'} document
                  </AppText>
                </View>
                <Pressable onPress={onDeleteDocument} disabled={deleting || saving}>
                  {deleting ? (
                    <Spinner size="sm" />
                  ) : (
                    <Feather name="trash-2" size={16} color={mflColors.danger} />
                  )}
                </Pressable>
              </View>
            )}

            {/* Picked file */}
            {pickedFile && (
              <View
                className="flex-row items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: '#d1fae5', borderWidth: 1, borderColor: '#6ee7b7' }}
              >
                <View className="flex-row items-center gap-2 flex-1 mr-2">
                  <Feather name="file" size={18} color="#059669" />
                  <AppText className="text-sm text-foreground" numberOfLines={1}>
                    {pickedFile.name}
                  </AppText>
                </View>
                <Pressable onPress={() => onPickFile(null)} disabled={saving || deleting}>
                  <Feather name="trash-2" size={16} color={mflColors.textMuted} />
                </Pressable>
              </View>
            )}

            <Button
              variant="secondary"
              onPress={handlePickFile}
              isDisabled={saving || deleting}
              className="w-full"
            >
              <Button.Label>
                {pickedFile ? 'Change File' : hasExistingDoc ? 'Replace Document' : 'Upload Document'}
              </Button.Label>
            </Button>
            <AppText className="text-xs text-muted">
              Accepted formats: PDF, DOC, DOCX. Max size: 10MB
            </AppText>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
