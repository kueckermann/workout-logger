export type WorkoutType = 'push' | 'pull' | 'legs' | 'custom';

export type VolumeLevel = 'low' | 'high';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type Gender = 'male' | 'female';

export type UserProfile = {
  id: string;
  gender: Gender;
  age: number;
  bodyWeight: number;
  height?: number;
  experienceLevel: ExperienceLevel;
  goals?: string[];
  createdAt: string;
  updatedAt: string;
};

export type ExerciseSet = {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
};

export type Exercise = {
  id: string;
  name: string;
  sets: ExerciseSet[];
  notes?: string;
};

export type WorkoutLog = {
  id: string;
  date: string;
  workoutType: WorkoutType;
  customWorkoutName?: string;
  exercises: Exercise[];
  startTime?: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type DefaultExercise = {
  name: string;
  defaultWeight: number;
};

export type WorkoutTemplate = {
  type: WorkoutType;
  name: string;
  exercises: DefaultExercise[];
};

export type WorkoutSchedule = {
  [key: number]: string | null; // Can be WorkoutType ('push'|'pull'|'legs'|'custom'), custom workout ID, or null for cleared
};

export type AppSettings = {
  volumeLevel: VolumeLevel;
  schedule: WorkoutSchedule;
  defaultRestTime: number;
  viewMode: 'desktop' | 'mobile';
  autoRestTimer: boolean;
};

export type StreakData = {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
};

export type WorkoutLogInput = Omit<WorkoutLog, 'id' | 'createdAt' | 'updatedAt'>;
export type AppSettingsInput = AppSettings;
