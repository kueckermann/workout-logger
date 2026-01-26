'use client';

import { Settings, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings, useUpdateSettings } from '@/lib/hooks/use-settings';
import { useCustomWorkouts } from '@/lib/hooks/use-custom-workouts';
import { useUserProfile } from '@/lib/hooks/use-profile';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { WorkoutType, VolumeLevel } from '@/lib/types/workout';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export function SettingsPanel() {
  const { data: settings, isLoading } = useSettings();
  const { data: customWorkouts = [] } = useCustomWorkouts();
  const { data: userProfile } = useUserProfile();
  const updateSettings = useUpdateSettings();

  const handleVolumeChange = (volumeLevel: VolumeLevel) => {
    updateSettings.mutate(
      { volumeLevel },
      {
        onSuccess: () => toast.success('Volume updated'),
        onError: (error) => toast.error(error.message),
      }
    );
  };

  const handleViewModeChange = (checked: boolean) => {
    updateSettings.mutate(
      { viewMode: checked ? 'mobile' : 'desktop' },
      {
        onSuccess: () => toast.success('View mode updated'),
        onError: (error) => toast.error(error.message),
      }
    );
  };

  const handleScheduleChange = (day: number, value: string) => {
    if (!settings) return;

    const newSchedule = { ...settings.schedule };
    if (value === 'none') {
      delete newSchedule[day];
    } else {
      newSchedule[day] = value;
    }

    updateSettings.mutate(
      { schedule: newSchedule },
      {
        onSuccess: () => toast.success('Schedule updated'),
        onError: (error) => toast.error(error.message),
      }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Settings & Stats</h2>
      </div>

      {userProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="font-semibold capitalize">{userProfile.experienceLevel}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-semibold capitalize">{userProfile.gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-semibold">{userProfile.age} years</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Body Weight</p>
                <p className="font-semibold">{userProfile.bodyWeight} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Height</p>
                <p className="font-semibold">{userProfile.height} cm</p>
              </div>
            </div>
            {userProfile.goals && userProfile.goals.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Goals</p>
                <div className="flex flex-wrap gap-2">
                  {userProfile.goals.map((goal) => (
                    <span key={goal} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Auto Rest Timer</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Start timer automatically after completing a set
              </span>
              <Switch
                checked={settings?.autoRestTimer || false}
                onCheckedChange={(checked) => updateSettings.mutate({ autoRestTimer: checked })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rest Timer Duration</Label>
            <Select
              value={settings?.defaultRestTime.toString()}
              onValueChange={(value) => updateSettings.mutate({ defaultRestTime: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="90">1.5 minutes</SelectItem>
                <SelectItem value="120">2 minutes</SelectItem>
                <SelectItem value="180">3 minutes</SelectItem>
                <SelectItem value="240">4 minutes</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="view-mode">Mobile View</Label>
            <Switch
              id="view-mode"
              checked={settings?.viewMode === 'mobile'}
              onCheckedChange={handleViewModeChange}
            />
          </div>

          <div className="space-y-3">
            <Label>Workout Schedule</Label>
            {DAYS.map((day) => (
              <div key={day.value} className="flex items-center justify-between">
                <span className="text-sm">{day.label}</span>
                <Select
                  value={settings?.schedule[day.value] || 'none'}
                  onValueChange={(value) => handleScheduleChange(day.value, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="pull">Pull</SelectItem>
                    <SelectItem value="legs">Legs</SelectItem>
                    {customWorkouts.length > 0 && (
                      <>
                        <SelectItem value="separator" disabled>
                          ─── Custom ───
                        </SelectItem>
                        {customWorkouts.map((workout) => (
                          <SelectItem key={workout.id} value={workout.id}>
                            {workout.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
