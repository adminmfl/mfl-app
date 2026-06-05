import Feather from '@expo/vector-icons/Feather';
import { Alert, Linking, Pressable, View } from 'react-native';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';

interface Props {
  docUrl: string;
  fileType: string | null;
  canEdit: boolean;
  deleting?: boolean;
  onDeleteDocument: () => void;
}

export function RulesDocumentSection({
  docUrl,
  fileType,
  canEdit,
  deleting = false,
  onDeleteDocument,
}: Props) {
  const openDocument = async () => {
    try {
      await Linking.openURL(docUrl);
    } catch {
      Alert.alert(
        'Unable to open document',
        'Open this rules document from a browser or try again later.',
      );
    }
  };

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <SectionLabel label="RULES DOCUMENT" />
        <Pressable onPress={openDocument}>
          <View className="flex-row items-center gap-1">
            <Feather name="download" size={14} color={mflColors.brand} />
            <AppText className="text-xs font-medium" style={{ color: mflColors.brand }}>
              Download
            </AppText>
          </View>
        </Pressable>
      </View>
      <Pressable onPress={openDocument}>
        <Card className="p-4">
          <View className="flex-row items-center gap-3">
            <View
              className="w-10 h-10 rounded-lg items-center justify-center"
              style={{ backgroundColor: mflColors.blueLight }}
            >
              <Feather name="file-text" size={20} color={mflColors.blue} />
            </View>
            <View className="flex-1">
              <AppText className="text-sm font-semibold text-foreground">
                View Rules Document
              </AppText>
              <AppText className="text-xs text-muted mt-0.5">
                {fileType ? `${fileType.toUpperCase()} file` : 'External document'}
              </AppText>
            </View>
            <Feather name="external-link" size={18} color={mflColors.textMuted} />
          </View>
        </Card>
      </Pressable>

      {canEdit && (
        <Pressable onPress={onDeleteDocument} disabled={deleting}>
          <View className="flex-row items-center justify-center gap-2 py-2">
            <Feather name="trash-2" size={14} color={mflColors.danger} />
            <AppText className="text-xs font-medium" style={{ color: mflColors.danger }}>
              {deleting ? 'Deleting Document...' : 'Delete Document'}
            </AppText>
          </View>
        </Pressable>
      )}
    </View>
  );
}
