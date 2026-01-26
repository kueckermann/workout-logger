'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DEFAULT_EXERCISES, MUSCLE_GROUPS, type MuscleGroup, type ExerciseTemplate } from '@/lib/types/exercise';
import { toast } from 'sonner';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  workoutName?: string;
  workoutType?: string; // WorkoutType if editing default workout
  initialExercises?: { name: string; defaultWeight: number }[];
  onSave: (workoutName: string, exercises: { name: string; defaultWeight: number }[]) => void;
  onReset?: () => void; // Called when resetting a default workout
};

export function WorkoutEditorModal({ isOpen, onClose, workoutName = '', workoutType, initialExercises = [], onSave, onReset }: Props) {
  const [name, setName] = useState(workoutName);
  const [selectedExercises, setSelectedExercises] = useState<ExerciseTemplate[]>(
    initialExercises.map((ex, idx) => ({
      id: `custom-${idx}`,
      name: ex.name,
      muscleGroup: 'arms' as MuscleGroup,
      defaultWeight: ex.defaultWeight,
    }))
  );
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<Set<MuscleGroup>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state with props when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setName(workoutName);
      setSelectedExercises(
        initialExercises.map((ex, idx) => ({
          id: `custom-${idx}`,
          name: ex.name,
          muscleGroup: 'arms' as MuscleGroup,
          defaultWeight: ex.defaultWeight,
        }))
      );
      setSearchQuery('');
      setSelectedMuscleGroups(new Set());
    }
  }, [isOpen, workoutName, initialExercises]);

  if (!isOpen) return null;

  const toggleMuscleGroup = (group: MuscleGroup) => {
    setSelectedMuscleGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const filteredExercises = DEFAULT_EXERCISES.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscleGroup = selectedMuscleGroups.size === 0 || selectedMuscleGroups.has(ex.muscleGroup);
    return matchesSearch && matchesMuscleGroup;
  });

  const addExercise = (exercise: ExerciseTemplate) => {
    if (selectedExercises.some((ex) => ex.id === exercise.id)) {
      toast.error('Exercise already added');
      return;
    }
    setSelectedExercises([...selectedExercises, exercise]);
  };

  const removeExercise = (id: string) => {
    setSelectedExercises(selectedExercises.filter((ex) => ex.id !== id));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Workout name is required');
      return;
    }
    if (selectedExercises.length === 0) {
      toast.error('Add at least one exercise');
      return;
    }

    onSave(
      name,
      selectedExercises.map((ex) => ({ name: ex.name, defaultWeight: ex.defaultWeight }))
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">
            {workoutName ? 'Edit Workout' : 'Create Custom Workout'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden grid grid-cols-2 gap-6 p-6">
          {/* Left side - Exercise selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Workout Name</Label>
              <Input
                placeholder="e.g., Upper Body Blast"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Filter by Muscle Group</Label>
              <div className="flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map((group) => (
                  <Badge
                    key={group.value}
                    variant={selectedMuscleGroups.has(group.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleMuscleGroup(group.value)}
                  >
                    {group.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Search Exercises</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <ScrollArea className="h-[400px] border rounded-lg">
              <div className="space-y-2 p-3 pb-6">
                {filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {exercise.muscleGroup}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addExercise(exercise)}
                      disabled={selectedExercises.some((ex) => ex.id === exercise.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
                {filteredExercises.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No exercises found
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right side - Selected exercises */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Selected Exercises ({selectedExercises.length})</Label>
            </div>

            <ScrollArea className="h-[500px] border rounded-lg">
              {selectedExercises.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground p-3">
                  <p>No exercises selected</p>
                  <p className="text-sm mt-2">Add exercises from the left panel</p>
                </div>
              ) : (
                <div className="space-y-2 p-3 pb-6">
                  {selectedExercises.map((exercise, idx) => (
                    <div
                      key={exercise.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {idx + 1}. {exercise.name}
                        </div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {exercise.muscleGroup} • {exercise.defaultWeight}kg default
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExercise(exercise.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 px-6 pb-6 border-t">
          <div>
            {workoutType && onReset && (
              <Button variant="ghost" onClick={onReset} className="text-muted-foreground">
                Reset to Default
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || selectedExercises.length === 0}>
              Save Workout
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
