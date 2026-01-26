'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItem, setItem, generateId } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { workoutLogSchema } from '@/lib/validators/workout';
import type { WorkoutLog, WorkoutLogInput } from '@/lib/types/workout';

const QUERY_KEY = ['workouts'];

function getWorkouts(): WorkoutLog[] {
  return getItem<WorkoutLog[]>(STORAGE_KEYS.WORKOUTS, []);
}

function saveWorkouts(workouts: WorkoutLog[]): void {
  setItem(STORAGE_KEYS.WORKOUTS, workouts);
}

export function useWorkouts() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getWorkouts,
  });
}

export function useWorkoutsByDate(date: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'by-date', date],
    queryFn: () => {
      const workouts = getWorkouts();
      return workouts.filter((w) => w.date === date);
    },
  });
}

export function useWorkoutsByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'range', startDate, endDate],
    queryFn: () => {
      const workouts = getWorkouts();
      return workouts.filter((w) => w.date >= startDate && w.date <= endDate);
    },
  });
}

export function useCreateWorkout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: WorkoutLogInput) => {
      const validated = workoutLogSchema.parse(input);
      const workouts = getWorkouts();

      const newWorkout: WorkoutLog = {
        id: generateId(),
        ...validated,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveWorkouts([...workouts, newWorkout]);
      return newWorkout;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateWorkout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WorkoutLogInput> }) => {
      const workouts = getWorkouts();
      const index = workouts.findIndex((w) => w.id === id);

      if (index === -1) throw new Error('Workout not found');

      workouts[index] = {
        ...workouts[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      saveWorkouts(workouts);
      return Promise.resolve(workouts[index]);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteWorkout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const workouts = getWorkouts();
      const filtered = workouts.filter((w) => w.id !== id);
      saveWorkouts(filtered);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
