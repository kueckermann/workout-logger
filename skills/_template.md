# Skill: [Feature Name]

> **AI Instruction**: Follow `@SKILL.md` for code rules. Implement in checklist order.

---

## Overview

**What**: [One sentence - what this feature does]

**Why**: [One sentence - the user value]

**Priority**: [ ] MVP | [ ] Phase 2 | [ ] Future

---

## Data Model

### Types

```typescript
// lib/types/[feature].ts

export type [Entity] = {
  id: string;
  // fields
  createdAt: string;
  updatedAt: string;
};
```

### Storage Key

```typescript
// lib/storage/keys.ts
export const STORAGE_KEYS = {
  [FEATURE]: 'app:[feature]',
} as const;
```

---

## Validation

```typescript
// lib/validators/[feature].ts
import { z } from 'zod';

export const [entity]Schema = z.object({
  // required
  field: z.string().min(1, 'Required'),
  
  // optional
  optionalField: z.string().optional(),
});

export const [entity]UpdateSchema = [entity]Schema.partial();

export type [Entity]Input = z.infer<typeof [entity]Schema>;
export type [Entity]UpdateInput = z.infer<typeof [entity]UpdateSchema>;
```

---

## Hooks

```typescript
// lib/hooks/use-[feature].ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItem, setItem, generateId } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { [entity]Schema } from '@/lib/validators/[feature]';
import type { [Entity], [Entity]Input } from '@/lib/types/[feature]';

const QUERY_KEY = ['[feature]'];

// Helper functions
function getAll(): [Entity][] {
  return getItem<[Entity][]>(STORAGE_KEYS.[FEATURE], []);
}

function saveAll(items: [Entity][]): void {
  setItem(STORAGE_KEYS.[FEATURE], items);
}

// Hooks
export function use[Feature]s() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getAll,
  });
}

export function use[Feature](id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => {
      const items = getAll();
      const item = items.find((i) => i.id === id);
      if (!item) throw new Error('[Entity] not found');
      return item;
    },
    enabled: Boolean(id),
  });
}

export function useCreate[Feature]() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: [Entity]Input) => {
      const validated = [entity]Schema.parse(input);
      const items = getAll();
      
      const newItem: [Entity] = {
        id: generateId(),
        ...validated,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      saveAll([...items, newItem]);
      return newItem;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdate[Feature]() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: [Entity]UpdateInput }) => {
      const items = getAll();
      const index = items.findIndex((i) => i.id === id);
      
      if (index === -1) throw new Error('[Entity] not found');
      
      items[index] = {
        ...items[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      saveAll(items);
      return items[index];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDelete[Feature]() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      const items = getAll();
      const filtered = items.filter((i) => i.id !== id);
      saveAll(filtered);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
```

---

## Store (UI State)

```typescript
// lib/stores/[feature]-store.ts
import { create } from 'zustand';

type [Feature]Store = {
  // UI State
  editingId: string | null;
  isModalOpen: boolean;
  filter: string;
  
  // Actions
  openModal: (id?: string) => void;
  closeModal: () => void;
  setFilter: (filter: string) => void;
};

export const use[Feature]Store = create<[Feature]Store>((set) => ({
  editingId: null,
  isModalOpen: false,
  filter: 'all',
  
  openModal: (id) => set({ isModalOpen: true, editingId: id ?? null }),
  closeModal: () => set({ isModalOpen: false, editingId: null }),
  setFilter: (filter) => set({ filter }),
}));
```

---

## Components

### Tree

```
[Feature]Page              ← Server Component (app/[feature]/page.tsx)
└── [Feature]Content       ← Client Component
    ├── [Feature]Header    ← Client Component
    │   └── Add Button
    ├── [Feature]List      ← Client Component
    │   └── [Feature]Card  ← Client Component
    └── [Feature]Modal     ← Client Component
        └── [Feature]Form  ← Client Component
```

### [Feature]List

