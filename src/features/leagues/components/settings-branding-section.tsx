import { View, TextInput } from 'react-native';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { ToggleRow, Divider, inputStyle } from './settings-form-fields';
import { mflColors } from '../../../constants/colors';

interface Props {
  displayName: string;
  tagline: string;
  primaryColor: string;
  poweredByVisible: boolean;
  onChangeDisplayName: (v: string) => void;
  onChangeTagline: (v: string) => void;
  onChangePrimaryColor: (v: string) => void;
  onTogglePoweredBy: () => void;
}

export function SettingsBrandingSection({
  displayName,
  tagline,
  primaryColor,
  poweredByVisible,
  onChangeDisplayName,
  onChangeTagline,
  onChangePrimaryColor,
  onTogglePoweredBy,
}: Props) {
  return (
    <View className="gap-3">
      <SectionLabel label="WHITE-LABEL BRANDING" />
      <AppText className="text-xs text-muted -mt-2">
        Leave blank to use default MFL branding.
      </AppText>
      <Card className="p-4 gap-3">
        <View className="gap-1">
          <AppText className="text-sm font-medium text-muted">Display Name</AppText>
          <TextInput
            style={inputStyle}
            value={displayName}
            onChangeText={onChangeDisplayName}
            placeholder="e.g. PowerFit Corporate"
            placeholderTextColor={mflColors.textMuted}
            maxLength={60}
          />
        </View>
        <View className="gap-1">
          <AppText className="text-sm font-medium text-muted">Tagline</AppText>
          <TextInput
            style={inputStyle}
            value={tagline}
            onChangeText={onChangeTagline}
            placeholder="e.g. Get Fit, Stay Strong"
            placeholderTextColor={mflColors.textMuted}
            maxLength={100}
          />
        </View>
        <View className="gap-1">
          <AppText className="text-sm font-medium text-muted">Brand Color</AppText>
          <View className="flex-row items-center gap-3">
            <TextInput
              style={[inputStyle, { flex: 1 }]}
              value={primaryColor}
              onChangeText={onChangePrimaryColor}
              placeholder="#1a5276"
              placeholderTextColor={mflColors.textMuted}
              maxLength={7}
              autoCapitalize="none"
            />
            {primaryColor.length >= 4 && (
              <View
                className="w-10 h-10 rounded-lg border border-default-200"
                style={{ backgroundColor: primaryColor }}
              />
            )}
          </View>
        </View>
        <Divider />
        <ToggleRow
          label='"Powered by MFL"'
          description="Show the MFL attribution badge."
          value={poweredByVisible}
          onToggle={onTogglePoweredBy}
        />
      </Card>
    </View>
  );
}
