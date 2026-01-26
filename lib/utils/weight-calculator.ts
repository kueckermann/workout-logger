import type { UserProfile, ExperienceLevel, Gender } from '@/lib/types/workout';

type ExerciseCategory = 'compound-upper' | 'compound-lower' | 'isolation-upper' | 'isolation-lower' | 'core';

// Base weight percentages by experience level and exercise category
const BASE_PERCENTAGES: Record<ExperienceLevel, Record<ExerciseCategory, number>> = {
  beginner: {
    'compound-upper': 0.35,    // 35% of body weight
    'compound-lower': 0.50,    // 50% of body weight
    'isolation-upper': 0.125,  // 12.5% of body weight
    'isolation-lower': 0.275,  // 27.5% of body weight
    'core': 0.20,              // 20% of body weight
  },
  intermediate: {
    'compound-upper': 0.70,    // 70% of body weight
    'compound-lower': 1.00,    // 100% of body weight
    'isolation-upper': 0.25,   // 25% of body weight
    'isolation-lower': 0.475,  // 47.5% of body weight
    'core': 0.375,             // 37.5% of body weight
  },
  advanced: {
    'compound-upper': 1.05,    // 105% of body weight
    'compound-lower': 1.55,    // 155% of body weight
    'isolation-upper': 0.35,   // 35% of body weight
    'isolation-lower': 0.70,   // 70% of body weight
    'core': 0.60,              // 60% of body weight
  },
};

// Exercise category mapping
const EXERCISE_CATEGORIES: Record<string, ExerciseCategory> = {
  // Push - Compound Upper
  'Bench Press': 'compound-upper',
  'Incline Bench Press': 'compound-upper',
  'Overhead Press': 'compound-upper',
  'Shoulder Press': 'compound-upper',
  'Dips': 'compound-upper',

  // Push - Isolation Upper
  'Lateral Raises': 'isolation-upper',
  'Front Raises': 'isolation-upper',
  'Tricep Extensions': 'isolation-upper',
  'Tricep Pushdowns': 'isolation-upper',
  'Chest Flyes': 'isolation-upper',

  // Pull - Compound Upper
  'Barbell Row': 'compound-upper',
  'Pull-ups': 'compound-upper',
  'Lat Pulldown': 'compound-upper',
  'T-Bar Row': 'compound-upper',
  'Seated Cable Row': 'compound-upper',

  // Pull - Isolation Upper
  'Bicep Curls': 'isolation-upper',
  'Hammer Curls': 'isolation-upper',
  'Face Pulls': 'isolation-upper',
  'Rear Delt Flyes': 'isolation-upper',
  'Shrugs': 'isolation-upper',

  // Legs - Compound Lower
  'Squat': 'compound-lower',
  'Deadlift': 'compound-lower',
  'Romanian Deadlift': 'compound-lower',
  'Leg Press': 'compound-lower',
  'Bulgarian Split Squat': 'compound-lower',
  'Front Squat': 'compound-lower',

  // Legs - Isolation Lower
  'Leg Curls': 'isolation-lower',
  'Leg Extensions': 'isolation-lower',
  'Calf Raises': 'isolation-lower',
  'Hip Thrusts': 'isolation-lower',
  'Lunges': 'isolation-lower',

  // Core
  'Cable Crunches': 'core',
  'Russian Twists': 'core',
  'Planks': 'core',
  'Ab Wheel': 'core',
  'Hanging Leg Raises': 'core',
};

function getGenderMultiplier(category: ExerciseCategory, gender: Gender): number {
  if (gender === 'female') {
    if (category === 'compound-upper' || category === 'isolation-upper') {
      return 0.65; // Women typically 65% of male upper body strength
    }
    return 0.85; // Women typically 85% of male lower body strength
  }

  return 1.0; // Male baseline
}

function getAgeMultiplier(age: number): number {
  if (age <= 30) return 1.0;
  if (age <= 45) return 0.95;
  if (age <= 60) return 0.85;
  return 0.75;
}

export function calculateDefaultWeight(
  exerciseName: string,
  profile: UserProfile
): number {
  // Get exercise category, default to isolation-upper if not found
  const category = EXERCISE_CATEGORIES[exerciseName] || 'isolation-upper';

  // Get base percentage for experience level and category
  const basePercentage = BASE_PERCENTAGES[profile.experienceLevel][category];

  // Apply gender multiplier
  const genderMultiplier = getGenderMultiplier(category, profile.gender);

  // Apply age multiplier
  const ageMultiplier = getAgeMultiplier(profile.age);

  // Calculate final weight
  const calculatedWeight = profile.bodyWeight * basePercentage * genderMultiplier * ageMultiplier;

  // Round to nearest 2.5kg for practical gym use
  return Math.round(calculatedWeight / 2.5) * 2.5;
}

export function getExerciseCategory(exerciseName: string): ExerciseCategory {
  return EXERCISE_CATEGORIES[exerciseName] || 'isolation-upper';
}

export function getAllExerciseNames(): string[] {
  return Object.keys(EXERCISE_CATEGORIES);
}
