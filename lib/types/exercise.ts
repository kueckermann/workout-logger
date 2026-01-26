export type MuscleGroup = 'arms' | 'shoulders' | 'chest' | 'back' | 'legs' | 'core';

export type ExerciseTemplate = {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  defaultWeight: number;
};

export const MUSCLE_GROUPS: { value: MuscleGroup; label: string }[] = [
  { value: 'arms', label: 'Arms' },
  { value: 'shoulders', label: 'Shoulders' },
  { value: 'chest', label: 'Chest' },
  { value: 'back', label: 'Back' },
  { value: 'legs', label: 'Legs' },
  { value: 'core', label: 'Core' },
];

export const DEFAULT_EXERCISES: ExerciseTemplate[] = [
  // Arms
  { id: 'bicep-curls', name: 'Bicep Curls', muscleGroup: 'arms', defaultWeight: 15 },
  { id: 'hammer-curls', name: 'Hammer Curls', muscleGroup: 'arms', defaultWeight: 15 },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', muscleGroup: 'arms', defaultWeight: 30 },
  { id: 'tricep-dips', name: 'Tricep Dips', muscleGroup: 'arms', defaultWeight: 0 },
  { id: 'skull-crushers', name: 'Skull Crushers', muscleGroup: 'arms', defaultWeight: 20 },

  // Shoulders
  { id: 'overhead-press', name: 'Overhead Press', muscleGroup: 'shoulders', defaultWeight: 40 },
  { id: 'lateral-raises', name: 'Lateral Raises', muscleGroup: 'shoulders', defaultWeight: 10 },
  { id: 'front-raises', name: 'Front Raises', muscleGroup: 'shoulders', defaultWeight: 10 },
  { id: 'face-pulls', name: 'Face Pulls', muscleGroup: 'shoulders', defaultWeight: 20 },
  { id: 'arnold-press', name: 'Arnold Press', muscleGroup: 'shoulders', defaultWeight: 15 },

  // Chest
  { id: 'bench-press', name: 'Bench Press', muscleGroup: 'chest', defaultWeight: 60 },
  { id: 'incline-press', name: 'Incline Dumbbell Press', muscleGroup: 'chest', defaultWeight: 20 },
  { id: 'chest-flyes', name: 'Chest Flyes', muscleGroup: 'chest', defaultWeight: 15 },
  { id: 'push-ups', name: 'Push-ups', muscleGroup: 'chest', defaultWeight: 0 },
  { id: 'cable-crossover', name: 'Cable Crossover', muscleGroup: 'chest', defaultWeight: 15 },

  // Back
  { id: 'deadlift', name: 'Deadlift', muscleGroup: 'back', defaultWeight: 80 },
  { id: 'pull-ups', name: 'Pull-ups / Lat Pulldown', muscleGroup: 'back', defaultWeight: 50 },
  { id: 'barbell-row', name: 'Barbell Row', muscleGroup: 'back', defaultWeight: 60 },
  { id: 'seated-row', name: 'Seated Cable Row', muscleGroup: 'back', defaultWeight: 50 },
  { id: 't-bar-row', name: 'T-Bar Row', muscleGroup: 'back', defaultWeight: 40 },

  // Legs
  { id: 'squat', name: 'Squat', muscleGroup: 'legs', defaultWeight: 80 },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', muscleGroup: 'legs', defaultWeight: 60 },
  { id: 'leg-press', name: 'Leg Press', muscleGroup: 'legs', defaultWeight: 100 },
  { id: 'leg-curl', name: 'Leg Curl', muscleGroup: 'legs', defaultWeight: 40 },
  { id: 'calf-raises', name: 'Calf Raises', muscleGroup: 'legs', defaultWeight: 50 },
  { id: 'lunges', name: 'Lunges', muscleGroup: 'legs', defaultWeight: 20 },

  // Core
  { id: 'planks', name: 'Planks', muscleGroup: 'core', defaultWeight: 0 },
  { id: 'crunches', name: 'Crunches', muscleGroup: 'core', defaultWeight: 0 },
  { id: 'russian-twists', name: 'Russian Twists', muscleGroup: 'core', defaultWeight: 10 },
  { id: 'leg-raises', name: 'Leg Raises', muscleGroup: 'core', defaultWeight: 0 },
  { id: 'cable-crunches', name: 'Cable Crunches', muscleGroup: 'core', defaultWeight: 30 },
];
