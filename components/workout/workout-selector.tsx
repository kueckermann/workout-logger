'use client';

import { Dumbbell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/stores/ui-store';
import type { WorkoutType } from '@/lib/types/workout';

type Props = {
  date: string;
};

export function WorkoutSelector({ date }: Props) {
  const { setSelectedWorkoutType } = useUIStore();

  const workoutTypes: { type: WorkoutType; name: string; description: string }[] = [
    { type: 'push', name: 'Push Day', description: 'Chest, Shoulders, Triceps' },
    { type: 'pull', name: 'Pull Day', description: 'Back, Biceps' },
    { type: 'legs', name: 'Leg Day', description: 'Quads, Hamstrings, Calves' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Select Workout Type
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {workoutTypes.map((workout) => (
          <Button
            key={workout.type}
            variant="outline"
            className="h-auto p-4 justify-start"
            onClick={() => setSelectedWorkoutType(workout.type)}
          >
            <div className="text-left">
              <div className="font-semibold">{workout.name}</div>
              <div className="text-sm text-muted-foreground">{workout.description}</div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
