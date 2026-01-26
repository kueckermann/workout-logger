'use client';

import { Flame, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useStreak } from '@/lib/hooks/use-streak';

export function StreakDisplay() {
  const { data: streak, isLoading } = useStreak();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Workout Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500">
              {streak?.currentStreak || 0}
            </div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span className="text-3xl font-bold text-yellow-500">
                {streak?.longestStreak || 0}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">Best Streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
