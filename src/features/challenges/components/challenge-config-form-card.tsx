import Feather from '@expo/vector-icons/Feather';
import type React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Button, Card, Spinner } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import type { ChallengeConfigForm, PickedChallengeDocument } from '../types/challenge-config';
import { CHALLENGE_TYPES } from '../utils/challenge-config-utils';

const inputStyle = {
  backgroundColor: mflColors.card,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 11,
  fontSize: 15,
  color: mflColors.text,
};

interface ChallengeConfigFormCardProps {
  title: string;
  subtitle: string;
  form: ChallengeConfigForm;
  document: PickedChallengeDocument | null;
  submitLabel: string;
  cancelLabel?: string;
  isSaving: boolean;
  showNameFields?: boolean;
  onChange: (patch: Partial<ChallengeConfigForm>) => void;
  onPickDocument?: () => void;
  onClearDocument?: () => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

export function ChallengeConfigFormCard({
  title,
  subtitle,
  form,
  document,
  submitLabel,
  cancelLabel = 'Cancel',
  isSaving,
  showNameFields = true,
  onChange,
  onPickDocument,
  onClearDocument,
  onSubmit,
  onCancel,
}: ChallengeConfigFormCardProps) {
  const canSubmit =
    (!showNameFields || form.name.trim().length > 0) &&
    form.totalPoints.trim().length > 0 &&
    Number.isFinite(Number(form.totalPoints)) &&
    Number(form.totalPoints) >= 0 &&
    !isSaving;

  return (
    <View className="gap-3">
      <SectionLabel label={title.toUpperCase()} />
      <Card className="p-4 gap-4">
        <View>
          <AppText className="text-base font-bold text-foreground">{title}</AppText>
          <AppText className="text-xs text-muted mt-1">{subtitle}</AppText>
        </View>

        {showNameFields ? (
          <>
            <Field label="Name *">
              <TextInput
                style={inputStyle}
                value={form.name}
                onChangeText={(value) => onChange({ name: value })}
                placeholder="Challenge name"
                placeholderTextColor={mflColors.textMuted}
              />
            </Field>

            <Field label="Description">
              <TextInput
                style={{ ...inputStyle, minHeight: 86, textAlignVertical: 'top' }}
                value={form.description}
                onChangeText={(value) => onChange({ description: value })}
                placeholder="Describe the challenge"
                placeholderTextColor={mflColors.textMuted}
                multiline
              />
            </Field>

            <Field label="Challenge Type">
              <View className="gap-2">
                {CHALLENGE_TYPES.map((type) => (
                  <TypeOption
                    key={type.value}
                    label={type.label}
                    description={type.description}
                    selected={form.challengeType === type.value}
                    onPress={() => onChange({ challengeType: type.value })}
                  />
                ))}
              </View>
            </Field>
          </>
        ) : null}

        <View className="flex-row gap-3">
          <Field label="Total Points *" className="flex-1">
            <TextInput
              style={inputStyle}
              value={form.totalPoints}
              onChangeText={(value) => onChange({ totalPoints: value })}
              placeholder="100"
              placeholderTextColor={mflColors.textMuted}
              keyboardType="numeric"
            />
          </Field>
        </View>

        <View className="flex-row gap-3">
          <Field label="Start Date" className="flex-1">
            <TextInput
              style={inputStyle}
              value={form.startDate}
              onChangeText={(value) => onChange({ startDate: value })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={mflColors.textMuted}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
          </Field>
          <Field label="End Date" className="flex-1">
            <TextInput
              style={inputStyle}
              value={form.endDate}
              onChangeText={(value) => onChange({ endDate: value })}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={mflColors.textMuted}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
          </Field>
        </View>

        {showNameFields ? (
          <Field label="Rules Document">
            <TextInput
              style={inputStyle}
              value={form.docUrl}
              onChangeText={(value) => onChange({ docUrl: value })}
              placeholder="Optional document URL"
              placeholderTextColor={mflColors.textMuted}
              autoCapitalize="none"
            />
            {onPickDocument ? (
              <View className="flex-row items-center gap-2 mt-2">
                <Button variant="secondary" size="sm" onPress={onPickDocument}>
                  <Button.Label>{document ? 'Replace File' : 'Upload File'}</Button.Label>
                </Button>
                {document ? (
                  <Pressable onPress={onClearDocument} className="flex-row items-center flex-1">
                    <Feather name="file-text" size={14} color={mflColors.textMuted} />
                    <AppText className="text-xs text-muted ml-1 flex-1" numberOfLines={1}>
                      {document.name}
                    </AppText>
                    <Feather name="x" size={16} color={mflColors.textMuted} />
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </Field>
        ) : null}

        {form.challengeType === 'individual' ? (
          <Pressable
            onPress={() => onChange({ isUniqueWorkout: !form.isUniqueWorkout })}
            className="flex-row items-start gap-3 rounded-xl border p-3"
            style={{
              borderColor: form.isUniqueWorkout ? mflColors.brand : mflColors.border,
              backgroundColor: form.isUniqueWorkout ? mflColors.brandLight : mflColors.card,
            }}
          >
            <Feather
              name={form.isUniqueWorkout ? 'check-square' : 'square'}
              size={20}
              color={form.isUniqueWorkout ? mflColors.brand : mflColors.textMuted}
            />
            <View className="flex-1">
              <AppText className="text-sm font-semibold text-foreground">
                Unique Workout Challenge
              </AppText>
              <AppText className="text-xs text-muted mt-1">
                Players link a workout entry instead of uploading standalone proof.
              </AppText>
            </View>
          </Pressable>
        ) : null}

        <View className="flex-row gap-3">
          {onCancel ? (
            <Button variant="secondary" size="lg" onPress={onCancel} className="flex-1">
              <Button.Label>{cancelLabel}</Button.Label>
            </Button>
          ) : null}
          <Button
            variant="primary"
            size="lg"
            onPress={onSubmit}
            isDisabled={!canSubmit}
            className="flex-1"
          >
            {isSaving ? <Spinner size="sm" /> : <Button.Label>{submitLabel}</Button.Label>}
          </Button>
        </View>
      </Card>
    </View>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <View className={`gap-2 ${className ?? ''}`}>
      <AppText className="text-xs font-semibold text-muted uppercase">{label}</AppText>
      {children}
    </View>
  );
}

function TypeOption({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl border p-3"
      style={{
        borderColor: selected ? mflColors.brand : mflColors.border,
        backgroundColor: selected ? mflColors.brandLight : mflColors.card,
      }}
    >
      <AppText className="text-sm font-bold" style={{ color: selected ? mflColors.brand : mflColors.text }}>
        {label}
      </AppText>
      <AppText className="text-xs text-muted mt-1">{description}</AppText>
    </Pressable>
  );
}
