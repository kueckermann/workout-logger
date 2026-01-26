'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, Trash2, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Clock, Dumbbell, CheckCircle2, Edit, Save, X as XIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkouts, useDeleteWorkout, useUpdateWorkout } from '@/lib/hooks/use-workouts';
import { Input } from '@/components/ui/input';
import { useRecalculateStreak } from '@/lib/hooks/use-streak';
import { useSettings, useUpdateSettings } from '@/lib/hooks/use-settings';
import { toast } from 'sonner';
import type { WorkoutLog } from '@/lib/types/workout';
import {
  calculateTotalVolume,
  calculateCompletedExercises,
  formatDuration,
  getVolumeComparison
} from '@/lib/utils/workout-calculations';

const TIMEZONE = 'Europe/Tallinn';

const WORKOUT_EMOJIS: Record<string, string> = {
  push: '💪',
  pull: '🏋️',
  legs: '🦵',
  custom: '⚡',
};

const formatWorkoutName = (workoutType: string, customName?: string): string => {
  if (customName) return customName;

  const typeMap: Record<string, string> = {
    push: 'Push Day',
    pull: 'Pull Day',
    legs: 'Legs Day',
    custom: 'Custom',
  };

  return typeMap[workoutType.toLowerCase()] || workoutType;
};

type Props = {
  onBack: () => void;
};

