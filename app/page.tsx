'use client';

import { useState } from 'react';
import { Header } from '@/components/workout/header';
import { WorkoutSelection } from '@/components/workout/workout-selection';
import { ActiveWorkout } from '@/components/workout/active-workout';
import { HistoryView } from '@/components/workout/history-view';
import { CalendarModal } from '@/components/workout/calendar-modal';
import { RestTimer } from '@/components/workout/rest-timer';
import { OnboardingModal } from '@/components/workout/onboarding-modal';
import { useUserProfile } from '@/lib/hooks/use-profile';
import type { WorkoutType } from '@/lib/types/workout';

type View = 'selection' | 'active' | 'history' | 'calendar';

export default function Home() {
  const { data: userProfile } = useUserProfile();
  const [currentView, setCurrentView] = useState<View>('selection');
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutType | null>(null);
  const [customWorkoutData, setCustomWorkoutData] = useState<{ name: string; exercises: { name: string; defaultWeight: number }[] } | undefined>();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleSelectWorkout = (type: WorkoutType, customWorkout?: { name: string; exercises: { name: string; defaultWeight: number }[] }) => {
    setSelectedWorkout(type);
    setCustomWorkoutData(customWorkout);
    setCurrentView('active');
  };

  const handleBackToSelection = () => {
    setCurrentView('selection');
    setSelectedWorkout(null);
    setCustomWorkoutData(undefined);
  };

  const handleWorkoutComplete = () => {
    setCurrentView('selection');
    setSelectedWorkout(null);
    setCustomWorkoutData(undefined);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Show onboarding if no profile exists
  if (userProfile === null && !showOnboarding) {
    setShowOnboarding(true);
  }

  return (
    <div className="min-h-screen h-screen flex flex-col bg-background overflow-hidden">
      {currentView !== 'active' && (
        <Header
          currentView={currentView}
          onViewCalendar={() => setCurrentView('calendar')}
          onViewHistory={() => setCurrentView('history')}
          onBack={handleBackToSelection}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        {currentView === 'selection' && (
          <WorkoutSelection
            onSelectWorkout={handleSelectWorkout}
            onViewHistory={() => setCurrentView('history')}
            onViewCalendar={() => setCurrentView('calendar')}
          />
        )}

        {currentView === 'active' && selectedWorkout && (
          <ActiveWorkout
            workoutType={selectedWorkout}
            customWorkout={customWorkoutData}
            onBack={handleBackToSelection}
            onComplete={handleWorkoutComplete}
          />
        )}

        {currentView === 'history' && (
          <HistoryView onBack={handleBackToSelection} />
        )}

        {currentView === 'calendar' && (
          <CalendarModal onBack={handleBackToSelection} />
        )}
      </div>

      <RestTimer />
      <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
    </div>
  );
}
