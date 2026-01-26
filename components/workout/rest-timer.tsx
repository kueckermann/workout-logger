'use client';

import { useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUIStore } from '@/lib/stores/ui-store';
import { useSettings } from '@/lib/hooks/use-settings';
import { REST_TIME_OPTIONS } from '@/lib/constants/workouts';

export function RestTimer() {
  const {
    isTimerOpen,
    timerSeconds,
    isTimerRunning,
    openTimer,
    closeTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    tickTimer,
  } = useUIStore();

  const { data: settings } = useSettings();

  useEffect(() => {
    if (!isTimerRunning) return;

    const interval = setInterval(() => {
      tickTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, tickTimer]);

  useEffect(() => {
    if (timerSeconds === 0 && isTimerRunning) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Rest Timer Complete!', {
          body: 'Time to start your next set!',
        });
      }
    }
  }, [timerSeconds, isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isTimerOpen) {
    return (
      <div className="fixed bottom-4 right-4">
        <Button
          size="lg"
          onClick={() => openTimer(settings?.defaultRestTime || 90)}
          className="rounded-full h-14 w-14"
        >
          <Timer className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Rest Timer
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={closeTimer}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-5xl font-bold mb-4">{formatTime(timerSeconds)}</div>
            <div className="flex justify-center gap-2">
              {isTimerRunning ? (
                <Button onClick={pauseTimer} size="lg">
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button onClick={startTimer} size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Start
                </Button>
              )}
              <Button onClick={resetTimer} variant="outline" size="lg">
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {REST_TIME_OPTIONS.map((seconds) => (
              <Button
                key={seconds}
                variant="outline"
                size="sm"
                onClick={() => openTimer(seconds)}
              >
                {seconds}s
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
