'use client';

import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Dumbbell, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkouts, useDeleteWorkout } from '@/lib/hooks/use-workouts';
import { toast } from 'sonner';

const TIMEZONE = 'Europe/Tallinn';

export function WorkoutHistory() {
  const { data: workouts, isLoading } = useWorkouts();
  const deleteWorkout = useDeleteWorkout();

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;

    deleteWorkout.mutate(id, {
      onSuccess: () => toast.success('Workout deleted'),
      onError: (error) => toast.error(error.message),
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workout History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const sortedWorkouts = [...(workouts || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sortedWorkouts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            Workout History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No workouts logged yet. Start your first workout!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Workout History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedWorkouts.slice(0, 10).map((workout) => (
          <div
            key={workout.id}
            className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">{workout.workoutType}</Badge>
                <span className="text-sm text-muted-foreground">
                  {format(toZonedTime(new Date(workout.date), TIMEZONE), 'MMM dd, yyyy')} : {format(toZonedTime(new Date(workout.date), TIMEZONE), 'h:mm a')}
                </span>
              </div>
              <div className="text-sm space-y-1">
                {workout.exercises.map((ex) => (
                  <div key={ex.id} className="text-muted-foreground">
                    {ex.name}: {ex.sets.length} sets
                  </div>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(workout.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
