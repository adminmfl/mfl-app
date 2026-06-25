import Feather from '@expo/vector-icons/Feather';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, Card, Spinner } from 'heroui-native';
import { AppText } from '../../../components/app-text';
import { SectionLabel } from '../../../components/section-label';
import { mflColors } from '../../../constants/colors';
import { useRole } from '../../../contexts/role-context';
import { useActivityCategories } from '../hooks/use-activity-categories';
import { useHostCustomActivities } from '../hooks/use-host-custom-activities';
import type {
  CustomActivityConfig
} from '../types/activity-config.model';
import {
  getApiErrorMessage,
} from '../utils/activity-config';
import { CustomActivityForm, DEFAULT_FORM, ActivityFormState } from './custom-activity-form';
import { CustomActivityCard } from './custom-activity-card';

interface Props {
  leagueId: string;
}

export function SettingsCustomActivitiesSection({ leagueId }: Props) {
  const { isHost, isGovernor, availableRoles } = useRole();
  const canManage =
    isHost ||
    isGovernor ||
    availableRoles.includes('host') ||
    availableRoles.includes('governor');
  const categoriesQuery = useActivityCategories();
  const customActivities = useHostCustomActivities(leagueId);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ActivityFormState>(DEFAULT_FORM);
  const [successMsg, setSuccessMsg] = useState('');

  const activeActivities = (customActivities.data ?? []).filter(
    (activity) => activity.is_active,
  );
  const isSaving =
    customActivities.createMutation.isPending ||
    customActivities.updateMutation.isPending;

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const startCreate = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setShowForm(true);
    setSuccessMsg('');
  };

  const startEdit = (activity: CustomActivityConfig) => {
    setForm({
      activity_name: activity.activity_name,
      description: activity.description ?? '',
      category_id: activity.category_id ?? '',
      measurement_type: activity.measurement_type,
      requires_proof: activity.requires_proof,
      requires_notes: activity.requires_notes,
    });
    setEditingId(activity.custom_activity_id);
    setShowForm(true);
    setSuccessMsg('');
  };

  const handleSubmit = () => {
    const name = form.activity_name.trim();
    if (name.length < 2) {
      Alert.alert('Validation Error', 'Activity name is required.');
      return;
    }

    setSuccessMsg('');
    if (editingId) {
      customActivities.updateMutation.mutate(
        {
          custom_activity_id: editingId,
          activity_name: name,
          description: form.description.trim() || undefined,
          category_id: form.category_id || null,
          measurement_type: form.measurement_type,
          requires_proof: form.requires_proof,
          requires_notes: form.requires_notes,
        },
        {
          onSuccess: () => {
            resetForm();
            setSuccessMsg('Custom activity updated.');
          },
          onError: (error) =>
            Alert.alert(
              'Save Failed',
              getApiErrorMessage(error, 'Failed to update custom activity.'),
            ),
        },
      );
      return;
    }

    customActivities.createMutation.mutate(
      {
        activity_name: name,
        description: form.description.trim() || undefined,
        category_id: form.category_id || undefined,
        measurement_type: form.measurement_type,
        requires_proof: form.requires_proof,
        requires_notes: form.requires_notes,
      },
      {
        onSuccess: () => {
          resetForm();
          setSuccessMsg('Custom activity created.');
        },
        onError: (error) =>
          Alert.alert(
            'Create Failed',
            getApiErrorMessage(error, 'Failed to create custom activity.'),
          ),
      },
    );
  };

  const handleDelete = (activity: CustomActivityConfig) => {
    Alert.alert(
      'Delete Activity',
      `Delete "${activity.activity_name}"? This removes it from any leagues using it and cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSuccessMsg('');
            customActivities.deleteMutation.mutate(
              activity.custom_activity_id,
              {
                onSuccess: () => setSuccessMsg('Custom activity deleted.'),
                onError: (error) =>
                  Alert.alert(
                    'Delete Failed',
                    getApiErrorMessage(
                      error,
                      'Failed to delete custom activity.',
                    ),
                  ),
              },
            );
          },
        },
      ],
    );
  };

  return (
    <View className="gap-3">
      <SectionLabel
        label="CUSTOM ACTIVITIES"
        actionLabel={canManage ? (showForm ? 'Cancel' : 'Add') : undefined}
        onAction={canManage ? (showForm ? resetForm : startCreate) : undefined}
      />

      <Card className="p-4 gap-4">
        <View>
          <AppText className="text-base font-bold text-foreground">
            Host-Created Activities
          </AppText>
          <AppText className="text-xs text-muted mt-0.5">
            Create reusable activities with category, measurement, proof, and
            notes rules.
          </AppText>
        </View>

        {successMsg ? (
          <View
            className="rounded-lg p-3"
            style={{ backgroundColor: mflColors.brandLight }}
          >
            <AppText
              className="text-sm font-medium"
              style={{ color: mflColors.brand }}
            >
              {successMsg}
            </AppText>
          </View>
        ) : null}

        {customActivities.isError ? (
          <View
            className="rounded-lg p-3"
            style={{ backgroundColor: mflColors.dangerLight }}
          >
            <AppText className="text-sm" style={{ color: mflColors.danger }}>
              {getApiErrorMessage(
                customActivities.error,
                'Failed to load custom activities.',
              )}
            </AppText>
          </View>
        ) : null}

        {showForm ? (
          <CustomActivityForm
            form={form}
            onChange={(next) => setForm((prev) => ({ ...prev, ...next }))}
            categories={categoriesQuery.data ?? []}
            categoriesLoading={categoriesQuery.isLoading}
            categoriesError={categoriesQuery.isError}
            isSaving={isSaving}
            submitLabel={editingId ? 'Save Changes' : 'Create Activity'}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        ) : null}

        {customActivities.isLoading ? (
          <View className="items-center py-6">
            <Spinner size="sm" />
            <AppText className="text-sm text-muted mt-2">
              Loading custom activities...
            </AppText>
          </View>
        ) : null}

        {!customActivities.isLoading && activeActivities.length === 0 ? (
          <View
            className="items-center rounded-lg border p-5"
            style={{ borderColor: mflColors.border }}
          >
            <Feather name="plus-circle" size={24} color={mflColors.textMuted} />
            <AppText className="text-sm text-muted mt-2 text-center">
              No custom activities yet.
            </AppText>
            {canManage && !showForm ? (
              <Button
                variant="primary"
                size="sm"
                onPress={startCreate}
                className="mt-3"
              >
                <Button.Label>Add Activity</Button.Label>
              </Button>
            ) : null}
          </View>
        ) : null}

        <View className="gap-3">
          {activeActivities.map((activity) => (
            <CustomActivityCard
              key={activity.custom_activity_id}
              activity={activity}
              canManage={canManage}
              isDeleting={customActivities.deleteMutation.isPending}
              onEdit={() => startEdit(activity)}
              onDelete={() => handleDelete(activity)}
            />
          ))}
        </View>
      </Card>
    </View>
  );
}
