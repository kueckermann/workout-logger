# Skill: Todos

> **AI Instruction**: Follow `@SKILL.md` for code rules. Implement in checklist order.

---

## Overview

**What**: A simple todo list with create, complete, edit, and delete functionality.

**Why**: Users need to track tasks and mark them as done.

**Priority**: [x] MVP | [ ] Phase 2 | [ ] Future

---

## Data Model

### Types

```typescript
// lib/types/todo.ts

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};
```

### Storage Key

```typescript
// lib/storage/keys.ts
export const STORAGE_KEYS = {
  TODOS: 'app:todos',
} as const;
```

---

## Validation

```typescript
// lib/validators/todo.ts
import { z } from 'zod';

export const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  completed: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().nullable().default(null),
});

export const todoUpdateSchema = todoSchema.partial();

export type TodoInput = z.infer<typeof todoSchema>;
export type TodoUpdateInput = z.infer<typeof todoUpdateSchema>;
```

---

## Hooks

```typescript
// lib/hooks/use-todos.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItem, setItem, generateId } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { todoSchema } from '@/lib/validators/todo';
import type { Todo, TodoInput, TodoUpdateInput } from '@/lib/types/todo';

const QUERY_KEY = ['todos'];

// Helper functions
function getTodos(): Todo[] {
  const todos = getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
  // Sort: incomplete first, then by priority, then by createdAt
  return todos.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.priority !== b.priority) return priorityOrder[a.priority] - priorityOrder[b.priority];
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function saveTodos(todos: Todo[]): void {
  setItem(STORAGE_KEYS.TODOS, todos);
}

// Hooks
export function useTodos() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getTodos,
  });
}

export function useTodo(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => {
      const todos = getTodos();
      const todo = todos.find((t) => t.id === id);
      if (!todo) throw new Error('Todo not found');
      return todo;
    },
    enabled: Boolean(id),
  });
}

export function useCreateTodo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: TodoInput) => {
      const validated = todoSchema.parse(input);
      const todos = getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      
      const newTodo: Todo = {
        id: generateId(),
        ...validated,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      saveTodos([...todos, newTodo]);
      return newTodo;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TodoUpdateInput }) => {
      const todos = getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      const index = todos.findIndex((t) => t.id === id);
      
      if (index === -1) throw new Error('Todo not found');
      
      todos[index] = {
        ...todos[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      saveTodos(todos);
      return todos[index];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      const todos = getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      const filtered = todos.filter((t) => t.id !== id);
      saveTodos(filtered);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useToggleTodo() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => {
      const todos = getItem<Todo[]>(STORAGE_KEYS.TODOS, []);
      const index = todos.findIndex((t) => t.id === id);
      
      if (index === -1) throw new Error('Todo not found');
      
      todos[index] = {
        ...todos[index],
        completed,
        updatedAt: new Date().toISOString(),
      };
      
      saveTodos(todos);
      return todos[index];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
```

---

## Store (UI State)

```typescript
// lib/stores/todo-store.ts
import { create } from 'zustand';

type Filter = 'all' | 'active' | 'completed';

type TodoStore = {
  filter: Filter;
  editingId: string | null;
  isModalOpen: boolean;
  
  setFilter: (filter: Filter) => void;
  openModal: (id?: string) => void;
  closeModal: () => void;
};

export const useTodoStore = create<TodoStore>((set) => ({
  filter: 'all',
  editingId: null,
  isModalOpen: false,
  
  setFilter: (filter) => set({ filter }),
  openModal: (id) => set({ isModalOpen: true, editingId: id ?? null }),
  closeModal: () => set({ isModalOpen: false, editingId: null }),
}));
```

---

## Components

### Tree

```
TodosPage                  ← Server Component (app/todos/page.tsx)
└── TodosContent           ← Client Component
    ├── TodoHeader         ← Client Component
    │   ├── FilterTabs     ← (all | active | completed)
    │   └── AddButton      
    ├── TodoList           ← Client Component
    │   └── TodoItem       ← Client Component
    │       ├── Checkbox   ← Toggle complete
    │       ├── Title      
    │       ├── Priority   ← Badge
    │       ├── DueDate    ← Badge (optional)
    │       └── Actions    ← Edit, Delete
    └── TodoModal          ← Client Component
        └── TodoForm       ← Client Component
```

### TodoList

