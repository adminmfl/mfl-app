import { View, TextInput } from 'react-native';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { inputStyle } from './settings-form-fields';
import { mflColors } from '../../../constants/colors';

interface Props {
  leagueName: string;
  description: string;
  startDate: string;
  endDate: string;
  onChangeLeagueName: (v: string) => void;
  onChangeDescription: (v: string) => void;
  onChangeStartDate: (v: string) => void;
  onChangeEndDate: (v: string) => void;
  canEditDates?: boolean;
  canEditStartDate?: boolean;
  canEditEndDate?: boolean;
}

export function SettingsGeneralSection({
  leagueName,
  description,
  startDate,
  endDate,
  onChangeLeagueName,
  onChangeDescription,
  onChangeStartDate,
  onChangeEndDate,
  canEditDates = true,
  canEditStartDate,
  canEditEndDate,
}: Props) {
  const startEditable = canEditStartDate ?? canEditDates;
  const endEditable = canEditEndDate ?? canEditDates;

  return (
    <>
      {/* General */}
      <View className="gap-3">
        <SectionLabel label="GENERAL" />
        <Card className="p-4 gap-3">
          <View className="gap-1">
            <AppText className="text-sm font-medium text-muted">League Name</AppText>
            <TextInput
              style={inputStyle}
              value={leagueName}
              onChangeText={onChangeLeagueName}
              placeholder="League name"
              placeholderTextColor={mflColors.textMuted}
              maxLength={100}
            />
          </View>
          <View className="gap-1">
            <AppText className="text-sm font-medium text-muted">Description</AppText>
            <TextInput
              style={[inputStyle, { minHeight: 80, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={onChangeDescription}
              placeholder="Describe your league..."
              placeholderTextColor={mflColors.textMuted}
              multiline
              maxLength={500}
            />
          </View>
        </Card>
      </View>

      {/* Schedule */}
      <View className="gap-3">
        <SectionLabel label="SCHEDULE" />
        <Card className="p-4">
          <View className="flex-row gap-3">
            <View className="flex-1 gap-1">
              <AppText className="text-sm font-medium text-muted">Start Date</AppText>
              <TextInput
                style={[inputStyle, !startEditable && { opacity: 0.5 }]}
                value={startDate}
                onChangeText={onChangeStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={mflColors.textMuted}
                maxLength={10}
                keyboardType="numbers-and-punctuation"
                editable={startEditable}
              />
            </View>
            <View className="flex-1 gap-1">
              <AppText className="text-sm font-medium text-muted">End Date</AppText>
              <TextInput
                style={[inputStyle, !endEditable && { opacity: 0.5 }]}
                value={endDate}
                onChangeText={onChangeEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={mflColors.textMuted}
                maxLength={10}
                keyboardType="numbers-and-punctuation"
                editable={endEditable}
              />
            </View>
          </View>
        </Card>
      </View>
    </>
  );
}
