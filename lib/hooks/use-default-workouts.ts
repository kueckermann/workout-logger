'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getItem, setItem } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import type { WorkoutType } from '@/lib/types/workout';

type ModifiedDefaults = {
  [key in WorkoutType]?: { name: string; exercises: { name: string; defaultWeight: number }[] };
};

const MODIFIED_DEFAULTS_KEY = ['modifiedDefaults'];

function getModifiedDefaults(): ModifiedDefaults {
  return getItem<ModifiedDefaults>(STORAGE_KEYS.MODIFIED_DEFAULTS, {});
}

function saveModifiedDefaults(modifiedDefaults: ModifiedDefaults): void {
  setItem(STORAGE_KEYS.MODIFIED_DEFAULTS, modifiedDefaults);
}

export function useModifiedDefaults() {
  return useQuery({
    queryKey: MODIFIED_DEFAULTS_KEY,
    queryFn: getModifiedDefaults,
    staleTime: 0, // Always refetch to ensure fresh data
  });
}

export function useUpdateDefaultWorkout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      type: WorkoutType;
      name: string;
      exercises: { name: string; defaultWeight: number }[];
    }) => {
      const current = getModifiedDefaults();
      const updated = {
        ...current,
        [input.type]: {
          name: input.name,
          exercises: input.exercises,
        },
      };
      saveModifiedDefaults(updated);
      return updated;
    },
    onSuccess: () => {
      // Invalidate modified defaults query to trigger re-render
      qc.invalidateQueries({ queryKey: MODIFIED_DEFAULTS_KEY });
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function useResetDefaultWorkout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (type: WorkoutType) => {
      const current = getModifiedDefaults();
      const updated = { ...current };
      delete updated[type];
      saveModifiedDefaults(updated);
      return type;
    },
    onSuccess: () => {
      // Invalidate modified defaults query to trigger re-render
      qc.invalidateQueries({ queryKey: MODIFIED_DEFAULTS_KEY });
      qc.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
