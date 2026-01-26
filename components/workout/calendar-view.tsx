'use client';

import { useState } from 'react';
import { format, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkouts } from '@/lib/hooks/use-workouts';
import { useSettings } from '@/lib/hooks/use-settings';
import { useCustomWorkouts } from '@/lib/hooks/use-custom-workouts';
import { useUIStore } from '@/lib/stores/ui-store';
import { getWeekDays, getMonthDays, formatDate, isToday } from '@/lib/utils/date-helpers';
import { cn } from '@/lib/utils';

const TIMEZONE = 'Europe/Tallinn';

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

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(toZonedTime(new Date(), TIMEZONE));
  const { data: workouts = [] } = useWorkouts();
  const { data: settings } = useSettings();
  const { data: customWorkouts = [] } = useCustomWorkouts();
  const { calendarView, setCalendarView, setSelectedDate } = useUIStore();

  const days = calendarView === 'week' ? getWeekDays(currentDate) : getMonthDays(currentDate);

  const handlePrevious = () => {
    if (calendarView === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (calendarView === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const getWorkoutsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return workouts.filter((w) => w.date === dateStr);
  };

  const getScheduledWorkout = (date: Date) => {
    if (!settings) return null;
    const dayOfWeek = date.getDay();
    const scheduledValue = settings.schedule[dayOfWeek];
    if (!scheduledValue) return null;

    // Check if it's a valid workout type (push, pull, legs, custom)
    const validWorkoutTypes = ['push', 'pull', 'legs', 'custom'];
    if (validWorkoutTypes.includes(scheduledValue.toLowerCase())) {
      return formatWorkoutName(scheduledValue);
    }

    // If it's a UUID (custom workout), find the custom workout name
    const customWorkout = customWorkouts.find(w => w.id === scheduledValue);
    if (customWorkout) return customWorkout.name;

    // If we get here, it's an invalid/deleted workout ID - return null
    return null;
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {format(currentDate, calendarView === 'week' ? 'MMM dd, yyyy' : 'MMMM yyyy')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalendarView(calendarView === 'week' ? 'month' : 'week')}
            >
              {calendarView === 'week' ? 'Month' : 'Week'}
            </Button>
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn(
          'grid gap-2',
          calendarView === 'week' ? 'grid-cols-7' : 'grid-cols-7'
        )}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
          {days.map((day) => {
            const dayWorkouts = getWorkoutsForDate(day);
            const scheduledWorkout = getScheduledWorkout(day);
            const hasWorkouts = dayWorkouts.length > 0;
            const today = isToday(day);
            const inCurrentMonth = isCurrentMonth(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(formatDate(day))}
                className={cn(
                  'p-2 rounded-lg border text-left transition-colors min-h-[100px]',
                  today && 'border-primary bg-primary/5',
                  !inCurrentMonth && 'opacity-40',
                  hasWorkouts && 'bg-green-500/10 border-green-500/30',
                  'hover:bg-accent'
                )}
              >
                <div className="text-sm font-medium mb-1">
                  {format(toZonedTime(day, TIMEZONE), 'd')}
                </div>
                {scheduledWorkout && !hasWorkouts && (
                  <Badge variant="outline" className="text-xs mb-1">
                    {scheduledWorkout}
                  </Badge>
                )}
                {hasWorkouts && (
                  <div className="flex flex-col gap-1">
                    {dayWorkouts.map((workout) => (
                      <Badge key={workout.id} variant="default" className="bg-green-600 text-xs truncate max-w-full">
                        {formatWorkoutName(workout.workoutType, workout.customWorkoutName)}
                      </Badge>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
