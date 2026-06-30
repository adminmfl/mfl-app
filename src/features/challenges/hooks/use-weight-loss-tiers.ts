import { useState, useCallback } from 'react';
import type { WeightLossTier } from '../types/challenge.model';

export function useWeightLossTiers(initialTiers: WeightLossTier[] = []) {
  const [tiers, setTiers] = useState<WeightLossTier[]>(initialTiers);

  const addTier = useCallback(() => {
    setTiers((prev) => {
      const highestThreshold =
        prev.length > 0 ? Math.max(...prev.map((t) => t.thresholdPercent)) : 0;
      return [...prev, { thresholdPercent: highestThreshold + 1, points: 0 }];
    });
  }, []);

  const removeTier = useCallback((index: number) => {
    setTiers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateTier = useCallback((index: number, field: keyof WeightLossTier, value: number) => {
    setTiers((prev) => {
      const updated = [...prev];
      const target = updated[index];
      if (!target) return prev;
      
      updated[index] = {
        thresholdPercent: field === 'thresholdPercent' ? value : target.thresholdPercent,
        points: field === 'points' ? value : target.points,
      };
      return updated;
    });
  }, []);

  const validateTiers = useCallback(() => {
    if (tiers.length === 0) return true;
    for (let i = 1; i < tiers.length; i++) {
      const current = tiers[i];
      const prev = tiers[i - 1];
      if (current && prev && current.thresholdPercent <= prev.thresholdPercent) {
        return false;
      }
    }
    return true;
  }, [tiers]);

  return {
    tiers,
    addTier,
    removeTier,
    updateTier,
    validateTiers,
  };
}
