import Feather from '@expo/vector-icons/Feather';
import { Button, Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';

interface Props {
  canEdit: boolean;
  onAddRules: () => void;
}

export function RulesEmptyState({ canEdit, onAddRules }: Props) {
  return (
    <Card className="p-6 items-center">
      <Feather name="file-text" size={48} color={mflColors.textMuted} />
      <AppText className="text-base font-semibold text-foreground mt-3 mb-1">
        No Rules Set
      </AppText>
      <AppText className="text-sm text-muted text-center mb-4">
        {canEdit
          ? 'Add league rules and guidelines for your participants.'
          : 'The league host has not added any rules yet.'}
      </AppText>
      {canEdit && (
        <Button variant="primary" size="sm" onPress={onAddRules}>
          <Button.Label>Add Rules</Button.Label>
        </Button>
      )}
    </Card>
  );
}