```typescript
// components/todos/todo-list.tsx
'use client';

import { useTodos } from '@/lib/hooks/use-todos';
import { useTodoStore } from '@/lib/stores/todo-store';
import { TodoItem } from './todo-item';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export function TodoList() {
  const { data: todos, isLoading, isError, error, refetch } = useTodos();
  const filter = useTodoStore((s) => s.filter);

  // Loading
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
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

  // Filter todos
  const filtered = todos?.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  // Empty
  if (!filtered?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {filter === 'all' && 'No todos yet. Add your first one!'}
        {filter === 'active' && 'No active todos.'}
        {filter === 'completed' && 'No completed todos.'}
      </div>
    );
  }

  // Success
  return (
    <div className="space-y-2">
      {filtered.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}
```

### TodoItem

```typescript
// components/todos/todo-item.tsx
'use client';

import { useToggleTodo, useDeleteTodo } from '@/lib/hooks/use-todos';
import { useTodoStore } from '@/lib/stores/todo-store';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Todo } from '@/lib/types/todo';

type Props = {
  todo: Todo;
};

const priorityColors = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export function TodoItem({ todo }: Props) {
  const toggle = useToggleTodo();
  const deleteTodo = useDeleteTodo();
  const openModal = useTodoStore((s) => s.openModal);

  const handleToggle = () => {
    toggle.mutate(
      { id: todo.id, completed: !todo.completed },
      { onError: () => toast.error('Failed to update') }
    );
  };

  const handleEdit = () => {
    openModal(todo.id);
  };

  const handleDelete = () => {
    deleteTodo.mutate(todo.id, {
      onSuccess: () => toast.success('Todo deleted'),
      onError: () => toast.error('Failed to delete'),
    });
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 border rounded-lg',
        'hover:bg-accent/50 transition-colors',
        todo.completed && 'opacity-60'
      )}
    >
      <Checkbox
        checked={todo.completed}
        onCheckedChange={handleToggle}
        disabled={toggle.isPending}
      />
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium truncate',
          todo.completed && 'line-through text-muted-foreground'
        )}>
          {todo.title}
        </p>
        <div className="flex gap-2 mt-1">
          <Badge variant="secondary" className={priorityColors[todo.priority]}>
            {todo.priority}
          </Badge>
          {todo.dueDate && (
            <Badge variant="outline">
              {new Date(todo.dueDate).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={handleEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleteTodo.isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

### TodoForm

```typescript
// components/todos/todo-form.tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { todoSchema, type TodoInput } from '@/lib/validators/todo';
import { useCreateTodo, useUpdateTodo, useTodo } from '@/lib/hooks/use-todos';
import { useTodoStore } from '@/lib/stores/todo-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export function TodoForm() {
  const editingId = useTodoStore((s) => s.editingId);
  const closeModal = useTodoStore((s) => s.closeModal);
  
  const { data: existingTodo } = useTodo(editingId || '');
  const create = useCreateTodo();
  const update = useUpdateTodo();
  
  const isEditing = Boolean(editingId);
  const isPending = create.isPending || update.isPending;

  const form = useForm<TodoInput>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: '',
      completed: false,
      priority: 'medium',
      dueDate: null,
    },
  });

  // Load existing data when editing
  useEffect(() => {
    if (existingTodo) {
      form.reset({
        title: existingTodo.title,
        completed: existingTodo.completed,
        priority: existingTodo.priority,
        dueDate: existingTodo.dueDate,
      });
    }
  }, [existingTodo, form]);

  const onSubmit = (data: TodoInput) => {
    if (isEditing && editingId) {
      update.mutate(
        { id: editingId, data },
        {
          onSuccess: () => {
            toast.success('Todo updated!');
            closeModal();
          },
          onError: (err) => toast.error(err.message),
        }
      );
    } else {
      create.mutate(data, {
        onSuccess: () => {
          toast.success('Todo created!');
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
        <Input
          placeholder="What needs to be done?"
          {...form.register('title')}
          autoFocus
        />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive mt-1">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Select
            value={form.watch('priority')}
            onValueChange={(v) => form.setValue('priority', v as TodoInput['priority'])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Input
            type="date"
            {...form.register('dueDate')}
          />
        </div>
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

### TodoHeader

```typescript
// components/todos/todo-header.tsx
'use client';

import { useTodoStore } from '@/lib/stores/todo-store';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

export function TodoHeader() {
  const filter = useTodoStore((s) => s.filter);
  const setFilter = useTodoStore((s) => s.setFilter);
  const openModal = useTodoStore((s) => s.openModal);

  return (
    <div className="flex items-center justify-between mb-6">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Button onClick={() => openModal()}>
        <Plus className="h-4 w-4 mr-2" />
        Add Todo
      </Button>
    </div>
  );
}
```

### TodoModal

```typescript
// components/todos/todo-modal.tsx
'use client';

import { useTodoStore } from '@/lib/stores/todo-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TodoForm } from './todo-form';

export function TodoModal() {
  const isOpen = useTodoStore((s) => s.isModalOpen);
  const editingId = useTodoStore((s) => s.editingId);
  const closeModal = useTodoStore((s) => s.closeModal);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingId ? 'Edit Todo' : 'New Todo'}
          </DialogTitle>
        </DialogHeader>
        <TodoForm />
      </DialogContent>
    </Dialog>
  );
}
```

### TodosContent (Main Wrapper)

```typescript
// components/todos/todos-content.tsx
'use client';

import { TodoHeader } from './todo-header';
import { TodoList } from './todo-list';
import { TodoModal } from './todo-modal';

export function TodosContent() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Todos</h1>
      <TodoHeader />
      <TodoList />
      <TodoModal />
    </div>
  );
}
```

### Page

```typescript
// app/todos/page.tsx
import { TodosContent } from '@/components/todos/todos-content';

export default function TodosPage() {
  return <TodosContent />;
}
```

---

## User Flows

### Create Todo

```
1. User clicks "Add Todo" button
2. Modal opens with empty form
3. User enters title (required)
4. User optionally selects priority & due date
5. User clicks "Create"
6. Zod validates input
   ├── Invalid → Show field errors
   └── Valid → Continue
7. Data saved to localStorage
8. Query cache invalidated
9. Modal closes
10. Toast "Todo created!"
11. New todo appears in list
```

### Toggle Complete

```
1. User clicks checkbox on todo
2. Optimistic UI update (strikethrough)
3. Data updated in localStorage
4. Query cache invalidated
5. Todo moves to completed section (if filter = all)
```

### Edit Todo

```
1. User clicks edit icon
2. Modal opens with todo data loaded
3. User modifies fields
4. User clicks "Update"
5. Zod validates input
6. Data updated in localStorage
7. Query cache invalidated
8. Modal closes
9. Toast "Todo updated!"
```

### Delete Todo

```
1. User clicks delete icon
2. Data removed from localStorage
3. Query cache invalidated
4. Toast "Todo deleted!"
5. Todo removed from list
```

### Filter Todos

```
1. User clicks filter tab (All | Active | Completed)
2. Store updates filter
3. List re-renders with filtered todos
4. Empty state shown if no matches
```

---

## States

| State | UI |
|-------|------|
| Loading | 5 skeleton rows |
| Error | Error message + retry button |
| Empty (all) | "No todos yet. Add your first one!" |
| Empty (active) | "No active todos." |
| Empty (completed) | "No completed todos." |
| Success | List of TodoItems |

---

## Business Rules

- [x] Title is required (1-200 chars)
- [x] Priority defaults to "medium"
- [x] Due date is optional
- [x] Incomplete todos shown before completed
- [x] High priority shown before low priority
- [x] Newer todos shown before older (within same priority)
- [x] Completed todos have strikethrough + opacity

---

## Edge Cases

- [x] Very long title → Truncate with ellipsis
- [x] Past due date → Could show in red (future enhancement)
- [x] Many todos → Scrollable list
- [x] localStorage full → Show error toast

---

## Checklist

### Foundation
- [ ] Type (`lib/types/todo.ts`)
- [ ] Validator (`lib/validators/todo.ts`)
- [ ] Storage key (`lib/storage/keys.ts`)

### Data Layer
- [ ] Hooks (`lib/hooks/use-todos.ts`)
  - [ ] useTodos (list)
  - [ ] useTodo (single)
  - [ ] useCreateTodo
  - [ ] useUpdateTodo
  - [ ] useDeleteTodo
  - [ ] useToggleTodo
- [ ] Store (`lib/stores/todo-store.ts`)

### Components
- [ ] TodoList
- [ ] TodoItem
- [ ] TodoForm
- [ ] TodoHeader
- [ ] TodoModal
- [ ] TodosContent

### Page
- [ ] Page (`app/todos/page.tsx`)
- [ ] Loading (`app/todos/loading.tsx`)

### Polish
- [ ] All 4 states (loading, error, empty, success)
- [ ] Toast notifications
- [ ] Responsive design
- [ ] Keyboard support (Enter to submit)

---

## shadcn Components Needed

```bash
bunx shadcn@latest add button input checkbox badge tabs dialog select skeleton
```

---

## Notes

- Data persists in browser localStorage
- Each user/browser has their own todos
- No API routes needed - all client-side
- Consider adding bulk actions (delete all completed) in Phase 2
- Search/filter by text could be added later