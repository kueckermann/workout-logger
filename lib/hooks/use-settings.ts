'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItem, setItem } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { appSettingsSchema } from '@/lib/validators/workout';
import { DEFAULT_SETTINGS } from '@/lib/constants/workouts';
import type { AppSettings, AppSettingsInput } from '@/lib/types/workout';

const QUERY_KEY = ['settings'];

function getSettings(): AppSettings {
  return getItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

function saveSettings(settings: AppSettings): void {
  setItem(STORAGE_KEYS.SETTINGS, settings);
}

export function useSettings() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getSettings,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<AppSettingsInput>) => {
      const current = getSettings();
      const updated = { ...current, ...input };
      const validated = appSettingsSchema.parse(updated);
      saveSettings(validated);
      return validated;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
