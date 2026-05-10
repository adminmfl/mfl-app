import { useCallback, useEffect, useRef, useState } from 'react';
import { mmkv, removeMMKVKey } from '../../../core/storage/mmkv';
import { WizardData, getDefaultWizardData } from './quick-start.types';

const STORAGE_KEY = 'mfl_wizard_draft';
const DEBOUNCE_MS = 500;

function loadDraft(): WizardData | null {
  try {
    const raw = mmkv.getString(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WizardData;
    if (typeof parsed.currentStep !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveDraft(data: WizardData) {
  try {
    mmkv.set(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail
  }
}

export function clearDraft() {
  removeMMKVKey(STORAGE_KEY);
}

export function useWizardDraft() {
  const [data, setData] = useState<WizardData>(getDefaultWizardData);
  const [hasDraft, setHasDraft] = useState(() => {
    const draft = loadDraft();
    return Boolean(draft && draft.currentStep > 1);
  });
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

  // Auto-save with debounce
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      saveDraft(data);
      setDraftStatus('saved');
      setTimeout(() => setDraftStatus('idle'), 1500);
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data]);

  const resumeDraft = useCallback(() => {
    const existing = loadDraft();
    if (existing) {
      setDraftStatus('saving');
      setData(existing);
      setHasDraft(false);
    }
  }, []);

  const discardDraft = useCallback(() => {
    clearDraft();
    setHasDraft(false);
    setDraftStatus('idle');
    setData(getDefaultWizardData());
  }, []);

  const updateData = useCallback((partial: Partial<WizardData>) => {
    setDraftStatus('saving');
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const setStep = useCallback((step: number) => {
    setDraftStatus('saving');
    setData((prev) => ({ ...prev, currentStep: step }));
  }, []);

  return {
    data,
    updateData,
    setStep,
    hasDraft,
    resumeDraft,
    discardDraft,
    draftStatus,
  };
}
