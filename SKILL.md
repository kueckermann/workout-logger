# SKILL.md

> **AI Instruction**: This is your primary reference. Follow these rules for all code generation.

---

## Quick Reference

| Aspect | Rule |
|--------|------|
| Runtime | Bun |
| Framework | Next.js 16+ (App Router) |
| Directory | `/app` (not `/src/app`) |
| Styling | Tailwind CSS + shadcn/ui |
| State | TanStack Query + Zustand |
| Validation | Zod |
| Storage | localStorage (browser) |
| Deploy | Vercel |

---

## 1. Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Bun | latest | Runtime & package manager |
| Next.js | 16+ | Framework (App Router) |
| TypeScript | 5+ | Language (strict mode) |
| React | 19+ | UI Library |
| Tailwind CSS | 4+ | Styling |
| shadcn/ui | latest | Component library |
| TanStack Query | 5+ | Async state & caching |
| Zustand | 5+ | Client state |
| Zod | 3+ | Validation |

---

## 2. Project Structure

```
project/
├── app/                          # Next.js App Router
│   ├── (routes)/                 # Route groups
│   │   └── [route]/
│   │       ├── page.tsx
│   │       ├── loading.tsx
│   │       └── error.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   ├── providers.tsx             # TanStack Query provider
│   └── globals.css
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   └── [feature]/                # Feature components
│
├── lib/
│   ├── hooks/                    # Custom hooks
│   ├── stores/                   # Zustand stores
│   ├── storage/                  # localStorage utilities
│   ├── types/                    # TypeScript types
│   ├── validators/               # Zod schemas
│   └── utils.ts                  # Utilities (cn, etc.)
│
├── skills/                       # Feature specifications
│   ├── README.md
│   ├── _template.md
│   └── [feature].md
│
├── SKILL.md                      # This file
├── components.json               # shadcn/ui config
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Code Rules

### 3.1 Limits

| Element | Max Lines |
|---------|-----------|
| Component | 150 |
| Function | 40 |
| Hook | 80 |
| File | 200 |

### 3.2 TypeScript

```typescript
// ✅ Do
type User = { id: string; name: string };
const users: User[] = [];
function getUser(id: string): User | undefined {}

// ❌ Don't
const data: any = {};
// @ts-ignore
```

### 3.3 Components

**Server Components (default):**
- Static content
- No interactivity

**Client Components ('use client'):**
- Hooks (useState, useEffect)
- Event handlers
- Browser APIs (localStorage)
- TanStack Query / Zustand

```typescript
// ✅ Component structure
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Props = {
  title: string;
  children?: React.ReactNode;
};

export function MyComponent({ title, children }: Props) {
  // 1. Hooks
  const [count, setCount] = useState(0);

  // 2. Handlers
  const handleClick = () => setCount(c => c + 1);

  // 3. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>{count}</Button>
      {children}
    </div>
  );
}
```

---

## 4. Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `user-card.tsx` |
| Components | PascalCase | `UserCard` |
| Functions | camelCase | `getUser` |
| Variables | camelCase | `userName` |
| Constants | UPPER_SNAKE | `MAX_ITEMS` |
| Types | PascalCase | `User` |
| Hooks | useCamelCase | `useUser` |
| Stores | useCamelCaseStore | `useUserStore` |
| Storage keys | UPPER_SNAKE | `TODOS_KEY` |

---

## 5. localStorage Storage

### Storage Utility

```typescript
// lib/storage/index.ts
export function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  
  const item = localStorage.getItem(key);
  if (!item) return defaultValue;
  
  try {
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeItem(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}

export function generateId(): string {
  return crypto.randomUUID();
}
```

### Storage Keys (per feature)

```typescript
// lib/storage/keys.ts
export const STORAGE_KEYS = {
  TODOS: 'app:todos',
  USERS: 'app:users',
  SETTINGS: 'app:settings',
} as const;
```

---

## 6. Validation (Zod)

```typescript
// lib/validators/user.ts
import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

export const userUpdateSchema = userSchema.partial();

export type UserInput = z.infer<typeof userSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
```

---

## 7. TanStack Query + localStorage

### Query Client Setup

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

```typescript
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Hooks Pattern (localStorage + TanStack Query)

```typescript
// lib/hooks/use-users.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItem, setItem, generateId } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { userSchema } from '@/lib/validators/user';
import type { User, UserInput } from '@/lib/types/user';

const QUERY_KEY = ['users'];

// Helper functions
function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, []);
}

function saveUsers(users: User[]): void {
  setItem(STORAGE_KEYS.USERS, users);
}

// Hooks
export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getUsers,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => {
      const users = getUsers();
      const user = users.find((u) => u.id === id);
      if (!user) throw new Error('User not found');
      return user;
    },
    enabled: Boolean(id),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: UserInput) => {
      const validated = userSchema.parse(input);
      const users = getUsers();
      
      const newUser: User = {
        id: generateId(),
        ...validated,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      saveUsers([...users, newUser]);
      return newUser;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserInput> }) => {
      const users = getUsers();
      const index = users.findIndex((u) => u.id === id);
      
      if (index === -1) throw new Error('User not found');
      
      users[index] = {
        ...users[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      saveUsers(users);
      return users[index];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      const users = getUsers();
      const filtered = users.filter((u) => u.id !== id);
      saveUsers(filtered);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
```

---

## 8. Zustand (UI State Only)

```typescript
// lib/stores/ui-store.ts
import { create } from 'zustand';

type UIStore = {
  sidebarOpen: boolean;
  modalOpen: boolean;
  editingId: string | null;
  
  toggleSidebar: () => void;
  openModal: (id?: string) => void;
  closeModal: () => void;
};

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  modalOpen: false,
  editingId: null,
  
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openModal: (id) => set({ modalOpen: true, editingId: id ?? null }),
  closeModal: () => set({ modalOpen: false, editingId: null }),
}));
```

---

## 9. shadcn/ui Patterns

### Installation

```bash
bunx shadcn@latest init
bunx shadcn@latest add button card input skeleton dialog
```

### Component Usage

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function MyForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create User</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Name" />
        <Input placeholder="Email" type="email" />
        <Button type="submit">Create</Button>
      </CardContent>
    </Card>
  );
}
```

### Class Merging

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Tailwind Class Order

```typescript
<div className={cn(
  // 1. Layout
  'flex items-center justify-between',
  // 2. Size
  'w-full h-12',
  // 3. Spacing
  'p-4 gap-2',
  // 4. Typography
  'text-sm font-medium',
  // 5. Colors
  'bg-background text-foreground',
  // 6. Border
  'border rounded-lg',
  // 7. Effects
  'shadow-sm',
  // 8. States
  'hover:bg-accent',
  // 9. Responsive
  'md:h-16',
  // 10. Conditional
  isActive && 'ring-2 ring-primary',
  className
)} />
```

---

## 10. Forms (React Hook Form + Zod)

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userSchema, type UserInput } from '@/lib/validators/user';
import { useCreateUser } from '@/lib/hooks/use-users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function UserForm({ onSuccess }: { onSuccess?: () => void }) {
  const createUser = useCreateUser();

  const form = useForm<UserInput>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '' },
  });

  const onSubmit = (data: UserInput) => {
    createUser.mutate(data, {
      onSuccess: () => {
        toast.success('User created!');
        form.reset();
        onSuccess?.();
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input placeholder="Name" {...form.register('name')} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      <div>
        <Input placeholder="Email" {...form.register('email')} />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={createUser.isPending}>
        {createUser.isPending ? 'Creating...' : 'Create'}
      </Button>
    </form>
  );
}
```

