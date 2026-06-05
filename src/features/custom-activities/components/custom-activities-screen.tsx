import { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card } from 'heroui-native';

import { AppText } from '../../../components/app-text';
import { ScreenScrollView } from '../../../components/screen-scroll-view';
import { ScreenState } from '../../../components/screen-state';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import { useActivityCategories } from '../hooks/use-activity-categories';
import { useCreateCustomActivity } from '../hooks/use-create-custom-activity';
import { useCustomActivities } from '../hooks/use-custom-activities';
import { useDeleteCustomActivity } from '../hooks/use-delete-custom-activity';
import { useUpdateCustomActivity } from '../hooks/use-update-custom-activity';
import type { CustomActivity } from '../types/custom-activity.model';
import {
  getCustomActivityEditForm,
  getDefaultCustomActivityForm,
  toCustomActivityInput,
  validateCustomActivityForm,
  type CustomActivityFormData,
} from '../utils/custom-activity-form';
import { CustomActivitiesHeader } from './custom-activities-header';
import { CustomActivityCard } from './custom-activity-card';
import { CustomActivityFormCard } from './custom-activity-form-card';

type EditorState =
  | { mode: 'create' }
  | { mode: 'edit'; activity: CustomActivity }
  | null;

interface CustomActivitiesScreenProps {
  leagueName: string;
  onBack: () => void;
}

export function CustomActivitiesScreen({
  leagueName,
  onBack,
}: CustomActivitiesScreenProps) {
  const insets = useSafeAreaInsets();
  const activitiesQuery = useCustomActivities();
  const categoriesQuery = useActivityCategories();
  const createMutation = useCreateCustomActivity();
  const updateMutation = useUpdateCustomActivity();
  const deleteMutation = useDeleteCustomActivity();

  const [editor, setEditor] = useState<EditorState>(null);
  const [form, setForm] = useState<CustomActivityFormData>(
    getDefaultCustomActivityForm,
  );

  const activeActivities = useMemo(
    () => (activitiesQuery.data ?? []).filter((activity) => activity.isActive),
    [activitiesQuery.data],
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const updateForm = (patch: Partial<CustomActivityFormData>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const openCreate = () => {
    setEditor({ mode: 'create' });
    setForm(getDefaultCustomActivityForm());
  };

  const openEdit = (activity: CustomActivity) => {
    setEditor({ mode: 'edit', activity });
    setForm(getCustomActivityEditForm(activity));
  };

  const closeEditor = () => {
    setEditor(null);
    setForm(getDefaultCustomActivityForm());
  };

  const handleSubmit = () => {
    if (!editor) return;

    const validationError = validateCustomActivityForm(form);
    if (validationError) {
      Alert.alert('Check Activity', validationError);
      return;
    }

    const input = toCustomActivityInput(form);

    if (editor.mode === 'create') {
      createMutation.mutate(input, {
        onSuccess: () => {
          Alert.alert('Activity Created', 'Custom activity created successfully.');
          closeEditor();
        },
        onError: (error) => {
          Alert.alert('Create Failed', error.message);
        },
      });
      return;
    }

    updateMutation.mutate(
      {
        customActivityId: editor.activity.customActivityId,
        ...input,
        categoryId: input.categoryId ?? null,
      },
      {
        onSuccess: () => {
          Alert.alert('Activity Updated', 'Custom activity updated successfully.');
          closeEditor();
        },
        onError: (error) => {
          Alert.alert('Save Failed', error.message);
        },
      },
    );
  };

  const confirmDelete = (activity: CustomActivity) => {
    Alert.alert(
      'Delete Activity',
      `Delete "${activity.activityName}"? This removes it from any leagues using it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(activity.customActivityId, {
              onSuccess: () => {
                Alert.alert('Activity Deleted', 'Custom activity deleted successfully.');
                if (
                  editor?.mode === 'edit' &&
                  editor.activity.customActivityId === activity.customActivityId
                ) {
                  closeEditor();
                }
              },
              onError: (error) => {
                Alert.alert('Delete Failed', error.message);
              },
            });
          },
        },
      ],
    );
  };

  const handleRefresh = async () => {
    await Promise.all([activitiesQuery.refetch(), categoriesQuery.refetch()]);
  };

  if (activitiesQuery.isLoading) {
    return <ScreenState screen="custom-activities" state="loading" />;
  }

  if (activitiesQuery.isError) {
    return (
      <ScreenState
        screen="custom-activities"
        state="error"
        message="Failed to load custom activities."
        actionLabel="Retry"
        onAction={() => activitiesQuery.refetch()}
      />
    );
  }

  return (
    <ScreenScrollView
      avoidKeyboard
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 32,
      }}
      onRefresh={handleRefresh}
    >
      <View className="gap-4 pb-12">
        <CustomActivitiesHeader
          leagueName={leagueName}
          activityCount={activeActivities.length}
          onBack={onBack}
        />

        {!editor ? (
          <Button
            variant="primary"
            size="lg"
            onPress={openCreate}
            style={{ backgroundColor: mflColors.brand }}
          >
            <Button.Label>Create Activity</Button.Label>
          </Button>
        ) : null}

        {editor ? (
          <CustomActivityFormCard
            title={editor.mode === 'create' ? 'Create Custom Activity' : 'Edit Activity'}
            submitLabel={editor.mode === 'create' ? 'Create Activity' : 'Save Changes'}
            form={form}
            categories={categoriesQuery.data ?? []}
            categoriesLoading={categoriesQuery.isLoading}
            categoriesError={categoriesQuery.isError}
            isSaving={isSaving}
            onChange={updateForm}
            onCancel={closeEditor}
            onSubmit={handleSubmit}
            onRetryCategories={() => {
              categoriesQuery.refetch();
            }}
          />
        ) : null}

        <View className="gap-3">
          <SectionLabel label="Your Activities" />
          {activeActivities.length === 0 ? (
            <EmptyActivities onCreate={openCreate} hideAction={!!editor} />
          ) : (
            activeActivities.map((activity) => (
              <CustomActivityCard
                key={activity.customActivityId}
                activity={activity}
                isDeleting={
                  deleteMutation.isPending &&
                  deleteMutation.variables === activity.customActivityId
                }
                deleteDisabled={deleteMutation.isPending || isSaving}
                onEdit={openEdit}
                onDelete={confirmDelete}
              />
            ))
          )}
        </View>
      </View>
    </ScreenScrollView>
  );
}

function EmptyActivities({
  onCreate,
  hideAction,
}: {
  onCreate: () => void;
  hideAction: boolean;
}) {
  return (
    <Card className="items-center gap-3 p-5">
      <AppText className="text-center text-sm text-muted">
        No custom activities yet.
      </AppText>
      {!hideAction ? (
        <Button
          variant="primary"
          size="md"
          onPress={onCreate}
          style={{ backgroundColor: mflColors.brand }}
        >
          <Button.Label>Create Custom Activity</Button.Label>
        </Button>
      ) : null}
    </Card>
  );
}