```typescript
// components/[feature]/[feature]-list.tsx
'use client';

import { use[Feature]s } from '@/lib/hooks/use-[feature]';
import { [Feature]Card } from './[feature]-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export function [Feature]List() {
  const { data, isLoading, isError, error, refetch } = use[Feature]s();

  // Loading
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error.message}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  // Empty
  if (!data?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No items yet. Create your first one.
      </div>
    );
  }

  // Success
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((item) => (
        <[Feature]Card key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### [Feature]Form

```typescript
// components/[feature]/[feature]-form.tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { [entity]Schema, type [Entity]Input } from '@/lib/validators/[feature]';
import { useCreate[Feature], useUpdate[Feature], use[Feature] } from '@/lib/hooks/use-[feature]';
import { use[Feature]Store } from '@/lib/stores/[feature]-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function [Feature]Form() {
  const editingId = use[Feature]Store((s) => s.editingId);
  const closeModal = use[Feature]Store((s) => s.closeModal);
  
  const { data: existing } = use[Feature](editingId || '');
  const create = useCreate[Feature]();
  const update = useUpdate[Feature]();
  
  const isEditing = Boolean(editingId);
  const isPending = create.isPending || update.isPending;

  const form = useForm<[Entity]Input>({
    resolver: zodResolver([entity]Schema),
    defaultValues: {},
  });

  // Load existing data when editing
  useEffect(() => {
    if (existing) {
      form.reset(existing);
    }
  }, [existing, form]);

  const onSubmit = (data: [Entity]Input) => {
    if (isEditing && editingId) {
      update.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            toast.success('Updated!');
            closeModal();
          },
          onError: (err) => toast.error(err.message),
        }
      );
    } else {
      create.mutate(data, {
        onSuccess: () => {
          toast.success('Created!');
          form.reset();
          closeModal();
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input placeholder="Field" {...form.register('field')} />
        {form.formState.errors.field && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.field.message}
          </p>
        )}
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={closeModal}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
```

---

## User Flows

### Create

```
1. User clicks "Add" button
2. Modal opens with empty form
3. User fills fields
4. User clicks "Create"
5. Zod validates input
   ├── Invalid → Show field errors
   └── Valid → Continue
6. Data saved to localStorage
7. Query cache invalidated
8. Modal closes
9. Toast "Created!"
10. Item appears in list
```

### Edit

```
1. User clicks edit on item
2. Modal opens with data loaded
3. User modifies fields
4. User clicks "Update"
5. Zod validates input
6. Data updated in localStorage
7. Query cache invalidated
8. Modal closes
9. Toast "Updated!"
```

### Delete

```
1. User clicks delete on item
2. Confirmation (optional)
3. Data removed from localStorage
4. Query cache invalidated
5. Toast "Deleted!"
6. Item removed from list
```

---

## States

| State | UI |
|-------|------|
| Loading | Skeleton grid |
| Error | Error message + retry button |
| Empty | "No items yet" message |
| Success | Grid of cards |

---

## Business Rules

- [ ] Rule 1: [Describe]
- [ ] Rule 2: [Describe]

---

## Edge Cases

- [ ] What if [scenario]?
- [ ] What if [scenario]?

---

## Checklist

### Foundation
- [ ] Type (`lib/types/[feature].ts`)
- [ ] Validator (`lib/validators/[feature].ts`)
- [ ] Storage key (`lib/storage/keys.ts`)

### Data Layer
- [ ] Hooks (`lib/hooks/use-[feature].ts`)
  - [ ] use[Feature]s (list)
  - [ ] use[Feature] (single)
  - [ ] useCreate[Feature]
  - [ ] useUpdate[Feature]
  - [ ] useDelete[Feature]
- [ ] Store (`lib/stores/[feature]-store.ts`)

### Components
- [ ] List component
- [ ] Card component
- [ ] Form component
- [ ] Modal component

### Page
- [ ] Page (`app/[feature]/page.tsx`)
- [ ] Loading (`app/[feature]/loading.tsx`)

### Polish
- [ ] All 4 states (loading, error, empty, success)
- [ ] Toast notifications
- [ ] Responsive design

---

## shadcn Components Needed

```bash
bunx shadcn@latest add button card input skeleton dialog
```

---

## Notes

<!-- Add decisions, considerations, or context here -->