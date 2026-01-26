'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItem, setItem, generateId } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { userProfileSchema } from '@/lib/validators/workout';
import type { UserProfile } from '@/lib/types/workout';

const QUERY_KEY = ['userProfile'];

function getUserProfile(): UserProfile | null {
  return getItem<UserProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
}

function saveUserProfile(profile: UserProfile): void {
  setItem(STORAGE_KEYS.USER_PROFILE, profile);
}

export function useUserProfile() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getUserProfile,
  });
}

export function useCreateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
      const validated = userProfileSchema.parse(input);

      const newProfile: UserProfile = {
        id: generateId(),
        ...validated,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveUserProfile(newProfile);
      return newProfile;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const currentProfile = getUserProfile();

      if (!currentProfile) {
        throw new Error('No profile found');
      }

      const updatedProfile: UserProfile = {
        ...currentProfile,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      saveUserProfile(updatedProfile);
      return updatedProfile;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
