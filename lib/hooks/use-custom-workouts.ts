'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItem, setItem } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { generateId } from '@/lib/storage';

export type CustomWorkout = {
  id: string;
  name: string;
  exercises: { name: string; defaultWeight: number }[];
  createdAt: string;
};

const QUERY_KEY = ['customWorkouts'];

function getCustomWorkouts(): CustomWorkout[] {
  return getItem<CustomWorkout[]>(STORAGE_KEYS.CUSTOM_WORKOUTS, []);
}

function saveCustomWorkouts(workouts: CustomWorkout[]): void {
  setItem(STORAGE_KEYS.CUSTOM_WORKOUTS, workouts);
}

export function useCustomWorkouts() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getCustomWorkouts,
  });
}

export function useCreateCustomWorkout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { name: string; exercises: { name: string; defaultWeight: number }[] }) => {
      const current = getCustomWorkouts();
      const newWorkout: CustomWorkout = {
        id: generateId(),
        name: input.name,
        exercises: input.exercises,
        createdAt: new Date().toISOString(),
      };
      const updated = [...current, newWorkout];
      saveCustomWorkouts(updated);
      return newWorkout;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateCustomWorkout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; name: string; exercises: { name: string; defaultWeight: number }[] }) => {
      const current = getCustomWorkouts();
      const updated = current.map((w) =>
        w.id === input.id
          ? { ...w, name: input.name, exercises: input.exercises }
          : w
      );
      saveCustomWorkouts(updated);
      return updated.find((w) => w.id === input.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteCustomWorkout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const current = getCustomWorkouts();
      const updated = current.filter((w) => w.id !== id);
      saveCustomWorkouts(updated);
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
