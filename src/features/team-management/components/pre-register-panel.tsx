import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { Button, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { inputStyle } from '../utils/input-style';
import { TeamManagementPanel } from './team-management-panel';

interface PreRegisterPanelProps {
  isBusy: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

export function PreRegisterPanel({ isBusy, onClose, onSubmit }: PreRegisterPanelProps) {
  const [email, setEmail] = useState('');

  return (
    <TeamManagementPanel
      title="Pre-Register Member"
      subtitle="Send a single pre-registration email to a host-managed league member."
      onClose={onClose}
    >
      <View className="gap-2">
        <AppText className="text-xs text-muted">Email Address</AppText>
        <TextInput
          style={inputStyle}
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
          placeholderTextColor={mflColors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
        />
      </View>

      <Button
        variant="primary"
        size="lg"
        onPress={() => onSubmit(email)}
        isDisabled={isBusy || !email.trim()}
      >
        {isBusy ? <Spinner size="sm" /> : <Button.Label>Send Pre-Registration</Button.Label>}
      </Button>
    </TeamManagementPanel>
  );
}