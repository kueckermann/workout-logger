'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItem, setItem } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { differenceInDays, parseISO } from 'date-fns';
import type { StreakData } from '@/lib/types/workout';

const QUERY_KEY = ['streak'];

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastWorkoutDate: null,
};

function getStreak(): StreakData {
  return getItem<StreakData>(STORAGE_KEYS.STREAK, DEFAULT_STREAK);
}

function saveStreak(streak: StreakData): void {
  setItem(STORAGE_KEYS.STREAK, streak);
}

export function useStreak() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getStreak,
  });
}

export function useRecalculateStreak() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (workoutDates: string[]) => {
      if (workoutDates.length === 0) {
        const emptyStreak: StreakData = {
          currentStreak: 0,
          longestStreak: 0,
          lastWorkoutDate: null,
        };
        saveStreak(emptyStreak);
        return emptyStreak;
      }

      const uniqueDates = [...new Set(workoutDates)].sort();
      const parsedDates = uniqueDates.map(d => parseISO(d));

      let currentStreak = 1;
      let longestStreak = 1;
      let tempStreak = 1;

      for (let i = 1; i < parsedDates.length; i++) {
        const daysDiff = differenceInDays(parsedDates[i], parsedDates[i - 1]);

        if (daysDiff === 1) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 1;
        }
      }

      const today = new Date();
      const lastWorkoutDate = parsedDates[parsedDates.length - 1];
      const daysSinceLastWorkout = differenceInDays(today, lastWorkoutDate);

      if (daysSinceLastWorkout <= 1) {
        currentStreak = tempStreak;
      } else {
        currentStreak = 0;
      }

      const newStreak: StreakData = {
        currentStreak,
        longestStreak,
        lastWorkoutDate: uniqueDates[uniqueDates.length - 1],
      };

      saveStreak(newStreak);
      return newStreak;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateStreak() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (workoutDate: string) => {
      const streak = getStreak();
      const today = parseISO(workoutDate);

      if (!streak.lastWorkoutDate) {
        const newStreak: StreakData = {
          currentStreak: 1,
          longestStreak: 1,
          lastWorkoutDate: workoutDate,
        };
        saveStreak(newStreak);
        return newStreak;
      }

      const lastDate = parseISO(streak.lastWorkoutDate);
      const daysDiff = differenceInDays(today, lastDate);

      let newCurrentStreak = streak.currentStreak;

      if (daysDiff === 0) {
        return streak;
      } else if (daysDiff === 1) {
        newCurrentStreak = streak.currentStreak + 1;
      } else {
        newCurrentStreak = 1;
      }

      const newStreak: StreakData = {
        currentStreak: newCurrentStreak,
        longestStreak: Math.max(newCurrentStreak, streak.longestStreak),
        lastWorkoutDate: workoutDate,
      };

      saveStreak(newStreak);
      return newStreak;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
