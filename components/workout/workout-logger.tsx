'use client';

import { useState } from 'react';
import { Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCreateWorkout, useWorkouts } from '@/lib/hooks/use-workouts';
import { useSettings } from '@/lib/hooks/use-settings';
import { useRecalculateStreak } from '@/lib/hooks/use-streak';
import { useUserProfile } from '@/lib/hooks/use-profile';
import { generateId } from '@/lib/storage';
import { getDefaultWorkouts } from '@/lib/constants/workouts';
import type { WorkoutType, Exercise, ExerciseSet } from '@/lib/types/workout';
import { toast } from 'sonner';

type Props = {
  date: string;
  workoutType: WorkoutType;
  customWorkout?: { name: string; exercises: { name: string; defaultWeight: number }[] };
  onComplete?: () => void;
};

export function WorkoutLogger({ date, workoutType, customWorkout, onComplete }: Props) {
  const { data: settings } = useSettings();
  const { data: userProfile } = useUserProfile();
  const { data: allWorkouts = [] } = useWorkouts();
  const createWorkout = useCreateWorkout();
  const recalculateStreak = useRecalculateStreak();

  const DEFAULT_WORKOUTS = getDefaultWorkouts(userProfile);
  const template = customWorkout || DEFAULT_WORKOUTS.find((w: any) => w.type === workoutType);
  const setsPerExercise = 3;

  const [exercises, setExercises] = useState<Exercise[]>(
    template?.exercises.map((ex: any) => ({
      id: generateId(),
      name: ex.name,
      sets: Array.from({ length: setsPerExercise }, () => ({
        id: generateId(),
        reps: 10,
        weight: ex.defaultWeight,
        completed: false,
      })),
    })) || []
  );

  const handleAddSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  id: generateId(),
                  reps: 10,
                  weight: ex.sets[ex.sets.length - 1]?.weight || 0,
                  completed: false,
                },
              ],
            }
          : ex
      )
    );
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
          : ex
      )
    );
  };

  const handleUpdateSet = (
    exerciseId: string,
    setId: string,
    field: keyof ExerciseSet,
    value: number | boolean
  ) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId ? { ...s, [field]: value } : s
              ),
            }
          : ex
      )
    );
  };

  const handleAddExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        id: generateId(),
        name: 'New Exercise',
        sets: [
          {
            id: generateId(),
            reps: 10,
            weight: 0,
            completed: false,
          },
        ],
      },
    ]);
  };

  const handleUpdateExerciseName = (exerciseId: string, name: string) => {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === exerciseId ? { ...ex, name } : ex))
    );
  };

  const handleSaveWorkout = () => {
    if (exercises.length === 0) {
      toast.error('Add at least one exercise');
      return;
    }

    createWorkout.mutate(
      {
        date,
        workoutType,
        customWorkoutName: customWorkout?.name,
        exercises,
      },
      {
        onSuccess: () => {
          // Recalculate streak with all workout dates including the new one
          const allDates = [...allWorkouts.map(w => w.date), date];
          const uniqueDates = [...new Set(allDates)].sort();
          recalculateStreak.mutate(uniqueDates);
          toast.success('Workout logged successfully!');
          onComplete?.();
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{template?.name || workoutType}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="space-y-3">
            <Input
              value={exercise.name}
              onChange={(e) => handleUpdateExerciseName(exercise.id, e.target.value)}
              className="font-semibold"
            />
            <div className="space-y-2">
              {exercise.sets.map((set, idx) => (
                <div key={set.id} className="flex items-center gap-2">
                  <span className="text-sm font-medium w-12">Set {idx + 1}</span>
                  <Input
                    type="number"
                    value={set.reps}
                    onChange={(e) =>
                      handleUpdateSet(
                        exercise.id,
                        set.id,
                        'reps',
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-20"
                    placeholder="Reps"
                  />
                  <span className="text-sm text-muted-foreground">×</span>
                  <Input
                    type="number"
                    value={set.weight}
                    onChange={(e) =>
                      handleUpdateSet(
                        exercise.id,
                        set.id,
                        'weight',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-24"
                    placeholder="Weight"
                  />
                  <span className="text-sm text-muted-foreground">kg</span>
                  <Button
                    variant={set.completed ? 'default' : 'outline'}
                    size="icon"
                    onClick={() =>
                      handleUpdateSet(exercise.id, set.id, 'completed', !set.completed)
                    }
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSet(exercise.id, set.id)}
                    disabled={exercise.sets.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddSet(exercise.id)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Set
              </Button>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={handleAddExercise}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Exercise
        </Button>
        <Button
          onClick={handleSaveWorkout}
          disabled={createWorkout.isPending}
          className="w-full"
          size="lg"
        >
          {createWorkout.isPending ? 'Saving...' : 'Complete Workout'}
        </Button>
      </CardContent>
    </Card>
  );
}
