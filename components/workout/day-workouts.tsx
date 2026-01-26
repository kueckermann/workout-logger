'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/stores/ui-store';
import { useWorkoutsByDate } from '@/lib/hooks/use-workouts';
import { WorkoutLogger } from './workout-logger';
import { format, isBefore, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { WorkoutType } from '@/lib/types/workout';
import { Edit, Dumbbell } from 'lucide-react';
import { useUserProfile } from '@/lib/hooks/use-profile';
import { useCustomWorkouts } from '@/lib/hooks/use-custom-workouts';
import { getDefaultWorkouts } from '@/lib/constants/workouts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TIMEZONE = 'Europe/Tallinn';

export function DayWorkouts() {
  const { selectedDate, selectedWorkoutType, setSelectedDate, setSelectedWorkoutType } = useUIStore();
  const { data: workouts = [] } = useWorkoutsByDate(selectedDate || '');
  const { data: userProfile } = useUserProfile();
  const { data: customWorkouts = [] } = useCustomWorkouts();
  const [showWorkoutSelector, setShowWorkoutSelector] = useState(false);
  const [customWorkoutData, setCustomWorkoutData] = useState<{ name: string; exercises: { name: string; defaultWeight: number }[] } | undefined>();

  const defaultWorkouts = userProfile ? getDefaultWorkouts(userProfile) : [];

  if (!selectedDate) return null;

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedWorkoutType(null);
  };

  const handleWorkoutComplete = () => {
    setSelectedWorkoutType(null);
    setCustomWorkoutData(undefined);
  };

  const handleSelectWorkout = (type: WorkoutType, customWorkout?: { name: string; exercises: { name: string; defaultWeight: number }[] }) => {
    setSelectedWorkoutType(type);
    setCustomWorkoutData(customWorkout);
    setShowWorkoutSelector(false);
  };

  const zonedDate = toZonedTime(new Date(selectedDate || new Date()), TIMEZONE);
  const today = startOfDay(toZonedTime(new Date(), TIMEZONE));
  const selectedDay = startOfDay(zonedDate);
  const isPastOrToday = isBefore(selectedDay, today) || selectedDay.getTime() === today.getTime();

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Fixed Header */}
        <div className="p-6 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {format(zonedDate, 'EEEE, MMMM dd, yyyy')}
            </h3>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
          {workouts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No workouts logged for this day</p>
                {isPastOrToday && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setShowWorkoutSelector(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Add Workout Log
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {workouts.map((workout) => {
                const totalVolume = workout.exercises.reduce((sum, ex) =>
                  sum + ex.sets.reduce((setSum, set) => setSum + (set.weight * set.reps), 0), 0
                );
                const completedSets = workout.exercises.reduce((sum, ex) =>
                  sum + ex.sets.filter(s => s.completed).length, 0
                );
                const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

                return (
                <Card key={workout.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2 text-base">
                      <span className="capitalize truncate">{workout.customWorkoutName || workout.workoutType}</span>
                      <Badge variant="outline" className="flex-shrink-0">
                        {workout.startTime ? format(toZonedTime(new Date(workout.startTime), TIMEZONE), 'HH:mm') : 'N/A'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Workout Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pb-2 border-b">
                        <div className="flex items-center gap-1">
                          <Dumbbell className="h-4 w-4" />
                          <span className="font-semibold text-foreground">{totalVolume.toFixed(0)} kg</span>
                          <span>volume</span>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">{completedSets}/{totalSets}</span>
                          <span> sets</span>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">{workout.exercises.length}</span>
                          <span> exercises</span>
                        </div>
                      </div>

                      {/* Exercise List */}
                      <div className="space-y-2">
                        {workout.exercises.map((exercise, idx) => {
                          const exerciseVolume = exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
                          return (
                            <div key={idx} className="text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium truncate">{exercise.name}</span>
                                <span className="text-muted-foreground text-xs flex-shrink-0 ml-2">{exerciseVolume.toFixed(0)} kg</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {exercise.sets.length} sets × {exercise.sets[0]?.reps || 0} reps @ {exercise.sets[0]?.weight || 0} kg
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
              })}
              {isPastOrToday && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowWorkoutSelector(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Add Another Workout
                </Button>
              )}
            </div>
          )}
          {selectedWorkoutType && (
            <WorkoutLogger
              date={selectedDate}
              workoutType={selectedWorkoutType}
              customWorkout={customWorkoutData}
              onComplete={handleWorkoutComplete}
            />
          )}
          </div>
        </div>
      </div>

      {/* Workout Selection Modal */}
      <Dialog open={showWorkoutSelector} onOpenChange={setShowWorkoutSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Workout</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {/* Default Workouts */}
            {defaultWorkouts.map((workout) => (
              <Card
                key={workout.type}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSelectWorkout(workout.type)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    {workout.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {workout.exercises.slice(0, 3).map((ex, idx) => (
                      <div key={idx}>• {ex.name}</div>
                    ))}
                    {workout.exercises.length > 3 && (
                      <div>+ {workout.exercises.length - 3} more</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Custom Workouts */}
            {customWorkouts.map((workout) => (
              <Card
                key={workout.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSelectWorkout('custom', { name: workout.name, exercises: workout.exercises })}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5" />
                    {workout.name}
                  </CardTitle>
                  <Badge variant="secondary" className="w-fit">Custom</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {workout.exercises.slice(0, 3).map((ex, idx) => (
                      <div key={idx}>• {ex.name}</div>
                    ))}
                    {workout.exercises.length > 3 && (
                      <div>+ {workout.exercises.length - 3} more</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
