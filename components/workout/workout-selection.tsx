'use client';

import { useState, useMemo, useEffect } from 'react';
import { Play, Calendar, History, Edit, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/lib/hooks/use-settings';
import { useUserProfile } from '@/lib/hooks/use-profile';
import { getDefaultWorkouts } from '@/lib/constants/workouts';
import { WorkoutEditorModal } from './workout-editor-modal';
import { useCustomWorkouts, useCreateCustomWorkout, useUpdateCustomWorkout, useDeleteCustomWorkout } from '@/lib/hooks/use-custom-workouts';
import { useUpdateDefaultWorkout, useResetDefaultWorkout, useModifiedDefaults } from '@/lib/hooks/use-default-workouts';
import type { WorkoutType } from '@/lib/types/workout';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { toast } from 'sonner';

const TIMEZONE = 'Europe/Tallinn';

type Props = {
  onSelectWorkout: (type: WorkoutType, customWorkout?: { name: string; exercises: { name: string; defaultWeight: number }[] }) => void;
  onViewHistory: () => void;
  onViewCalendar: () => void;
};

export function WorkoutSelection({ onSelectWorkout, onViewHistory, onViewCalendar }: Props) {
  const { data: settings } = useSettings();
  const { data: userProfile } = useUserProfile();
  const { data: customWorkouts = [] } = useCustomWorkouts();
  const { data: modifiedDefaults } = useModifiedDefaults();
  const createCustomWorkout = useCreateCustomWorkout();
  const updateCustomWorkout = useUpdateCustomWorkout();
  const updateDefaultWorkout = useUpdateDefaultWorkout();
  const resetDefaultWorkout = useResetDefaultWorkout();
  const deleteCustomWorkout = useDeleteCustomWorkout();
  const today = toZonedTime(new Date(), TIMEZONE);
  const dayOfWeek = today.getDay();
  const scheduledWorkoutValue = settings?.schedule[dayOfWeek];
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<{ type?: WorkoutType; name: string; id?: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const DEFAULT_WORKOUTS = useMemo(() => {
    if (!isMounted) return [];
    return getDefaultWorkouts(userProfile);
  }, [userProfile, modifiedDefaults, isMounted]);

  // Get scheduled workout name (could be default type or custom workout name)
  const getScheduledWorkoutName = () => {
    if (!scheduledWorkoutValue) return null;
    const customWorkout = customWorkouts.find(w => w.id === scheduledWorkoutValue);
    if (customWorkout) return customWorkout.name;
    return scheduledWorkoutValue; // Return the type name for default workouts
  };

  const scheduledWorkoutName = getScheduledWorkoutName();

  const handleEditWorkout = (type: WorkoutType, name: string) => {
    const workout = DEFAULT_WORKOUTS.find((w: any) => w.type === type);
    if (workout) {
      setEditingWorkout({ type, name });
      setIsEditorOpen(true);
    }
  };

  const handleCreateCustomWorkout = () => {
    setEditingWorkout(null);
    setIsEditorOpen(true);
  };

  const handleSaveWorkout = (workoutName: string, exercises: { name: string; defaultWeight: number }[]) => {
    if (editingWorkout?.id) {
      // Update existing custom workout
      updateCustomWorkout.mutate(
        { id: editingWorkout.id, name: workoutName, exercises },
        {
          onSuccess: () => {
            toast.success(`Workout "${workoutName}" updated successfully!`);
            setIsEditorOpen(false);
            setEditingWorkout(null);
          },
          onError: () => {
            toast.error('Failed to update workout');
          },
        }
      );
    } else if (editingWorkout?.type) {
      // Update default workout
      updateDefaultWorkout.mutate(
        { type: editingWorkout.type, name: workoutName, exercises },
        {
          onSuccess: () => {
            toast.success(`Default workout "${workoutName}" updated successfully!`);
            setIsEditorOpen(false);
            setEditingWorkout(null);
          },
          onError: () => {
            toast.error('Failed to update default workout');
          },
        }
      );
    } else {
      // Create new custom workout
      createCustomWorkout.mutate(
        { name: workoutName, exercises },
        {
          onSuccess: () => {
            toast.success(`Workout "${workoutName}" created successfully!`);
            setIsEditorOpen(false);
            setEditingWorkout(null);
          },
          onError: () => {
            toast.error('Failed to create workout');
          },
        }
      );
    }
  };

  const handleResetWorkout = () => {
    if (!editingWorkout?.type) return;
    if (!confirm(`Reset "${editingWorkout.name}" to original default?`)) return;

    resetDefaultWorkout.mutate(editingWorkout.type, {
      onSuccess: () => {
        toast.success('Workout reset to default');
        setIsEditorOpen(false);
        setEditingWorkout(null);
      },
      onError: () => toast.error('Failed to reset workout'),
    });
  };

  const handleDeleteCustomWorkout = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    deleteCustomWorkout.mutate(id, {
      onSuccess: () => toast.success('Workout deleted'),
      onError: () => toast.error('Failed to delete workout'),
    });
  };

  return (
    <>
      <WorkoutEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingWorkout(null);
        }}
        workoutName={editingWorkout?.name}
        workoutType={editingWorkout?.type}
        initialExercises={
          editingWorkout
            ? editingWorkout.id
              ? customWorkouts.find((w) => w.id === editingWorkout.id)?.exercises || []
              : DEFAULT_WORKOUTS.find((w: any) => w.type === editingWorkout.type)?.exercises || []
            : []
        }
        onSave={handleSaveWorkout}
        onReset={editingWorkout?.type ? handleResetWorkout : undefined}
      />
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">What's today's workout?</h2>
        <p className="text-muted-foreground">{format(today, 'EEEE, MMMM dd, yyyy')}</p>
        {scheduledWorkoutName && (
          <Badge variant="outline" className="text-sm">
            Scheduled: {scheduledWorkoutName.toUpperCase()}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {!isMounted ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-24"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            {DEFAULT_WORKOUTS.map((workout: any) => {
          const isScheduled = workout.type === scheduledWorkoutValue;
          return (
            <Card
              key={workout.type}
              className={`relative ${isScheduled ? 'border-primary border-2' : ''}`}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditWorkout(workout.type, workout.name);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <CardHeader>
                <CardTitle className="text-lg">
                  {workout.name}
                  {isScheduled && <Badge className="ml-2 text-xs">Today</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-1 min-h-[100px]">
                  {workout.exercises.slice(0, 3).map((ex: { name: string; defaultWeight: number }, idx: number) => (
                    <div key={idx} className="truncate">• {ex.name}</div>
                  ))}
                  {workout.exercises.length > 3 && (
                    <div className="text-xs">+{workout.exercises.length - 3} more</div>
                  )}
                </div>
                <Button
                  onClick={() => onSelectWorkout(workout.type)}
                  className="w-full"
                  variant={workout.type === scheduledWorkoutValue ? 'default' : 'outline'}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
              </CardContent>
            </Card>
          );
        })}
            {customWorkouts.map((workout) => {
          const isScheduled = workout.id === scheduledWorkoutValue;
          return (
            <Card key={workout.id} className={`relative ${isScheduled ? 'border-primary border-2' : ''}`}>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-10 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCustomWorkout(workout.id, workout.name);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingWorkout({ name: workout.name, id: workout.id });
                  setIsEditorOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <CardHeader className="pr-20">
                <CardTitle className="text-lg flex items-center min-h-[32px]">
                  <span className="truncate">{workout.name}</span>
                  <Badge className="ml-2 text-xs flex-shrink-0" variant="secondary">Custom</Badge>
                  {isScheduled && <Badge className="ml-2 text-xs flex-shrink-0">Today</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground space-y-1 min-h-[100px]">
                  {workout.exercises.slice(0, 3).map((ex: { name: string; defaultWeight: number }, idx: number) => (
                    <div key={idx} className="truncate">• {ex.name}</div>
                  ))}
                  {workout.exercises.length > 3 && (
                    <div className="text-xs">+{workout.exercises.length - 3} more</div>
                  )}
                </div>
                <Button
                  onClick={() => {
                    onSelectWorkout('custom' as WorkoutType, { name: workout.name, exercises: workout.exercises });
                  }}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
              </CardContent>
            </Card>
          );
        })}

        <Card
            className="border-dashed border-2 hover:border-primary transition-colors cursor-pointer"
            onClick={handleCreateCustomWorkout}
          >
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[280px] p-6">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Custom Workout</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Create your own personalized workout routine
              </p>
              <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                Create New
              </Button>
            </CardContent>
          </Card>
          </>
        )}
      </div>

    </div>
    </>
  );
}
