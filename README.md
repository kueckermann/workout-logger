# Workout Logger

A modern, progressive web application for tracking workouts with intelligent features like streak tracking, progress analysis, and workout scheduling.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16+** | React framework with App Router |
| **TypeScript 5+** | Type-safe development |
| **Tailwind CSS 4+** | Utility-first styling |
| **shadcn/ui** | Accessible component library |
| **TanStack Query 5+** | Server state & caching |
| **Zustand 5+** | Client-side state management |
| **Zod 3+** | Runtime validation |
| **Bun** | Fast runtime & package manager |

## Architecture Decisions

### 1. **Client-Side First Architecture**
- **localStorage** for data persistence
- No backend required - runs entirely in browser
- Fast, offline-capable, privacy-focused
- Data stays on user's device

### 2. **React Server Components (RSC)**
- Default to Server Components for data fetching
- Client Components only for interactivity (`'use client'`)
- Optimized bundle size and performance

### 3. **State Management Strategy**
```
┌─────────────────────────────────────┐
│ TanStack Query (Server State)      │
│ - Workouts, Settings, Streaks       │
│ - Caching & Invalidation            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ localStorage (Persistence)          │
│ - Single source of truth            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ Zustand (UI State - if needed)      │
│ - Modals, Forms, Transient State    │
└─────────────────────────────────────┘
```

### 4. **Type Safety Flow**
```typescript
Zod Schema → Validation → TypeScript Types → Components
```
- Define schemas with Zod
- Validate at runtime (forms, API, storage)
- Infer TypeScript types from schemas
- Full type safety across app

### 5. **Component Architecture**
```
app/
├── page.tsx              # Route entry (RSC)
├── layout.tsx            # Layout wrapper
└── providers.tsx         # TanStack Query setup

components/
├── ui/                   # shadcn/ui primitives
└── workout/              # Feature components
    ├── header.tsx
    ├── workout-logger.tsx
    ├── history-view.tsx
    └── calendar-view.tsx

lib/
├── hooks/                # TanStack Query hooks
├── types/                # TypeScript types
├── validators/           # Zod schemas
└── utils/                # Helper functions
```

### 6. **Data Flow Pattern**
```
User Action
    ↓
Component Event Handler
    ↓
TanStack Query Mutation
    ↓
Zod Validation
    ↓
localStorage Update
    ↓
Query Invalidation
    ↓
UI Re-render (Optimistic)
```

## Key Features

### Workout Tracking
- Pre-filled exercises from last workout
- Real-time progress indicators
- Ghost indicators showing weight changes
- Volume tracking and comparisons

### Smart Scheduling
- Weekly workout schedule
- Calendar view with workout tags
- Automatic streak calculation
- Custom workout support

### Progress Analysis
- Post-workout summary with motivational messages
- Set-by-set performance tracking
- Highest volume records by workout type
- Historical comparisons

### Data Integrity
- Automatic streak recalculation
- Schedule cleanup on workout deletion
- Proper timezone handling (Europe/Tallinn)
- Workout count-based "first workout" detection

## Getting Started

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun run build

# Start production server
bun start
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
workout-logger/
├── app/                  # Next.js App Router
│   ├── page.tsx         # Main workout page
│   ├── layout.tsx       # Root layout
│   └── globals.css      # Global styles
│
├── components/
│   ├── ui/              # shadcn/ui components
│   └── workout/         # Workout features
│
├── lib/
│   ├── hooks/           # TanStack Query hooks
│   │   ├── use-workouts.ts
│   │   ├── use-settings.ts
│   │   ├── use-streak.ts
│   │   └── use-custom-workouts.ts
│   ├── types/           # TypeScript definitions
│   ├── validators/      # Zod schemas
│   ├── storage/         # localStorage utilities
│   └── utils/           # Helper functions
│
├── SKILL.md             # Development guidelines
└── README.md            # This file
```

## Design Principles

1. **Atomic Components** - Small, focused, reusable
2. **Type Safety** - No `any`, strict TypeScript
3. **Performance** - RSC by default, minimal client JS
4. **Accessibility** - shadcn/ui components, semantic HTML
5. **User Privacy** - All data stored locally
6. **Progressive Enhancement** - Works offline, fast loading

## Development Guidelines

- Components max 150 lines
- Functions max 40 lines
- No `any` types - use `unknown` or specific types
- Zod for all validation
- TanStack Query for data fetching
- Follow shadcn/ui patterns

See [SKILL.md](./SKILL.md) for detailed development rules.

## License

MIT

## Future Improvements

- Correctly calculate volume for workouts with custom exercises
- Correctly calculates streak points
- Add instructions for custom workouts
- Add workout history comparison
- Fix responsive design to mobile

## My links

- [GitHub](https://github.com/)
- [Project on Vercel](https://workout-logger.vercel.app/)
- [YouTube](https://www.youtube.com/@)
