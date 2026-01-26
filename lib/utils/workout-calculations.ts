import type { WorkoutLog, Exercise } from '@/lib/types/workout';

export function calculateExerciseVolume(exercise: Exercise): number {
  return exercise.sets.reduce((total, set) => {
    return total + (set.reps * set.weight);
  }, 0);
}

export function calculateTotalVolume(workout: WorkoutLog): number {
  return workout.exercises.reduce((total, exercise) => {
    return total + calculateExerciseVolume(exercise);
  }, 0);
}

export function calculateCompletedExercises(workout: WorkoutLog): number {
  return workout.exercises.filter(exercise =>
    exercise.sets.length > 0 && exercise.sets.some(set => set.completed)
  ).length;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const seconds = Math.floor((minutes - Math.floor(minutes)) * 60);
  return `${hours}h ${mins}m ${seconds}s`;
}

export function getVolumeComparison(
  currentWorkout: WorkoutLog,
  previousWorkouts: WorkoutLog[]
): { difference: number; isIncrease: boolean } | null {
  const previousSameType = previousWorkouts.filter(
    w => w.workoutType === currentWorkout.workoutType && w.date < currentWorkout.date
  );

  if (previousSameType.length === 0) return null;

  const currentVolume = calculateTotalVolume(currentWorkout);
  const previousVolume = calculateTotalVolume(previousSameType[0]);

  if (currentVolume === previousVolume) return null;

  return {
    difference: currentVolume - previousVolume,
    isIncrease: currentVolume > previousVolume,
  };
}
