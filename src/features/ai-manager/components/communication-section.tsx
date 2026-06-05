import { useState } from 'react';
import { View } from 'react-native';
import { Card } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { DraftCard } from './draft-card';
import { EditDraftModal } from './edit-draft-modal';
import { PrecastLibrary } from './precast-library';
import type { CannedMessage, Draft } from '../types/ai-manager.model';

interface CommunicationSectionProps {
  drafts: Draft[];
  cannedMessages: CannedMessage[];
  cannedMessagesLoading: boolean;
  sendingDraftId: string | null;
  schedulingDraftId: string | null;
  creatingTemplate: boolean;
  creatingDraftFromTemplate: boolean;
  deletingTemplateId: string | null;
  editSaving: boolean;
  onSendDraft: (id: string) => void;
  onScheduleDraft: (id: string) => void;
  onCancelDraft: (id: string) => void;
  onDismissDraft: (id: string) => void;
  onDeleteDraft: (id: string) => void;
  onEditDraft: (draftId: string, content: string) => void;
  onCreateTemplate: (body: { title: string; content: string }) => void;
  onCreateDraftFromTemplate: (body: { title: string; content: string }) => void;
  onDeleteTemplate: (id: string) => void;
}

export function CommunicationSection({
  drafts,
  cannedMessages,
  cannedMessagesLoading,
  sendingDraftId,
  schedulingDraftId,
  creatingTemplate,
  creatingDraftFromTemplate,
  deletingTemplateId,
  editSaving,
  onSendDraft,
  onScheduleDraft,
  onCancelDraft,
  onDismissDraft,
  onDeleteDraft,
  onEditDraft,
  onCreateTemplate,
  onCreateDraftFromTemplate,
  onDeleteTemplate,
}: CommunicationSectionProps) {
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);

  return (
    <View>
      <SectionLabel label="Drafts" />

      {drafts.length === 0 ? (
        <Card className="p-4 mb-4">
          <AppText className="text-xs text-muted text-center py-4">
            No drafts yet. Drafts are generated from alerts or scans.
          </AppText>
        </Card>
      ) : (
        drafts.map((draft) => (
          <DraftCard
            key={draft.id}
            draft={draft}
            isSending={sendingDraftId === draft.id}
            isScheduling={schedulingDraftId === draft.id}
            onSend={onSendDraft}
            onEdit={setEditingDraft}
            onSchedule={onScheduleDraft}
            onCancel={onCancelDraft}
            onDismiss={onDismissDraft}
            onDelete={onDeleteDraft}
          />
        ))
      )}

      <EditDraftModal
        draft={editingDraft}
        isSaving={editSaving}
        onSave={(content) => {
          if (editingDraft) {
            onEditDraft(editingDraft.id, content);
            setEditingDraft(null);
          }
        }}
        onClose={() => setEditingDraft(null)}
      />

      <PrecastLibrary
        messages={cannedMessages}
        isLoading={cannedMessagesLoading}
        creating={creatingTemplate}
        drafting={creatingDraftFromTemplate}
        deletingId={deletingTemplateId}
        onCreateTemplate={onCreateTemplate}
        onCreateDraft={onCreateDraftFromTemplate}
        onDeleteTemplate={onDeleteTemplate}
      />
    </View>
  );
}
