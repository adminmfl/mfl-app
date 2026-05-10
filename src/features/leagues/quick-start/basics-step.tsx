import Feather from '@expo/vector-icons/Feather';
import { useMemo } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';
import { Button } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import {
  TEMPLATES,
  addDaysToDate,
  formatDate,
  getTomorrowString,
  type WizardData,
} from './quick-start.types';

interface Props {
  data: WizardData;
  onUpdate: (partial: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const inputStyle = {
  backgroundColor: mflColors.white,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 15,
  color: mflColors.text,
} as const;

export function StepBasics({ data, onUpdate, onNext, onBack }: Props) {
  const template = TEMPLATES.find((t) => t.id === data.template);

  const autoName = useMemo(() => {
    const typeLabel =
      data.leagueType === 'corporate'
        ? 'Corporate'
        : data.leagueType === 'residential'
          ? 'Residential'
          : 'Custom';
    return `${typeLabel} ${data.duration}-Day League`;
  }, [data.leagueType, data.duration]);

  const endDate = useMemo(() => {
    if (data.startDate.length !== 10) return '';
    return addDaysToDate(data.startDate, data.duration);
  }, [data.startDate, data.duration]);

  const minDate = getTomorrowString();

  const handleNext = () => {
    if (data.maxParticipants < 4 || data.maxParticipants > 500) {
      Alert.alert('Invalid', 'Max participants must be between 4 and 500.');
      return;
    }
    if (data.startDate.length === 10 && data.startDate < minDate) {
      Alert.alert('Invalid', 'Start date must be tomorrow or later.');
      return;
    }
    onNext();
  };

  return (
    <View className="gap-5">
      <View>
        <AppText className="text-lg font-bold text-foreground">League Basics</AppText>
        <AppText className="text-sm text-muted">
          Set your league name, dates, and size.
        </AppText>
      </View>

      {/* League name */}
      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">
          League Name{' '}
          <AppText className="text-xs text-muted">(optional)</AppText>
        </AppText>
        <TextInput
          style={inputStyle}
          value={data.leagueName}
          onChangeText={(v) => onUpdate({ leagueName: v })}
          placeholder={autoName}
          placeholderTextColor={mflColors.textMuted}
          maxLength={100}
        />
      </View>

      {/* Start date */}
      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">Start Date</AppText>
        <TextInput
          style={inputStyle}
          value={data.startDate}
          onChangeText={(v) => onUpdate({ startDate: v })}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={mflColors.textMuted}
          maxLength={10}
          keyboardType="numbers-and-punctuation"
        />
        <AppText className="text-xs text-muted">
          Ends on {endDate ? formatDate(endDate) : '...'}
        </AppText>
        {data.startDate.length === 10 && data.startDate < minDate && (
          <AppText className="text-xs" style={{ color: mflColors.danger }}>
            Start date must be tomorrow or later.
          </AppText>
        )}
      </View>

      {/* Duration */}
      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">Duration (days)</AppText>
        <TextInput
          style={inputStyle}
          value={String(data.duration)}
          onChangeText={(v) => {
            const n = parseInt(v) || 7;
            onUpdate({ duration: Math.max(7, Math.min(180, n)) });
          }}
          keyboardType="number-pad"
          maxLength={3}
        />
        {template && (
          <AppText className="text-xs text-muted">
            Template default: {template.duration} days
          </AppText>
        )}
      </View>

      {/* Max participants */}
      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">Max Participants</AppText>
        <TextInput
          style={inputStyle}
          value={String(data.maxParticipants)}
          onChangeText={(v) => {
            const n = parseInt(v) || 4;
            onUpdate({ maxParticipants: Math.max(4, Math.min(500, n)) });
          }}
          keyboardType="number-pad"
          maxLength={3}
        />
      </View>

      {/* Visibility */}
      <View className="gap-1">
        <AppText className="text-sm font-medium text-muted">Visibility</AppText>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => onUpdate({ isPublic: false })}
            className="flex-1 items-center gap-1 py-3 rounded-xl"
            style={{
              backgroundColor: !data.isPublic ? mflColors.brand : mflColors.white,
              borderWidth: 1,
              borderColor: !data.isPublic ? mflColors.brand : mflColors.border,
            }}
          >
            <Feather
              name="lock"
              size={16}
              color={!data.isPublic ? mflColors.white : mflColors.textMuted}
            />
            <AppText
              className="text-xs font-medium"
              style={{ color: !data.isPublic ? mflColors.white : mflColors.text }}
            >
              Invite Only
            </AppText>
          </Pressable>
          <Pressable
            onPress={() => onUpdate({ isPublic: true })}
            className="flex-1 items-center gap-1 py-3 rounded-xl"
            style={{
              backgroundColor: data.isPublic ? mflColors.brand : mflColors.white,
              borderWidth: 1,
              borderColor: data.isPublic ? mflColors.brand : mflColors.border,
            }}
          >
            <Feather
              name="globe"
              size={16}
              color={data.isPublic ? mflColors.white : mflColors.textMuted}
            />
            <AppText
              className="text-xs font-medium"
              style={{ color: data.isPublic ? mflColors.white : mflColors.text }}
            >
              Public
            </AppText>
          </Pressable>
        </View>
      </View>

      {/* Navigation */}
      <View className="flex-row gap-3 mt-2">
        <Button variant="secondary" size="lg" onPress={onBack} className="flex-1">
          <Button.Label>Back</Button.Label>
        </Button>
        <Button variant="primary" size="lg" onPress={handleNext} className="flex-1">
          <Button.Label>Teams</Button.Label>
        </Button>
      </View>
    </View>
  );
}
