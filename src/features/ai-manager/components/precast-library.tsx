import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, TextInput, View } from 'react-native';
import { Card, Spinner } from 'heroui-native';
import Feather from '@expo/vector-icons/Feather';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import type { CannedMessage } from '../types/ai-manager.model';

interface PrecastLibraryProps {
  messages: CannedMessage[];
  isLoading: boolean;
  creating: boolean;
  drafting: boolean;
  deletingId: string | null;
  onCreateTemplate: (body: { title: string; content: string }) => void;
  onCreateDraft: (body: { title: string; content: string }) => void;
  onDeleteTemplate: (id: string) => void;
}

export function PrecastLibrary({
  messages,
  isLoading,
  creating,
  drafting,
  deletingId,
  onCreateTemplate,
  onCreateDraft,
  onDeleteTemplate,
}: PrecastLibraryProps) {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<CannedMessage | null>(null);
  const [editContent, setEditContent] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const filtered = useMemo(
    () => (filter === 'all' ? messages : messages.filter((msg) => msg.roleTarget === filter)),
    [filter, messages],
  );

  const openTemplate = (message: CannedMessage) => {
    setSelected(message);
    setEditContent(message.content);
  };

  const handleCreate = () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    onCreateTemplate({ title: newTitle.trim(), content: newContent.trim() });
    setNewTitle('');
    setNewContent('');
    setCreateOpen(false);
  };

  return (
    <View className="mt-2">
      <View className="flex-row items-center justify-between">
        <SectionLabel label="Precast Library" />
        <Pressable
          className="flex-row items-center rounded-lg px-3 py-2"
          style={{ backgroundColor: mflColors.brand }}
          onPress={() => setCreateOpen(true)}
        >
          <Feather name="plus" size={14} color="#fff" style={{ marginRight: 4 }} />
          <AppText className="text-xs font-semibold" style={{ color: '#fff' }}>
            New
          </AppText>
        </Pressable>
      </View>

      <View className="flex-row mb-3" style={{ gap: 8 }}>
        {['all', 'host', 'captain', 'governor'].map((role) => (
          <Pressable
            key={role}
            className="rounded-full px-3 py-1.5"
            style={{
              backgroundColor: filter === role ? mflColors.brand : mflColors.inkLight,
            }}
            onPress={() => setFilter(role)}
          >
            <AppText
              className="text-xs font-semibold capitalize"
              style={{ color: filter === role ? '#fff' : mflColors.textSub }}
            >
              {role}
            </AppText>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <Card className="p-4 mb-4 items-center">
          <Spinner size="sm" />
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-4 mb-4">
          <AppText className="text-xs text-muted text-center py-4">No templates found.</AppText>
        </Card>
      ) : (
        filtered.map((message) => (
          <Card key={message.id} className="p-4 mb-3">
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-1 pr-3">
                <AppText className="text-sm font-bold text-foreground">{message.title}</AppText>
                <AppText className="text-xs text-muted mt-1" numberOfLines={2}>
                  {message.content}
                </AppText>
              </View>
              <View
                className="rounded-full px-2 py-1"
                style={{ backgroundColor: mflColors.inkLight }}
              >
                <AppText className="text-[10px] font-semibold" style={{ color: mflColors.textSub }}>
                  {message.roleTarget}
                </AppText>
              </View>
            </View>

            <View className="flex-row" style={{ gap: 8 }}>
              <Pressable
                className="flex-row items-center rounded-lg px-3 py-2"
                style={{ backgroundColor: mflColors.inkLight }}
                onPress={() => openTemplate(message)}
              >
                <Feather name="send" size={13} color={mflColors.textSub} style={{ marginRight: 4 }} />
                <AppText className="text-xs font-semibold" style={{ color: mflColors.textSub }}>
                  Use as Draft
                </AppText>
              </Pressable>
              {!message.isSystem && (
                <Pressable
                  className="flex-row items-center rounded-lg px-3 py-2"
                  style={{ backgroundColor: `${mflColors.danger}18` }}
                  onPress={() =>
                    Alert.alert('Delete Template', 'Delete this message template?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => onDeleteTemplate(message.id) },
                    ])
                  }
                  disabled={deletingId === message.id}
                >
                  {deletingId === message.id ? (
                    <Spinner size="sm" />
                  ) : (
                    <Feather name="trash-2" size={13} color={mflColors.danger} />
                  )}
                </Pressable>
              )}
            </View>
          </Card>
        ))
      )}

      <TemplateModal
        title={selected ? `Use Template: ${selected.title}` : 'New Message Template'}
        visible={!!selected || createOpen}
        content={selected ? editContent : newContent}
        titleValue={newTitle}
        showTitle={!selected}
        isSaving={selected ? drafting : creating}
        confirmLabel={selected ? 'Create Draft' : 'Create'}
        onChangeContent={selected ? setEditContent : setNewContent}
        onChangeTitle={setNewTitle}
        onClose={() => {
          setSelected(null);
          setCreateOpen(false);
        }}
        onConfirm={() => {
          if (selected) {
            onCreateDraft({ title: selected.title, content: editContent.trim() });
            setSelected(null);
          } else {
            handleCreate();
          }
        }}
      />
    </View>
  );
}

function TemplateModal({
  title,
  visible,
  content,
  titleValue,
  showTitle,
  isSaving,
  confirmLabel,
  onChangeContent,
  onChangeTitle,
  onClose,
  onConfirm,
}: {
  title: string;
  visible: boolean;
  content: string;
  titleValue: string;
  showTitle: boolean;
  isSaving: boolean;
  confirmLabel: string;
  onChangeContent: (value: string) => void;
  onChangeTitle: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <Pressable className="flex-1" onPress={onClose} />
        <View className="rounded-t-2xl p-5" style={{ backgroundColor: mflColors.card }}>
          <AppText className="text-lg font-bold text-foreground mb-3">{title}</AppText>
          {showTitle && (
            <TextInput
              value={titleValue}
              onChangeText={onChangeTitle}
              placeholder="Template title"
              placeholderTextColor={mflColors.textMuted}
              className="rounded-lg p-3 text-sm text-foreground mb-3"
              style={{ backgroundColor: mflColors.surface, borderWidth: 1, borderColor: mflColors.border }}
            />
          )}
          <TextInput
            value={content}
            onChangeText={onChangeContent}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholder="Message content"
            placeholderTextColor={mflColors.textMuted}
            className="rounded-lg p-3 text-sm text-foreground mb-4"
            style={{
              backgroundColor: mflColors.surface,
              borderWidth: 1,
              borderColor: mflColors.border,
              minHeight: 120,
              color: mflColors.text,
            }}
          />
          <View className="flex-row justify-end" style={{ gap: 10 }}>
            <Pressable className="rounded-lg px-4 py-2.5" style={{ backgroundColor: mflColors.inkLight }} onPress={onClose}>
              <AppText className="text-sm font-medium" style={{ color: mflColors.textSub }}>Cancel</AppText>
            </Pressable>
            <Pressable className="rounded-lg px-4 py-2.5" style={{ backgroundColor: mflColors.brand }} onPress={onConfirm} disabled={isSaving}>
              <AppText className="text-sm font-semibold" style={{ color: '#fff' }}>
                {isSaving ? 'Saving...' : confirmLabel}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
