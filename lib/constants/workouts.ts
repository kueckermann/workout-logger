import type { WorkoutTemplate, AppSettings, UserProfile, WorkoutType } from '@/lib/types/workout';
import { calculateDefaultWeight } from '@/lib/utils/weight-calculator';
import { getItem } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage/keys';

type ModifiedDefaults = {
  [key in WorkoutType]?: { name: string; exercises: { name: string; defaultWeight: number }[] };
};

export const getDefaultWorkouts = (profile?: UserProfile | null): WorkoutTemplate[] => {
  const calculateWeight = (exerciseName: string) => {
    if (profile) {
      return calculateDefaultWeight(exerciseName, profile);
    }
    return 20; // Default fallback weight
  };

  const baseWorkouts: WorkoutTemplate[] = [
    {
      type: 'push' as WorkoutType,
      name: 'Push Day',
      exercises: [
        { name: 'Bench Press', defaultWeight: calculateWeight('Bench Press') },
        { name: 'Overhead Press', defaultWeight: calculateWeight('Overhead Press') },
        { name: 'Incline Dumbbell Press', defaultWeight: calculateWeight('Incline Dumbbell Press') },
        { name: 'Tricep Pushdown', defaultWeight: calculateWeight('Tricep Pushdown') },
        { name: 'Lateral Raises', defaultWeight: calculateWeight('Lateral Raises') },
      ],
    },
    {
      type: 'pull' as WorkoutType,
      name: 'Pull Day',
      exercises: [
        { name: 'Deadlift', defaultWeight: calculateWeight('Deadlift') },
        { name: 'Pull-ups / Lat Pulldown', defaultWeight: calculateWeight('Pull-ups / Lat Pulldown') },
        { name: 'Barbell Row', defaultWeight: calculateWeight('Barbell Row') },
        { name: 'Face Pulls', defaultWeight: calculateWeight('Face Pulls') },
        { name: 'Bicep Curls', defaultWeight: calculateWeight('Bicep Curls') },
      ],
    },
    {
      type: 'legs' as WorkoutType,
      name: 'Leg Day',
      exercises: [
        { name: 'Squat', defaultWeight: calculateWeight('Squat') },
        { name: 'Romanian Deadlift', defaultWeight: calculateWeight('Romanian Deadlift') },
        { name: 'Leg Press', defaultWeight: calculateWeight('Leg Press') },
        { name: 'Leg Curls', defaultWeight: calculateWeight('Leg Curls') },
        { name: 'Calf Raises', defaultWeight: calculateWeight('Calf Raises') },
      ],
    },
  ];

  // Merge with modified defaults from localStorage
  const modifiedDefaults = getItem<ModifiedDefaults>(STORAGE_KEYS.MODIFIED_DEFAULTS, {});

  return baseWorkouts.map((workout: WorkoutTemplate) => {
    const modified = modifiedDefaults[workout.type as WorkoutType];
    if (modified) {
      return {
        ...workout,
        name: modified.name,
        exercises: modified.exercises,
      };
    }
    return workout;
  });
}

export const DEFAULT_WORKOUTS = getDefaultWorkouts();

export const DEFAULT_SETTINGS = {
  volumeLevel: 'low' as const,
  schedule: {
    1: 'pull' as const,
    3: 'push' as const,
    5: 'legs' as const,
  },
  defaultRestTime: 90,
  viewMode: 'desktop' as const,
  autoRestTimer: false,
};

export const REST_TIME_OPTIONS = [30, 60, 90, 120, 180];
