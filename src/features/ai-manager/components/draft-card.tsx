import { useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { Card, Spinner } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { draftStatusColor, draftStatusLabel } from '../utils/colors';
import type { Draft } from '../types/ai-manager.model';

interface DraftCardProps {
  draft: Draft;
  isSending: boolean;
  isScheduling: boolean;
  onSend: (id: string) => void;
  onEdit: (draft: Draft) => void;
  onSchedule: (id: string) => void;
  onCancel: (id: string) => void;
  onDismiss: (id: string) => void;
  onDelete: (id: string) => void;
}

function Countdown({ targetDate }: { targetDate: string }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('Sending...');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${mins}:${secs.toString().padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <AppText className="text-xs font-mono font-semibold" style={{ color: '#D97706' }}>
      {remaining}
    </AppText>
  );
}

export function DraftCard({
  draft,
  isSending,
  isScheduling,
  onSend,
  onEdit,
  onSchedule,
  onCancel,
  onDismiss,
  onDelete,
}: DraftCardProps) {
  const isActionable = draft.status === 'pending' || draft.status === 'edited';
  const isScheduled = draft.status === 'scheduled';
  const statusCol = draftStatusColor(draft.status);

  return (
    <Card
      className="p-4 mb-3"
      style={isScheduled ? { borderLeftWidth: 3, borderLeftColor: '#F59E0B' } : undefined}
    >
      {/* Header */}
      <View className="flex-row items-center flex-wrap mb-2" style={{ gap: 6 }}>
        <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: mflColors.inkLight }}>
          <AppText className="text-[10px] font-medium" style={{ color: mflColors.textSub }}>
            {draft.type.replace(/_/g, ' ')}
          </AppText>
        </View>
        <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: mflColors.inkLight }}>
          <AppText className="text-[10px] font-medium" style={{ color: mflColors.textSub }}>
            {draft.targetScope}
          </AppText>
        </View>
        <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: statusCol.bg }}>
          <AppText className="text-[10px] font-bold" style={{ color: statusCol.text }}>
            {draftStatusLabel(draft.status)}
          </AppText>
        </View>

        {/* Countdown + date */}
        <View className="flex-row items-center ml-auto" style={{ gap: 6 }}>
          {isScheduled && draft.scheduledSendAt && (
            <View className="flex-row items-center" style={{ gap: 2 }}>
              <Feather name="clock" size={12} color="#D97706" />
              <Countdown targetDate={draft.scheduledSendAt} />
            </View>
          )}
          <AppText className="text-[10px] text-muted">
            {new Date(draft.createdAt).toLocaleDateString()}
          </AppText>
        </View>
      </View>

      {/* Content */}
      <AppText className="text-xs text-foreground mb-3">{draft.content}</AppText>

      {/* Actionable buttons */}
      {isActionable && (
        <View className="flex-row flex-wrap" style={{ gap: 6 }}>
          <ActionButton
            icon="send"
            label="Send Now"
            loading={isSending}
            bg={mflColors.brand}
            textColor="#fff"
            onPress={() => onSend(draft.id)}
          />
          <ActionButton
            icon="clock"
            label="Schedule (10 min)"
            loading={isScheduling}
            bg={mflColors.amberLight}
            textColor={mflColors.amber}
            onPress={() => onSchedule(draft.id)}
          />
          <ActionButton
            icon="edit-2"
            label="Edit"
            bg={mflColors.inkLight}
            textColor={mflColors.textSub}
            onPress={() => onEdit(draft)}
          />
          <ActionButton
            icon="x"
            label="Dismiss"
            bg={mflColors.inkLight}
            textColor={mflColors.textSub}
            onPress={() => onDismiss(draft.id)}
          />
          <ActionButton
            icon="trash-2"
            label="Delete"
            bg={mflColors.dangerLight}
            textColor={mflColors.danger}
            onPress={() => onDelete(draft.id)}
          />
        </View>
      )}

      {/* Scheduled buttons */}
      {isScheduled && (
        <View className="flex-row flex-wrap" style={{ gap: 6 }}>
          <ActionButton
            icon="send"
            label="Send Now"
            loading={isSending}
            bg={mflColors.brand}
            textColor="#fff"
            onPress={() => onSend(draft.id)}
          />
          <ActionButton
            icon="edit-2"
            label="Edit"
            bg={mflColors.inkLight}
            textColor={mflColors.textSub}
            onPress={() => onEdit(draft)}
          />
          <ActionButton
            icon="x-circle"
            label="Cancel"
            bg={mflColors.dangerLight}
            textColor={mflColors.danger}
            onPress={() => onCancel(draft.id)}
          />
        </View>
      )}
    </Card>
  );
}

function ActionButton({
  icon,
  label,
  loading,
  bg,
  textColor,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  loading?: boolean;
  bg: string;
  textColor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="flex-row items-center rounded-lg px-2.5 py-1.5"
      style={{ backgroundColor: bg }}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <Spinner size="sm" style={{ marginRight: 3 }} />
      ) : (
        <Feather name={icon} size={12} color={textColor} style={{ marginRight: 3 }} />
      )}
      <AppText className="text-[11px] font-semibold" style={{ color: textColor }}>
        {label}
      </AppText>
    </Pressable>
  );
}
