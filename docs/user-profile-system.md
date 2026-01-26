# User Profile System Design

## Overview
A user profile system to personalize workout recommendations based on experience level, replacing the removed volume level (low/high) feature.

## Profile Levels

### 1. **Beginner**
- **Target Audience:** 0-6 months of consistent training
- **Characteristics:**
  - Learning proper form
  - Building foundational strength
  - Lower weights, higher reps for technique
  - Longer rest periods

### 2. **Intermediate**
- **Target Audience:** 6 months - 2 years of consistent training
- **Characteristics:**
  - Comfortable with basic movements
  - Progressive overload understanding
  - Moderate weights with good form
  - Balanced training approach

### 3. **Advanced**
- **Target Audience:** 2+ years of consistent training
- **Characteristics:**
  - Mastered compound movements
  - High strength levels
  - Optimized training splits
  - Shorter rest, higher intensity

---

## Default Weight Recommendations

### Calculation Factors
1. **User Data:**
   - Gender (male/female)
   - Body weight (kg)
   - Age
   - Experience level

2. **Exercise Categories:**
   - Compound movements (higher weights)
   - Isolation movements (lower weights)
   - Upper body vs. Lower body

### Weight Formulas (as % of body weight)

#### **PUSH Exercises**

| Exercise | Beginner | Intermediate | Advanced |
|----------|----------|--------------|----------|
| **Bench Press** | 30-40% BW | 60-80% BW | 90-120% BW |
| **Incline Bench** | 25-35% BW | 50-70% BW | 75-100% BW |
| **Shoulder Press** | 20-30% BW | 40-60% BW | 60-85% BW |
| **Dips** | Bodyweight | BW + 10-20kg | BW + 25-40kg |
| **Lateral Raises** | 5-8% BW | 10-15% BW | 15-20% BW |
| **Tricep Extensions** | 10-15% BW | 20-30% BW | 30-40% BW |

#### **PULL Exercises**

| Exercise | Beginner | Intermediate | Advanced |
|----------|----------|--------------|----------|
| **Deadlift** | 40-60% BW | 80-120% BW | 130-180% BW |
| **Barbell Row** | 30-40% BW | 60-80% BW | 85-110% BW |
| **Pull-ups** | Assisted | Bodyweight | BW + 15-30kg |
| **Lat Pulldown** | 35-45% BW | 60-80% BW | 85-110% BW |
| **Bicep Curls** | 10-15% BW | 20-30% BW | 30-40% BW |
| **Face Pulls** | 15-20% BW | 25-35% BW | 35-50% BW |

#### **LEGS Exercises**

| Exercise | Beginner | Intermediate | Advanced |
|----------|----------|--------------|----------|
| **Squat** | 40-60% BW | 80-120% BW | 130-180% BW |
| **Leg Press** | 80-100% BW | 140-180% BW | 200-280% BW |
| **Romanian Deadlift** | 30-40% BW | 60-80% BW | 90-120% BW |
| **Leg Curls** | 20-30% BW | 35-50% BW | 55-75% BW |
| **Leg Extensions** | 25-35% BW | 40-60% BW | 65-85% BW |
| **Calf Raises** | 40-60% BW | 80-100% BW | 120-150% BW |

#### **CORE Exercises**

| Exercise | Beginner | Intermediate | Advanced |
|----------|----------|--------------|----------|
| **Cable Crunches** | 15-25% BW | 30-45% BW | 50-70% BW |
| **Russian Twists** | 5-10% BW | 12-20% BW | 22-30% BW |
| **Planks** | Bodyweight 30s | Bodyweight 60s | Weighted 60s+ |

### Gender Adjustments
- **Female users:** Multiply by 0.6-0.7 for upper body exercises
- **Female users:** Multiply by 0.8-0.9 for lower body exercises

### Age Adjustments
- **18-30:** No adjustment (100%)
- **31-45:** Multiply by 0.95
- **46-60:** Multiply by 0.85
- **60+:** Multiply by 0.75

---

## Onboarding Flow

### Step 1: Welcome
```
"Welcome to Workout Logger! 🏋️
Let's personalize your experience."
```

### Step 2: Basic Info
- **Gender:** Male / Female / Other
- **Age:** Number input
- **Body Weight:** Number input (kg)
- **Height:** Number input (cm) - optional

### Step 3: Experience Level
```
"How would you describe your gym experience?"

[Beginner]
New to the gym or returning after a long break
0-6 months of consistent training

[Intermediate]
Comfortable with basic exercises
6 months - 2 years of training

[Advanced]
Experienced lifter with solid strength base
2+ years of consistent training
```

### Step 4: Goals (Optional)
- Build Muscle
- Lose Weight
- Gain Strength
- General Fitness

### Step 5: Confirmation
```
"Perfect! We've set up your profile:
- Experience: Intermediate
- Body Weight: 75kg
- Default weights calculated

You can always adjust these in Settings."
```

---

## Implementation Details

### Storage Structure
```typescript
type UserProfile = {
  id: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  bodyWeight: number; // kg
  height?: number; // cm
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  createdAt: string;
  updatedAt: string;
};
```

### Weight Calculation Function
```typescript
function calculateDefaultWeight(
  exercise: string,
  profile: UserProfile
): number {
  const basePercentage = getBasePercentage(exercise, profile.experienceLevel);
  const genderMultiplier = getGenderMultiplier(exercise, profile.gender);
  const ageMultiplier = getAgeMultiplier(profile.age);

  return Math.round(
    profile.bodyWeight *
    basePercentage *
    genderMultiplier *
    ageMultiplier
  );
}
```

---

## UI Components Needed

1. **OnboardingModal** - First-time user setup
2. **ProfileSettings** - Edit profile in settings
3. **WeightSuggestions** - Show recommended weights during workout
4. **ProgressTracking** - Track strength gains over time

---

## Benefits

✅ **Personalized Experience:** Weights tailored to individual capacity
✅ **Safety:** Prevents beginners from starting too heavy
✅ **Progression:** Clear path from beginner to advanced
✅ **Motivation:** See progress as you level up
✅ **Simplicity:** One-time setup, automatic calculations

---

## Future Enhancements

- **Auto-progression:** Suggest weight increases based on performance
- **Form check reminders:** More frequent for beginners
- **Exercise substitutions:** Based on equipment availability
- **Deload weeks:** Automatic for advanced users
- **1RM calculator:** Estimate max lifts
- **Strength standards:** Compare to population averages
