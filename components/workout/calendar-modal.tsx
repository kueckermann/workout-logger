'use client';

import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarView } from './calendar-view';
import { DayWorkouts } from './day-workouts';

type Props = {
  onBack: () => void;
};

export function CalendarModal({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <CalendarView />
      </div>

      <DayWorkouts />
    </div>
  );
}
