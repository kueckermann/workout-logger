import { z } from 'zod';

export const workoutTypeSchema = z.enum(['push', 'pull', 'legs', 'custom']);

export const volumeLevelSchema = z.enum(['low', 'high']);

export const experienceLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);

export const genderSchema = z.enum(['male', 'female']);

export const exerciseSetSchema = z.object({
  id: z.string(),
  reps: z.number().min(1).max(100),
  weight: z.number().min(0).max(1000),
  completed: z.boolean(),
});

export const exerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Exercise name is required'),
  sets: z.array(exerciseSetSchema).min(1),
  notes: z.string().optional(),
});

export const workoutLogSchema = z.object({
  date: z.string(),
  workoutType: workoutTypeSchema,
  customWorkoutName: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1, 'At least one exercise required'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.number().optional(),
  notes: z.string().optional(),
});

export const userProfileSchema = z.object({
  gender: genderSchema,
  age: z.number().min(13).max(120),
  bodyWeight: z.number().min(30).max(300),
  height: z.number().min(100).max(250).optional(),
  experienceLevel: experienceLevelSchema,
  goals: z.array(z.string()).optional(),
});

export const workoutScheduleSchema = z.record(z.number(), z.union([workoutTypeSchema, z.string(), z.null()]));

export const appSettingsSchema = z.object({
  volumeLevel: volumeLevelSchema,
  schedule: workoutScheduleSchema,
  defaultRestTime: z.number().min(10).max(600),
  viewMode: z.enum(['desktop', 'mobile']),
  autoRestTimer: z.boolean(),
});

export type WorkoutLogInput = z.infer<typeof workoutLogSchema>;
export type AppSettingsInput = z.infer<typeof appSettingsSchema>;
