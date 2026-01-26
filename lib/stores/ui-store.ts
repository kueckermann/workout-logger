import { create } from 'zustand';
import type { WorkoutType } from '@/lib/types/workout';

type UIStore = {
  selectedDate: string | null;
  calendarView: 'week' | 'month';
  activeWorkoutId: string | null;
  isTimerOpen: boolean;
  timerSeconds: number;
  isTimerRunning: boolean;
  selectedWorkoutType: WorkoutType | null;

  setSelectedDate: (date: string | null) => void;
  setCalendarView: (view: 'week' | 'month') => void;
  setActiveWorkoutId: (id: string | null) => void;
  openTimer: (seconds: number) => void;
  closeTimer: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tickTimer: () => void;
  setSelectedWorkoutType: (type: WorkoutType | null) => void;
};

export const useUIStore = create<UIStore>((set) => ({
  selectedDate: null,
  calendarView: 'week',
  activeWorkoutId: null,
  isTimerOpen: false,
  timerSeconds: 0,
  isTimerRunning: false,
  selectedWorkoutType: null,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setCalendarView: (view) => set({ calendarView: view }),
  setActiveWorkoutId: (id) => set({ activeWorkoutId: id }),
  openTimer: (seconds) => set({ isTimerOpen: true, timerSeconds: seconds, isTimerRunning: true }),
  closeTimer: () => set({ isTimerOpen: false, isTimerRunning: false }),
  startTimer: () => set({ isTimerRunning: true }),
  pauseTimer: () => set({ isTimerRunning: false }),
  resetTimer: () => set({ timerSeconds: 0, isTimerRunning: false }),
  tickTimer: () => set((state) => ({
    timerSeconds: state.timerSeconds > 0 ? state.timerSeconds - 1 : 0,
    isTimerRunning: state.timerSeconds > 1 ? state.isTimerRunning : false,
  })),
  setSelectedWorkoutType: (type) => set({ selectedWorkoutType: type }),
}));