export function HistoryView({ onBack }: Props) {
  const { data: workouts, isLoading } = useWorkouts();
  const { data: settings } = useSettings();
  const deleteWorkout = useDeleteWorkout();
  const updateWorkout = useUpdateWorkout();
  const updateSettings = useUpdateSettings();
  const recalculateStreak = useRecalculateStreak();
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const [editingWorkout, setEditingWorkout] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<WorkoutLog | null>(null);

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;

    const workoutToDelete = workouts?.find(w => w.id === id);
    if (!workoutToDelete) return;

    deleteWorkout.mutate(id, {
      onSuccess: () => {
        const remainingWorkouts = workouts?.filter(w => w.id !== id) || [];
        const workoutDates = remainingWorkouts.map(w => w.date);
        recalculateStreak.mutate(workoutDates);

        // Check if this workout matches any scheduled workout and clear it
        if (settings) {
          const workoutIdentifier = workoutToDelete.customWorkoutName || workoutToDelete.workoutType;
          const updatedSchedule: Record<number, string | null> = {};
          let scheduleChanged = false;

          // Copy all schedule entries
          Object.keys(settings.schedule).forEach(day => {
            const dayNum = parseInt(day);
            updatedSchedule[dayNum] = settings.schedule[dayNum];
          });

          // Set matching workouts to null
          Object.keys(updatedSchedule).forEach(day => {
            const dayNum = parseInt(day);
            if (updatedSchedule[dayNum] === workoutIdentifier) {
              updatedSchedule[dayNum] = null;
              scheduleChanged = true;
            }
          });

          if (scheduleChanged) {
            updateSettings.mutate(
              { schedule: updatedSchedule as any },
              {
                onSuccess: () => {
                  toast.success('Workout deleted and removed from schedule');
                },
              }
            );
          } else {
            toast.success('Workout deleted');
          }
        } else {
          toast.success('Workout deleted');
        }
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedWorkouts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleEdit = (workout: WorkoutLog) => {
    setEditingWorkout(workout.id);
    setEditedData(JSON.parse(JSON.stringify(workout)));
  };

  const handleCancelEdit = () => {
    setEditingWorkout(null);
    setEditedData(null);
  };

  const handleSaveEdit = () => {
    if (!editedData || !editingWorkout) return;

    updateWorkout.mutate(
      { id: editingWorkout, data: editedData },
      {
        onSuccess: () => {
          toast.success('Workout updated successfully');
          setEditingWorkout(null);
          setEditedData(null);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };

  const updateExerciseSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) => {
    if (!editedData) return;
    setEditedData({
      ...editedData,
      exercises: editedData.exercises.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map(s =>
                s.id === setId ? { ...s, [field]: value } : s
              ),
            }
          : ex
      ),
    });
  };

  const sortedWorkouts = useMemo(() =>
    [...(workouts || [])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ),
    [workouts]
  );

  // Group workouts by date and sort within each date by most recent first
  const groupedWorkouts = useMemo(() => {
    const groups: Record<string, typeof sortedWorkouts> = {};
    sortedWorkouts.forEach((workout) => {
      if (!groups[workout.date]) {
        groups[workout.date] = [];
      }
      groups[workout.date].push(workout);
    });

    // Sort workouts within each date by createdAt (most recent first)
    Object.keys(groups).forEach(date => {
      groups[date].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return groups;
  }, [sortedWorkouts]);

  const sortedDates = useMemo(() =>
    Object.keys(groupedWorkouts).sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    ),
    [groupedWorkouts]
  );

  const getWeightComparison = (
    currentWorkout: WorkoutLog,
    exerciseName: string,
    setIndex: number
  ) => {
    const previousWorkouts = sortedWorkouts.filter(
      (w) => {
        // Match by custom workout name if both have it, otherwise match by workout type
        const sameWorkout = currentWorkout.customWorkoutName
          ? w.customWorkoutName === currentWorkout.customWorkoutName
          : w.workoutType === currentWorkout.workoutType;
        return sameWorkout && w.date < currentWorkout.date;
      }
    );

    if (previousWorkouts.length === 0) return null;

    const previousWorkout = previousWorkouts[0];
    const previousExercise = previousWorkout.exercises.find((e) => e.name === exerciseName);

    if (!previousExercise || !previousExercise.sets[setIndex]) return null;

    const currentWeight = currentWorkout.exercises
      .find((e) => e.name === exerciseName)
      ?.sets[setIndex]?.weight || 0;
    const previousWeight = previousExercise.sets[setIndex].weight;

    if (currentWeight === previousWeight) return null;

    return {
      difference: currentWeight - previousWeight,
      isIncrease: currentWeight > previousWeight,
    };
  };

  // Calculate highest volume by workout type
  const highestVolumeByWorkout = useMemo(() => {
    const volumeMap: Record<string, { volume: number; date: string; workoutName: string }> = {};

    sortedWorkouts.forEach((workout) => {
      const workoutKey = workout.customWorkoutName || workout.workoutType;
      const totalVolume = calculateTotalVolume(workout);

      if (!volumeMap[workoutKey] || totalVolume > volumeMap[workoutKey].volume) {
        volumeMap[workoutKey] = {
          volume: totalVolume,
          date: workout.date,
          workoutName: workoutKey,
        };
      }
    });

    return Object.values(volumeMap).sort((a, b) => b.volume - a.volume);
  }, [sortedWorkouts]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        ) : sortedWorkouts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No workouts logged yet. Start your first workout!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Stats Card - Left Side */}
            <div className="lg:col-span-4">
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Highest Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {highestVolumeByWorkout.slice(0, 6).map((record) => {
                      // Find the original workout to get the type for proper formatting
                      const originalWorkout = sortedWorkouts.find(w =>
                        (w.customWorkoutName || w.workoutType) === record.workoutName
                      );
                      const displayName = originalWorkout?.customWorkoutName
                        ? originalWorkout.customWorkoutName
                        : formatWorkoutName(record.workoutName);

                      return (
                      <div key={record.workoutName} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate text-sm">{displayName}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(toZonedTime(new Date(record.date), TIMEZONE), 'MMM dd')}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                          <Dumbbell className="h-4 w-4 text-primary" />
                          <span className="font-bold">{record.volume.toFixed(0)}</span>
                          <span className="text-xs text-muted-foreground">kg</span>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Workout History - Right Side */}
            <div className="lg:col-span-8 space-y-3">
          {sortedDates.map((date, dateIndex) => (
            <div key={date}>
              {/* Date separator for non-first dates */}
              {dateIndex > 0 && (
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}

              {/* Date header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  {format(toZonedTime(new Date(date), TIMEZONE), 'EEEE, MMMM dd, yyyy')}
                </h3>
              </div>

              {/* Workouts for this date */}
              <div className="space-y-3">
                {groupedWorkouts[date].map((workout) => {
            const isExpanded = expandedWorkouts.has(workout.id);
            const totalVolume = calculateTotalVolume(workout);
            const completedExercises = calculateCompletedExercises(workout);
            const totalExercises = workout.exercises.length;
            const volumeComparison = getVolumeComparison(workout, sortedWorkouts);

            return (
              <Card key={workout.id}>
                <CardHeader className="cursor-pointer" onClick={() => toggleExpand(workout.id)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{WORKOUT_EMOJIS[workout.workoutType] || '💪'}</span>
                        <Badge variant="default" className="text-sm truncate max-w-[200px]">{formatWorkoutName(workout.workoutType, workout.customWorkoutName)}</Badge>
                        <span className="text-base font-normal text-muted-foreground">
                          {format(toZonedTime(new Date(workout.date), TIMEZONE), 'MMM dd, yyyy')}
                        </span>
                        {workout.startTime && workout.endTime && (
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(workout.startTime), 'HH:mm:ss')} - {format(new Date(workout.endTime), 'HH:mm:ss')}
                          </span>
                        )}
                      </CardTitle>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{completedExercises}/{totalExercises} exercises</span>
                          </div>
                          {workout.duration && workout.duration > 0 ? (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{formatDuration(workout.duration)}</span>
                            </div>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1 text-sm">
                            <Dumbbell className="h-4 w-4" />
                            <span className="font-semibold">{totalVolume.toFixed(0)} kg</span>
                            <span className="text-muted-foreground text-xs">total volume</span>
                          </div>
                          {volumeComparison && (
                            <span
                              className={`flex items-center gap-1 text-xs ${
                                volumeComparison.isIncrease
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {volumeComparison.isIncrease ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {Math.abs(volumeComparison.difference).toFixed(0)}kg
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {workout.exercises.slice(0, 3).map((ex, exIdx) => {
                            const firstSetComparison = getWeightComparison(workout, ex.name, 0);
                            if (!firstSetComparison) return null;
                            return (
                                <div
                                  key={exIdx}
                                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                                    firstSetComparison.isIncrease
                                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                      : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                  }`}
                                >
                                  <span className="font-medium">{ex.name}:</span>
                                  {firstSetComparison.isIncrease ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3" />
                                  )}
                                  <span>{Math.abs(firstSetComparison.difference).toFixed(1)}kg</span>
                                </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingWorkout === workout.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit();
                            }}
                          >
                            <Save className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                          >
                            <XIcon className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(workout);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(workout.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent>
                    <div className="space-y-3">
                      {(editingWorkout === workout.id && editedData ? editedData.exercises : workout.exercises).map((ex) => (
                        <div key={ex.id} className="border-l-2 border-primary pl-3">
                          <div className="font-medium mb-2">{ex.name}</div>
                          <div className="text-sm space-y-2">
                            {ex.sets.map((set, idx) => {
                              const comparison = getWeightComparison(workout, ex.name, idx);
                              const isEditing = editingWorkout === workout.id;

                              return (
                                <div key={set.id} className="flex items-center gap-2 flex-wrap">
                                  <span className="text-muted-foreground min-w-[60px]">Set {idx + 1}:</span>

                                  {isEditing ? (
                                    <>
                                      <div className="flex items-center gap-1">
                                        <Input
                                          type="number"
                                          value={set.reps}
                                          onChange={(e) => updateExerciseSet(ex.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                                          className="w-16 h-8 text-sm"
                                          min="1"
                                        />
                                        <span className="text-xs text-muted-foreground">reps</span>
                                      </div>
                                      <span className="text-muted-foreground">×</span>
                                      <div className="flex items-center gap-1">
                                        <Input
                                          type="number"
                                          value={set.weight}
                                          onChange={(e) => updateExerciseSet(ex.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                                          className="w-20 h-8 text-sm"
                                          min="0"
                                          step="0.5"
                                        />
                                        <span className="text-xs text-muted-foreground">kg</span>
                                      </div>
                                    </>
                                  ) : (
                                    <span className="text-foreground">
                                      {set.reps} reps × {set.weight} kg
                                      {set.completed && ' ✓'}
                                    </span>
                                  )}

                                  {comparison && (
                                    <span
                                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
                                        comparison.isIncrease
                                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                          : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                      }`}
                                    >
                                      {comparison.isIncrease ? (
                                        <TrendingUp className="h-3 w-3" />
                                      ) : (
                                        <TrendingDown className="h-3 w-3" />
                                      )}
                                      <span className="font-medium">{comparison.isIncrease ? '+' : ''}{comparison.difference.toFixed(1)}kg</span>
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
              </div>
            </div>
          ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
