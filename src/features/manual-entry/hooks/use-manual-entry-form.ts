import * as ImagePicker from 'expo-image-picker';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { useSaveManualEntry } from './use-save-manual-entry';
import { uploadManualEntryProof } from '../services/manual-entry.service';
import type {
  ManualEntryForm,
  ManualWeekRow,
  PickedProofImage,
} from '../types/manual-entry';
import {
  computeRunRateFromForm,
  getWorkoutCategory,
  makeEmptyManualEntryForm,
  toNumber,
} from '../utils/manual-entry-utils';
import type { LeagueActivity } from '../../leagues/hooks/use-league-activities';

interface UseManualEntryFormProps {
  leagueId: string;
  selectedMemberId: string;
  activities: LeagueActivity[];
  onSaveSuccess: () => void;
}

export function useManualEntryForm({
  leagueId,
  selectedMemberId,
  activities,
  onSaveSuccess,
}: UseManualEntryFormProps) {
  const saveMutation = useSaveManualEntry();

  const [editRow, setEditRow] = useState<ManualWeekRow | null>(null);
  const [editMode, setEditMode] = useState<'add' | 'overwrite'>('add');
  const [form, setForm] = useState<ManualEntryForm>(() => makeEmptyManualEntryForm());
  const [proofImage, setProofImage] = useState<PickedProofImage | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  const selectedActivity = useMemo(
    () => activities.find((activity) => activity.value === form.workoutType),
    [activities, form.workoutType],
  );

  const workoutCategory = getWorkoutCategory(
    form.type,
    form.workoutType,
    selectedActivity?.measurement_type,
  );

  const showDuration =
    workoutCategory !== 'rest' &&
    workoutCategory !== 'steps' &&
    workoutCategory !== 'golf' &&
    workoutCategory !== 'none';
  const showDistance = workoutCategory === 'run' || workoutCategory === 'cycling';
  const showSteps = workoutCategory === 'steps';
  const showHoles = workoutCategory === 'golf';
  const computedRR = computeRunRateFromForm(form);
  const isBusy = saveMutation.isPending || isUploadingProof;

  const handleOpenRow = useCallback((row: ManualWeekRow) => {
    const mode = row.state === 'approved' ? 'overwrite' : 'add';
    setEditMode(mode);
    setEditRow(row);
    setForm(makeEmptyManualEntryForm(row.entry));
    setProofImage(null);
  }, []);

  const handleFormChange = useCallback((patch: Partial<ManualEntryForm>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      if (patch.type === 'rest') {
        return {
          ...next,
          workoutType: '',
          duration: '',
          distance: '',
          steps: '',
          holes: '',
          proofUrl: '',
        };
      }
      return next;
    });
  }, []);

  const handlePickImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please grant photo library access to upload proof.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const name = asset.fileName ?? `manual_entry_proof_${Date.now()}.jpg`;
      const rawType = (asset as { mimeType?: string }).mimeType ?? asset.type;
      setProofImage({
        uri: asset.uri,
        name,
        type: rawType?.startsWith('image/') ? rawType : 'image/jpeg',
      });
    }
  }, []);

  const validateForm = useCallback((): string | null => {
    const duration = toNumber(form.duration);
    const distance = toNumber(form.distance);
    const steps = toNumber(form.steps);
    const holes = toNumber(form.holes);

    if (duration !== null && (duration < 0 || duration > 1440)) return 'Duration must be between 0 and 1440 minutes.';
    if (distance !== null && (distance < 0 || distance > 1000)) return 'Distance must be between 0 and 1000 km.';
    if (steps !== null && (steps < 0 || steps > 500000 || !Number.isInteger(steps))) return 'Steps must be a whole number between 0 and 500,000.';
    if (holes !== null && (holes < 0 || holes > 36 || !Number.isInteger(holes))) return 'Holes must be a whole number between 0 and 36.';

    if (form.type === 'workout') {
      if (!form.workoutType) return 'Select a workout type.';
      if (workoutCategory === 'steps' && (!steps || steps <= 0)) return 'Steps are required for a steps workout.';
      if (workoutCategory === 'golf' && (!holes || holes <= 0)) return 'Holes are required for a golf workout.';
      if (workoutCategory === 'run' || workoutCategory === 'cycling') {
        const hasDuration = typeof duration === 'number' && duration > 0;
        const hasDistance = typeof distance === 'number' && distance > 0;
        if ((hasDuration && hasDistance) || (!hasDuration && !hasDistance)) return 'Provide either duration or distance, not both.';
      }
      if (workoutCategory === 'other' && (!duration || duration <= 0)) return 'Duration is required for this workout.';
      if (computedRR < 1) return 'Activity RR must be at least 1.0 based on the entered values.';
      if (editMode === 'overwrite' && !proofImage && !form.proofUrl.trim()) return 'Proof image is required when overwriting an entry.';
    }

    return null;
  }, [computedRR, editMode, form, proofImage, workoutCategory]);

  const handleSubmit = useCallback(async () => {
    if (!leagueId || !selectedMemberId || !editRow) return;

    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Check Entry', validationError);
      return;
    }

    let finalProofUrl = form.proofUrl.trim() || null;
    if (proofImage) {
      setIsUploadingProof(true);
      try {
        finalProofUrl = await uploadManualEntryProof(leagueId, proofImage);
      } catch (error) {
        Alert.alert('Upload Failed', error instanceof Error ? error.message : 'Could not upload proof image.');
        setIsUploadingProof(false);
        return;
      }
      setIsUploadingProof(false);
    }

    const duration = showDuration ? toNumber(form.duration) : null;
    const distance = showDistance ? toNumber(form.distance) : null;
    const steps = showSteps ? toNumber(form.steps) : null;
    const holes = showHoles ? toNumber(form.holes) : null;

    saveMutation.mutate(
      {
        leagueId,
        data: {
          league_member_id: selectedMemberId,
          date: editRow.date,
          type: form.type,
          workout_type: form.type === 'workout' ? form.workoutType || null : null,
          duration,
          distance,
          steps,
          holes,
          rr_value: computedRR,
          proof_url: form.type === 'workout' ? finalProofUrl : null,
          notes: form.notes.trim() || null,
          overwriteExisting: true,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Saved', editMode === 'overwrite' ? 'Entry overwritten.' : 'Entry added.');
          setEditRow(null);
          setProofImage(null);
          onSaveSuccess();
        },
        onError: (error) => {
          Alert.alert('Save Failed', error.message || 'Could not save entry.');
        },
      },
    );
  }, [
    computedRR,
    editMode,
    editRow,
    form,
    leagueId,
    proofImage,
    saveMutation,
    selectedMemberId,
    showDistance,
    showDuration,
    showHoles,
    showSteps,
    validateForm,
    onSaveSuccess,
  ]);

  const handleCancelEdit = useCallback(() => {
    setEditRow(null);
    setProofImage(null);
  }, []);

  const handleRemoveImage = useCallback(() => setProofImage(null), []);

  return {
    editRow,
    editMode,
    form,
    proofImage,
    isBusy,
    selectedActivity,
    workoutCategory,
    showDuration,
    showDistance,
    showSteps,
    showHoles,
    computedRR,
    handleOpenRow,
    handleFormChange,
    handlePickImage,
    handleRemoveImage,
    handleCancelEdit,
    handleSubmit,
  };
}
