'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dumbbell, User, Target, CheckCircle2 } from 'lucide-react';
import { useCreateProfile } from '@/lib/hooks/use-profile';
import { toast } from 'sonner';
import type { Gender, ExperienceLevel } from '@/lib/types/workout';

type OnboardingStep = 'welcome' | 'basic-info' | 'experience' | 'goals' | 'confirmation';

type Props = {
  isOpen: boolean;
  onComplete: () => void;
};

export function OnboardingModal({ isOpen, onComplete }: Props) {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [gender, setGender] = useState<Gender>('male');
  const [age, setAge] = useState<string>('25');
  const [bodyWeight, setBodyWeight] = useState<string>('75');
  const [height, setHeight] = useState<string>('175');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('beginner');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const createProfile = useCreateProfile();

  const goals = [
    'Build Muscle',
    'Lose Weight',
    'Gain Strength',
    'General Fitness',
    'Improve Endurance',
    'Athletic Performance',
  ];

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleComplete = () => {
    const ageNum = parseInt(age);
    const weightNum = parseFloat(bodyWeight);
    const heightNum = height ? parseFloat(height) : undefined;

    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      toast.error('Please enter a valid age (13-120)');
      return;
    }

    if (isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
      toast.error('Please enter a valid body weight (30-300 kg)');
      return;
    }

    createProfile.mutate(
      {
        gender,
        age: ageNum,
        bodyWeight: weightNum,
        height: heightNum,
        experienceLevel,
        goals: selectedGoals.length > 0 ? selectedGoals : undefined,
      },
      {
        onSuccess: () => {
          toast.success('Profile created! 🎉');
          onComplete();
        },
        onError: (error) => {
          toast.error('Failed to create profile');
          console.error(error);
        },
      }
    );
  };

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <Dumbbell className="h-16 w-16 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome to Workout Logger! 🏋️</h2>
              <p className="text-muted-foreground text-lg">
                Let's personalize your experience in just a few steps
              </p>
            </div>
            <Button onClick={() => setStep('basic-info')} size="lg" className="w-full max-w-xs">
              Get Started
            </Button>
          </div>
        );

      case 'basic-info':
        return (
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-primary/10 p-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Basic Information</h3>
                <p className="text-sm text-muted-foreground">Help us understand your profile</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup value={gender} onValueChange={(value: string) => setGender(value as Gender)}>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="cursor-pointer">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="cursor-pointer">Female</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Body Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={bodyWeight}
                  onChange={(e) => setBodyWeight(e.target.value)}
                  placeholder="75"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (cm) - Optional</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('welcome')} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep('experience')} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Experience Level</h3>
                <p className="text-sm text-muted-foreground">How would you describe your gym experience?</p>
              </div>
            </div>

            <div className="space-y-3">
              <Card
                className={`cursor-pointer transition-all ${
                  experienceLevel === 'beginner' ? 'border-primary border-2 bg-primary/5' : ''
                }`}
                onClick={() => setExperienceLevel('beginner')}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {experienceLevel === 'beginner' && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Beginner</h4>
                      <p className="text-sm text-muted-foreground">
                        New to the gym or returning after a long break
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">0-6 months of consistent training</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  experienceLevel === 'intermediate' ? 'border-primary border-2 bg-primary/5' : ''
                }`}
                onClick={() => setExperienceLevel('intermediate')}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {experienceLevel === 'intermediate' && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Intermediate</h4>
                      <p className="text-sm text-muted-foreground">
                        Comfortable with basic exercises and form
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">6 months - 2 years of training</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  experienceLevel === 'advanced' ? 'border-primary border-2 bg-primary/5' : ''
                }`}
                onClick={() => setExperienceLevel('advanced')}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {experienceLevel === 'advanced' && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">Advanced</h4>
                      <p className="text-sm text-muted-foreground">
                        Experienced lifter with solid strength base
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">2+ years of consistent training</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('basic-info')} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep('goals')} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Your Goals</h3>
                <p className="text-sm text-muted-foreground">What do you want to achieve? (Optional)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {goals.map((goal) => (
                <Card
                  key={goal}
                  className={`cursor-pointer transition-all ${
                    selectedGoals.includes(goal) ? 'border-primary border-2 bg-primary/5' : ''
                  }`}
                  onClick={() => toggleGoal(goal)}
                >
                  <CardContent className="p-4 text-center">
                    <p className="text-sm font-medium">{goal}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('experience')} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep('confirmation')} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-6 py-4">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-500/10 p-4">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Perfect! You're all set 🎉</h3>
              <p className="text-muted-foreground">Here's your profile summary</p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Experience:</span>
                  <span className="font-semibold capitalize">{experienceLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Body Weight:</span>
                  <span className="font-semibold">{bodyWeight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Age:</span>
                  <span className="font-semibold">{age} years</span>
                </div>
                {selectedGoals.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Goals:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedGoals.map((goal) => (
                        <span key={goal} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <p className="text-sm text-muted-foreground text-center">
              Default weights have been calculated based on your profile.
              <br />
              You can always adjust these in Settings.
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('goals')} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={createProfile.isPending}
                className="flex-1"
              >
                {createProfile.isPending ? 'Creating...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">User Profile Setup</DialogTitle>
          <DialogDescription className="sr-only">
            Complete your profile to get personalized workout recommendations
          </DialogDescription>
          {step !== 'welcome' && step !== 'confirmation' && (
            <div className="flex gap-2 mb-4">
              {['basic-info', 'experience', 'goals'].map((s, idx) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded-full ${
                    ['basic-info', 'experience', 'goals'].indexOf(step) >= idx
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          )}
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}