---

## 11. Component States

Always handle these 4 states:

```typescript
'use client';

import { useUsers } from '@/lib/hooks/use-users';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export function UserList() {
  const { data, isLoading, isError, error, refetch } = useUsers();

  // 1. Loading
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // 2. Error
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

  // 3. Empty
  if (!data?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No users yet. Create your first user.
      </div>
    );
  }

  // 4. Success
  return (
    <ul className="space-y-2">
      {data.map((user) => (
        <li key={user.id} className="p-4 border rounded-lg">
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

---

## 12. Architecture Flow

```
┌─────────────────────────────────────────────────────────┐
│  Component                                              │
│  └── Uses hooks for data                                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  TanStack Query Hooks                                   │
│  └── useQuery / useMutation                             │
│  └── Caching, loading states, error handling            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  localStorage                                           │
│  └── getItem / setItem                                  │
│  └── Data persists in browser                           │
└─────────────────────────────────────────────────────────┘
```

**No API routes needed!** All data operations happen client-side.

---

## 13. Bun Commands

```bash
# Install dependencies
bun install

# Dev server
bun dev

# Build
bun run build

# Start production
bun start

# Add shadcn component
bunx shadcn@latest add [component]

# Lint
bun lint
```

---

## 14. Vercel Deployment

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

**Note**: localStorage data is per-browser. Each user has their own data. Data persists until user clears browser storage.

---

## 15. Feature Development

1. **Check for skill**: Look in `skills/[feature].md`
2. **Create if missing**: Copy from `skills/_template.md`
3. **Implement in order**:
   - Types (`lib/types/`)
   - Validators (`lib/validators/`)
   - Storage key (`lib/storage/keys.ts`)
   - Hooks (`lib/hooks/`)
   - Store if needed (`lib/stores/`)
   - Components (`components/[feature]/`)
   - Page (`app/`)

### Reference Skills

```
@SKILL.md @skills/[feature].md - Build the feature
```

---

## 16. AI Instructions

When generating code:

1. Follow this file strictly
2. Use Bun, not npm/yarn
3. Use `/app`, not `/src/app`
4. Use localStorage, not API routes
5. Use shadcn/ui components
6. Use TanStack Query for data operations
7. Use Zod for validation
8. Handle all 4 states (loading, error, empty, success)
9. Keep files under limits
10. Use proper naming conventions

---

## 17. Quick Start

```bash
# Create Next.js project
bunx create-next-app@latest my-app --typescript --tailwind --eslint --app

cd my-app

# Install dependencies
bun add @tanstack/react-query zustand zod react-hook-form @hookform/resolvers sonner

# Setup shadcn
bunx shadcn@latest init

# Add common components
bunx shadcn@latest add button card input skeleton dialog

# Create lib structure
mkdir -p lib/hooks lib/stores lib/storage lib/types lib/validators

# Create skills folder
mkdir skills

# Copy SKILL.md to project root
```

---
