'use client';

import { useState, useEffect } from 'react';
import { Dumbbell, Menu, Clock, Calendar, History, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SettingsPanel } from './settings-panel';
import { StreakDisplay } from './streak-display';

const TIMEZONE = 'Europe/Tallinn';

type Props = {
  currentView?: 'selection' | 'history' | 'calendar';
  onViewCalendar?: () => void;
  onViewHistory?: () => void;
  onBack?: () => void;
};

export function Header({ currentView = 'selection', onViewCalendar, onViewHistory, onBack }: Props) {
  const [open, setOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time on client mount
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {currentView !== 'selection' && onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} className="flex-shrink-0">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <Dumbbell className="h-6 w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-bold truncate">
                Workout Logger
                {currentView !== 'selection' && (
                  <span className="text-muted-foreground font-normal"> - {currentView === 'history' ? 'History' : 'Calendar'}</span>
                )}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                {currentTime ? format(toZonedTime(currentTime, TIMEZONE), 'HH:mm:ss') : '--:--:--'} Tallinn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentView === 'selection' && (
              <>
                <Button variant="outline" size="sm" onClick={onViewCalendar} className="hidden md:flex">
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
                <Button variant="outline" size="sm" onClick={onViewHistory} className="hidden md:flex">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Button>
                <Button variant="ghost" size="icon" onClick={onViewCalendar} className="md:hidden">
                  <Calendar className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onViewHistory} className="md:hidden">
                  <History className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="p-4 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Settings & Stats</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6 pb-6">
                <StreakDisplay />
                <SettingsPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
