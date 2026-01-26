'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Trophy, Zap, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { WorkoutLog } from '@/lib/types/workout';
import { calculateTotalVolume } from '@/lib/utils/workout-calculations';

type Props = {
  currentWorkout: WorkoutLog;
  previousWorkout: WorkoutLog | null;
  totalWorkoutsOfType: number;
  onClose: () => void;
};

const MOTIVATIONAL_MESSAGES = {
  improved: [
    "🔥 Beast mode activated! You crushed it!",
    "💪 New personal record! Keep pushing!",
    "⚡ Unstoppable! You're getting stronger!",
    "🚀 To the moon! Amazing progress!",
    "👑 Champion mentality! Well done!",
  ],
  maintained: [
    "💯 Consistency is key! Great work!",
    "🎯 Solid performance! Keep it up!",
    "⚖️ Maintaining strength! Stay focused!",
    "🔄 Steady progress! You're on track!",
    "✨ Quality over quantity! Nice job!",
  ],
  decreased: [
    "💪 Every workout counts! Recovery is progress too!",
    "🌱 Building strength takes time! Keep going!",
    "🎯 Focus on form! You're doing great!",
    "🔋 Rest and come back stronger!",
    "⭐ Progress isn't always linear! Stay committed!",
  ],
};

export function WorkoutSummary({ currentWorkout, previousWorkout, totalWorkoutsOfType, onClose }: Props) {
  const analysis = useMemo(() => {
    // Only show "first workout" if count is 0 (no previous workouts of this type)
    if (totalWorkoutsOfType === 0) {
      return {
        type: 'first' as const,
        message: "🎉 First workout of this type! Great start!",
        volumeChange: 0,
        improvements: 0,
        maintained: 0,
        decreased: 0,
      };
    }

    // If we don't have a previous workout to compare with, show maintained message
    if (!previousWorkout) {
      return {
        type: 'maintained' as const,
        message: "💯 Consistency is key! Great work!",
        volumeChange: 0,
        improvements: 0,
        maintained: 0,
        decreased: 0,
      };
    }

    const currentVolume = calculateTotalVolume(currentWorkout);
    const previousVolume = calculateTotalVolume(previousWorkout);
    const volumeChange = currentVolume - previousVolume;

    let improvements = 0;
    let maintained = 0;
    let decreased = 0;

    currentWorkout.exercises.forEach(ex => {
      const prevEx = previousWorkout.exercises.find(e => e.name === ex.name);
      if (!prevEx) return;

      ex.sets.forEach((set, idx) => {
        const prevSet = prevEx.sets[idx];
        if (!prevSet) return;

        if (set.weight > prevSet.weight) {
          improvements++;
        } else if (set.weight === prevSet.weight) {
          maintained++;
        } else {
          decreased++;
        }
      });
    });

    let type: 'improved' | 'maintained' | 'decreased';
    if (improvements > decreased) {
      type = 'improved';
    } else if (improvements === decreased || (improvements === 0 && decreased === 0)) {
      type = 'maintained';
    } else {
      type = 'decreased';
    }

    const messages = MOTIVATIONAL_MESSAGES[type];
    const message = messages[Math.floor(Math.random() * messages.length)];

    return {
      type,
      message,
      volumeChange,
      improvements,
      maintained,
      decreased,
    };
  }, [currentWorkout, previousWorkout]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Workout Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Motivational Message */}
          <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border-2 border-primary/20">
            <p className="text-xl font-bold">{analysis.message}</p>
          </div>

          {/* Volume Comparison */}
          {previousWorkout && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Total Volume</p>
                    <p className="text-2xl font-bold">{calculateTotalVolume(currentWorkout).toFixed(0)} kg</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">vs Last Workout</p>
                    <div className={`flex items-center justify-center gap-1 text-2xl font-bold ${
                      analysis.volumeChange > 0
                        ? 'text-green-600 dark:text-green-400'
                        : analysis.volumeChange < 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-muted-foreground'
                    }`}>
                      {analysis.volumeChange > 0 ? (
                        <TrendingUp className="h-6 w-6" />
                      ) : analysis.volumeChange < 0 ? (
                        <TrendingDown className="h-6 w-6" />
                      ) : (
                        <Minus className="h-6 w-6" />
                      )}
                      <span>{analysis.volumeChange > 0 ? '+' : ''}{analysis.volumeChange.toFixed(0)} kg</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Performance</p>
                    <Badge
                      variant={analysis.type === 'improved' ? 'default' : 'secondary'}
                      className="text-lg px-3 py-1"
                    >
                      {analysis.type === 'improved' ? '📈 Improved' : analysis.type === 'maintained' ? '➡️ Maintained' : '📉 Recovery'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Set Breakdown */}
          {previousWorkout && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Set Performance</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{analysis.improvements}</p>
                    <p className="text-xs text-muted-foreground">Improved</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Minus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analysis.maintained}</p>
                    <p className="text-xs text-muted-foreground">Maintained</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <div>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analysis.decreased}</p>
                    <p className="text-xs text-muted-foreground">Lighter</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Workout Details */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Workout Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Exercises:</span>
                <span className="font-semibold">{currentWorkout.exercises.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Total Sets:</span>
                <span className="font-semibold">
                  {currentWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <Button onClick={onClose} className="w-full" size="lg">
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
