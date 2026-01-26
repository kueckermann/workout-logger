'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Check, ChevronLeft, Save, X, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCreateWorkout, useWorkouts } from '@/lib/hooks/use-workouts';
import { useSettings } from '@/lib/hooks/use-settings';
import { useUpdateStreak } from '@/lib/hooks/use-streak';
import { useUserProfile } from '@/lib/hooks/use-profile';
import { generateId } from '@/lib/storage';
import { getDefaultWorkouts } from '@/lib/constants/workouts';
import type { WorkoutType, Exercise, ExerciseSet } from '@/lib/types/workout';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { WorkoutSummary } from './workout-summary';
import type { WorkoutLog } from '@/lib/types/workout';

const TIMEZONE = 'Europe/Tallinn';

type Props = {
  workoutType: WorkoutType;
  customWorkout?: { name: string; exercises: { name: string; defaultWeight: number }[] };
  onBack: () => void;
  onComplete: () => void;
};

export function ActiveWorkout({ workoutType, customWorkout, onBack, onComplete }: Props) {
  const { data: settings } = useSettings();
  const { data: userProfile } = useUserProfile();
  const { data: allWorkouts = [] } = useWorkouts();
  const createWorkout = useCreateWorkout();
  const updateStreak = useUpdateStreak();

  const DEFAULT_WORKOUTS = getDefaultWorkouts(userProfile);
  const template = customWorkout || DEFAULT_WORKOUTS.find((w: any) => w.type === workoutType);
  const setsPerExercise = 3;
  const today = format(toZonedTime(new Date(), TIMEZONE), 'yyyy-MM-dd');
  const [startTime] = useState(toZonedTime(new Date(), TIMEZONE).toISOString());

  // Find all workouts of the same type (excluding today's workout being created)
  const sameTypeWorkouts = allWorkouts.filter(w => {
    const sameWorkout = customWorkout?.name
      ? w.customWorkoutName === customWorkout.name
      : w.workoutType === workoutType;
    return sameWorkout && w.date < today;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get the last workout for pre-filling data
  const lastWorkout = sameTypeWorkouts[0];

  // Count total workouts of this type (excluding today)
  const totalWorkoutsOfType = sameTypeWorkouts.length;

  const [exercises, setExercises] = useState<Exercise[]>(
    template?.exercises.map((ex: any) => {
      // Find matching exercise from last workout
      const lastExercise = lastWorkout?.exercises.find(e => e.name === ex.name);

      return {
        id: generateId(),
        name: ex.name,
        sets: Array.from({ length: setsPerExercise }, (_, idx) => {
          // Use last workout's set data if available, otherwise use defaults
          const lastSet = lastExercise?.sets[idx];
          return {
            id: generateId(),
            reps: lastSet?.reps || 10,
            weight: lastSet?.weight || ex.defaultWeight,
            completed: false,
          };
        }),
      };
    }) || []
  );

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [restTimer, setRestTimer] = useState<number>(0);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [completedWorkout, setCompletedWorkout] = useState<WorkoutLog | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRestTimerActive && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setIsRestTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRestTimerActive, restTimer]);

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

  const handleAddExercise = () => {
    if (!newExerciseName.trim()) {
      toast.error('Exercise name is required');
      return;
    }

    const newExercise: Exercise = {
      id: generateId(),
      name: newExerciseName.trim(),
      sets: Array.from({ length: 3 }, () => ({
        id: generateId(),
        reps: 10,
        weight: 0,
        completed: false,
      })),
    };

    setExercises((prev) => [...prev, newExercise]);
    setCurrentExerciseIndex(exercises.length);
    setNewExerciseName('');
    setIsAddingExercise(false);
    toast.success('Exercise added');
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

    if (field === 'completed' && value === true && settings?.autoRestTimer) {
      setRestTimer(settings.defaultRestTime);
      setIsRestTimerActive(true);
    }
  };

  const handleSaveWorkout = () => {
    if (exercises.length === 0) {
      toast.error('Add at least one exercise');
      return;
    }

    const endTime = toZonedTime(new Date(), TIMEZONE).toISOString();
    const duration = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000 / 60);

    createWorkout.mutate(
      {
        date: today,
        workoutType,
        customWorkoutName: customWorkout?.name,
        exercises,
        startTime,
        endTime,
        duration,
      },
      {
        onSuccess: (newWorkout) => {
          updateStreak.mutate(today);
          setCompletedWorkout(newWorkout);
          setShowSummary(true);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const currentExercise = exercises[currentExerciseIndex];
  const completedSets = currentExercise?.sets.filter((s) => s.completed).length || 0;
  const totalSets = currentExercise?.sets.length || 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="fixed top-0 left-0 right-0 bg-background border-b z-50 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h2 className="text-xl font-bold">{customWorkout?.name || template?.name || workoutType}</h2>
            <div className="text-sm text-muted-foreground">
              Exercise {currentExerciseIndex + 1} of {exercises.length}
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pt-20">
        {isRestTimerActive && restTimer > 0 && (
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Timer className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Rest Timer</div>
                    <div className="text-sm opacity-90">Take a break</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold tabular-nums">
                    {Math.floor(restTimer / 60)}:{String(restTimer % 60).padStart(2, '0')}
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => {
                      setIsRestTimerActive(false);
                      setRestTimer(0);
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentExercise && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-2xl">{currentExercise.name}</span>
                <Badge variant="secondary">
                  {completedSets}/{totalSets}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentExercise.sets.map((set, idx) => (
                <div key={set.id} className="flex items-center gap-3 p-4 border rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-3 items-center">
                    <span className="text-lg font-semibold">Set {idx + 1}</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={set.reps}
                        onChange={(e) =>
                          handleUpdateSet(
                            currentExercise.id,
                            set.id,
                            'reps',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20 text-center text-lg"
                      />
                      <span className="text-sm text-muted-foreground">reps</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={set.weight}
                        onChange={(e) =>
                          handleUpdateSet(
                            currentExercise.id,
                            set.id,
                            'weight',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-24 text-center text-lg"
                      />
                      <span className="text-sm text-muted-foreground">kg</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSet(currentExercise.id, set.id)}
                    className="h-14 w-14"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={set.completed ? 'default' : 'outline'}
                    size="lg"
                    onClick={() =>
                      handleUpdateSet(currentExercise.id, set.id, 'completed', !set.completed)
                    }
                    className="h-14 w-14"
                  >
                    <Check className="h-6 w-6" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => handleAddSet(currentExercise.id)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Set
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
            disabled={currentExerciseIndex === 0}
            className="flex-1"
          >
            Previous Exercise
          </Button>
          <Button
            onClick={() =>
              setCurrentExerciseIndex(Math.min(exercises.length - 1, currentExerciseIndex + 1))
            }
            disabled={currentExerciseIndex === exercises.length - 1}
            className="flex-1"
          >
            Next Exercise
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {exercises.map((ex, idx) => {
            const completed = ex.sets.filter((s) => s.completed).length;
            const total = ex.sets.length;
            return (
              <Button
                key={ex.id}
                variant={idx === currentExerciseIndex ? 'default' : 'outline'}
                onClick={() => setCurrentExerciseIndex(idx)}
                className="h-auto py-3 flex flex-col items-center"
              >
                <span className="text-xs font-medium truncate w-full">{ex.name}</span>
                <span className="text-xs text-muted-foreground">
                  {completed}/{total}
                </span>
              </Button>
            );
          })}

          {isAddingExercise ? (
            <Card className="col-span-3">
              <CardContent className="p-4 space-y-3">
                <Input
                  placeholder="Exercise name"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddExercise();
                    if (e.key === 'Escape') {
                      setIsAddingExercise(false);
                      setNewExerciseName('');
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddExercise} className="flex-1">
                    Add Exercise
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingExercise(false);
                      setNewExerciseName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsAddingExercise(true)}
              className="h-auto py-3 flex flex-col items-center border-dashed"
            >
              <Plus className="h-5 w-5 mb-1" />
              <span className="text-xs">Add Exercise</span>
            </Button>
          )}
        </div>

        <Button
          onClick={handleSaveWorkout}
          disabled={createWorkout.isPending}
          size="lg"
          className="w-full"
        >
          <Save className="h-5 w-5 mr-2" />
          {createWorkout.isPending ? 'Saving...' : 'Complete Workout'}
        </Button>
      </div>

      {/* Workout Summary Modal */}
      {showSummary && completedWorkout && (
        <WorkoutSummary
          currentWorkout={completedWorkout}
          previousWorkout={lastWorkout || null}
          totalWorkoutsOfType={totalWorkoutsOfType}
          onClose={() => {
            setShowSummary(false);
            onComplete();
          }}
        />
      )}
    </div>
  );
}
