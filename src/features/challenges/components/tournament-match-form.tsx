import type { ReactNode } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Button, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import type { ChallengeTeam, TournamentMatchStatus } from '../types/challenge.model';

export interface TournamentMatchForm {
  roundNumber: string;
  roundName: string;
  team1Id: string;
  team2Id: string;
  startDate: string;
  status: TournamentMatchStatus;
  score1: string;
  score2: string;
}

const inputStyle = {
  backgroundColor: mflColors.card,
  borderWidth: 1,
  borderColor: mflColors.border,
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 10,
  fontSize: 15,
  color: mflColors.text,
};

export const STATUS_OPTIONS: Array<{ value: TournamentMatchStatus; label: string }> = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function emptyMatchForm(): TournamentMatchForm {
  return {
    roundNumber: '1',
    roundName: 'Group Stage',
    team1Id: '',
    team2Id: '',
    startDate: new Date().toISOString().slice(0, 10),
    status: 'scheduled',
    score1: '0',
    score2: '0',
  };
}

export function MatchForm({
  form,
  teams,
  isSaving,
  editing,
  onChange,
  onCancel,
  onSubmit,
}: {
  form: TournamentMatchForm;
  teams: ChallengeTeam[];
  isSaving: boolean;
  editing: boolean;
  onChange: (patch: Partial<TournamentMatchForm>) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  return (
    <View className="rounded-xl border border-default-200 p-3 gap-3">
      <AppText className="text-base font-bold text-foreground">
        {editing ? 'Edit Match' : 'Add Match'}
      </AppText>

      <View className="flex-row gap-3">
        <Field label="Round" className="flex-1">
          <TextInput
            style={inputStyle}
            value={form.roundNumber}
            onChangeText={(value) => onChange({ roundNumber: value })}
            keyboardType="numeric"
            placeholder="1"
            placeholderTextColor={mflColors.textMuted}
          />
        </Field>
        <Field label="Date" className="flex-1">
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
      </View>

      <Field label="Round Name">
        <TextInput
          style={inputStyle}
          value={form.roundName}
          onChangeText={(value) => onChange({ roundName: value })}
          placeholder="Group Stage"
          placeholderTextColor={mflColors.textMuted}
        />
      </Field>

      <TeamPicker
        label="Team 1"
        teams={teams}
        value={form.team1Id}
        disabledTeamId={form.team2Id}
        onChange={(team1Id) => onChange({ team1Id })}
      />
      <TeamPicker
        label="Team 2"
        teams={teams}
        value={form.team2Id}
        disabledTeamId={form.team1Id}
        onChange={(team2Id) => onChange({ team2Id })}
      />

      <View className="gap-2">
        <AppText className="text-xs font-semibold text-muted uppercase">Status</AppText>
        <View className="flex-row flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => (
            <Pressable
              key={status.value}
              onPress={() => onChange({ status: status.value })}
              className="rounded-full border px-3 py-2"
              style={{
                backgroundColor: form.status === status.value ? mflColors.brand : mflColors.card,
                borderColor: form.status === status.value ? mflColors.brand : mflColors.border,
              }}
            >
              <AppText
                className="text-xs font-bold"
                style={{ color: form.status === status.value ? '#fff' : mflColors.text }}
              >
                {status.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      {form.status !== 'scheduled' || editing ? (
        <View className="flex-row gap-3">
          <Field label="Score 1" className="flex-1">
            <TextInput
              style={inputStyle}
              value={form.score1}
              onChangeText={(value) => onChange({ score1: value })}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={mflColors.textMuted}
            />
          </Field>
          <Field label="Score 2" className="flex-1">
            <TextInput
              style={inputStyle}
              value={form.score2}
              onChangeText={(value) => onChange({ score2: value })}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={mflColors.textMuted}
            />
          </Field>
        </View>
      ) : null}

      <View className="flex-row gap-3">
        <Button variant="secondary" size="md" onPress={onCancel} className="flex-1">
          <Button.Label>Cancel</Button.Label>
        </Button>
        <Button variant="primary" size="md" onPress={onSubmit} isDisabled={isSaving} className="flex-1">
          {isSaving ? <Spinner size="sm" /> : <Button.Label>Save Match</Button.Label>}
        </Button>
      </View>
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
  children: ReactNode;
}) {
  return (
    <View className={`gap-2 ${className ?? ''}`}>
      <AppText className="text-xs font-semibold text-muted uppercase">{label}</AppText>
      {children}
    </View>
  );
}

function TeamPicker({
  label,
  teams,
  value,
  disabledTeamId,
  onChange,
}: {
  label: string;
  teams: ChallengeTeam[];
  value: string;
  disabledTeamId: string;
  onChange: (teamId: string) => void;
}) {
  return (
    <View className="gap-2">
      <AppText className="text-xs font-semibold text-muted uppercase">{label}</AppText>
      <View className="flex-row flex-wrap gap-2">
        {teams.map((team) => {
          const selected = value === team.teamId;
          const disabled = disabledTeamId === team.teamId;
          return (
            <Pressable
              key={team.teamId}
              disabled={disabled}
              onPress={() => onChange(team.teamId)}
              className="rounded-full border px-3 py-2"
              style={{
                opacity: disabled ? 0.4 : 1,
                backgroundColor: selected ? mflColors.brand : mflColors.card,
                borderColor: selected ? mflColors.brand : mflColors.border,
              }}
            >
              <AppText
                className="text-xs font-bold"
                style={{ color: selected ? '#fff' : mflColors.text }}
              >
                {team.teamName}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
